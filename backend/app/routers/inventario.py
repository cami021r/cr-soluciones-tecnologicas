import shutil
import uuid
from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.almacenamiento import DIRECTORIO_FOTOS, preparar_directorios, url_publica_de
from app.core.dependencies import requiere_roles
from app.database import get_db
from app.models.inventario import (
    CategoriaEquipo,
    Contrato,
    Equipo,
    EquipoContrato,
    FotoEquipo,
    MovimientoEquipo,
)
from app.models.usuarios import Usuario
from app.schemas.inventario import (
    CambioEstado,
    CategoriaRespuesta,
    EquipoActualizar,
    EquipoCrear,
    EquipoPaginado,
    EquipoRespuesta,
    FotoRespuesta,
    MovimientoRespuesta,
)
from app.services.imagenes import comprimir_a_webp
from app.services.qr import generar_qr

router = APIRouter(prefix="/inventario", tags=["Inventario"])

solo_tecnicos = requiere_roles("Administrador", "Técnico")
solo_admin = requiere_roles("Administrador")

EXTENSIONES_IMAGEN = {"image/jpeg", "image/png", "image/webp"}


def obtener_equipo(db: Session, equipo_id: int) -> Equipo:
    equipo = (
        db.query(Equipo)
        .filter(Equipo.id == equipo_id, Equipo.eliminado_en.is_(None))
        .one_or_none()
    )
    if equipo is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Equipo no encontrado")
    return equipo


@router.get("/categorias", response_model=list[CategoriaRespuesta])
def listar_categorias(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_tecnicos),
):
    return db.query(CategoriaEquipo).order_by(CategoriaEquipo.nombre).all()


@router.post("", response_model=EquipoRespuesta, status_code=status.HTTP_201_CREATED)
def registrar_equipo(
    datos: EquipoCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_tecnicos),
):
    categoria = db.query(CategoriaEquipo).get(datos.categoria_id)
    if categoria is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "La categoría no existe")

    existente = db.query(Equipo).filter(Equipo.numero_serie == datos.numero_serie).first()
    if existente is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya hay un equipo con ese número de serie")

    equipo = Equipo(**datos.model_dump())
    db.add(equipo)
    db.flush()  # necesitamos el id para vincular el QR

    equipo.qr_codigo = url_publica_de(generar_qr(equipo.id))

    db.add(
        MovimientoEquipo(
            equipo_id=equipo.id,
            usuario_id=usuario.id,
            estado_anterior=None,
            estado_nuevo=equipo.estado,
            observacion="Registro inicial del equipo",
        )
    )
    db.commit()
    db.refresh(equipo)
    return equipo


@router.get("", response_model=EquipoPaginado)
def listar_equipos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_tecnicos),
    estado: str | None = Query(default=None),
    categoria_id: int | None = Query(default=None),
    cliente_id: int | None = Query(default=None, description="Equipos bajo contrato del cliente"),
    buscar: str | None = Query(default=None, description="Marca, modelo o número de serie"),
    pagina: int = Query(default=1, ge=1),
    por_pagina: int = Query(default=20, ge=1, le=100),
):
    consulta = db.query(Equipo).filter(Equipo.eliminado_en.is_(None))

    if estado is not None:
        consulta = consulta.filter(Equipo.estado == estado)
    if categoria_id is not None:
        consulta = consulta.filter(Equipo.categoria_id == categoria_id)
    if cliente_id is not None:
        consulta = (
            consulta.join(EquipoContrato, EquipoContrato.equipo_id == Equipo.id)
            .join(Contrato, Contrato.id == EquipoContrato.contrato_id)
            .filter(Contrato.cliente_id == cliente_id, Contrato.eliminado_en.is_(None))
        )
    if buscar:
        patron = f"%{buscar}%"
        consulta = consulta.filter(
            Equipo.marca.like(patron)
            | Equipo.modelo.like(patron)
            | Equipo.numero_serie.like(patron)
        )

    total = consulta.count()
    resultados = (
        consulta.order_by(Equipo.id.desc())
        .offset((pagina - 1) * por_pagina)
        .limit(por_pagina)
        .all()
    )
    return EquipoPaginado(
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        resultados=[EquipoRespuesta.model_validate(e) for e in resultados],
    )


@router.get("/{equipo_id}", response_model=EquipoRespuesta)
def detalle_equipo(
    equipo_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_tecnicos),
):
    return obtener_equipo(db, equipo_id)


@router.patch("/{equipo_id}", response_model=EquipoRespuesta)
def actualizar_equipo(
    equipo_id: int,
    datos: EquipoActualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_tecnicos),
):
    equipo = obtener_equipo(db, equipo_id)
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(equipo, campo, valor)
    db.commit()
    db.refresh(equipo)
    return equipo


@router.patch("/{equipo_id}/estado", response_model=EquipoRespuesta)
def cambiar_estado(
    equipo_id: int,
    datos: CambioEstado,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_tecnicos),
):
    equipo = obtener_equipo(db, equipo_id)
    if equipo.estado == datos.estado_nuevo:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "El equipo ya está en ese estado")

    db.add(
        MovimientoEquipo(
            equipo_id=equipo.id,
            usuario_id=usuario.id,
            estado_anterior=equipo.estado,
            estado_nuevo=datos.estado_nuevo,
            observacion=datos.observacion,
        )
    )
    equipo.estado = datos.estado_nuevo
    db.commit()
    db.refresh(equipo)
    return equipo


@router.get("/{equipo_id}/historial", response_model=list[MovimientoRespuesta])
def historial_equipo(
    equipo_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_tecnicos),
):
    obtener_equipo(db, equipo_id)
    return (
        db.query(MovimientoEquipo)
        .filter(MovimientoEquipo.equipo_id == equipo_id)
        .order_by(MovimientoEquipo.fecha.desc(), MovimientoEquipo.id.desc())
        .all()
    )


@router.post(
    "/{equipo_id}/fotos", response_model=FotoRespuesta, status_code=status.HTTP_201_CREATED
)
def subir_foto(
    equipo_id: int,
    tareas: BackgroundTasks,
    archivo: UploadFile = File(...),
    es_principal: bool = False,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_tecnicos),
):
    equipo = obtener_equipo(db, equipo_id)
    if archivo.content_type not in EXTENSIONES_IMAGEN:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Solo se aceptan imágenes JPEG, PNG o WebP"
        )

    preparar_directorios()
    nombre = f"equipo_{equipo.id}_{uuid.uuid4().hex}"
    original = DIRECTORIO_FOTOS / f"{nombre}.original"
    comprimida = DIRECTORIO_FOTOS / f"{nombre}.webp"

    with original.open("wb") as destino:
        shutil.copyfileobj(archivo.file, destino)

    # La conversión a WebP corre en segundo plano para no demorar la respuesta
    tareas.add_task(comprimir_a_webp, original, comprimida)

    if es_principal:
        db.query(FotoEquipo).filter(FotoEquipo.equipo_id == equipo.id).update(
            {"es_principal": False}
        )

    foto = FotoEquipo(
        equipo_id=equipo.id,
        url_foto=url_publica_de(comprimida),
        es_principal=es_principal,
    )
    db.add(foto)
    db.commit()
    db.refresh(foto)
    return foto


@router.get("/{equipo_id}/qr")
def descargar_qr(
    equipo_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_tecnicos),
):
    """Devuelve el PNG del QR listo para imprimir y pegar en el equipo."""
    equipo = obtener_equipo(db, equipo_id)
    archivo = generar_qr(equipo.id)
    if equipo.qr_codigo is None:
        equipo.qr_codigo = url_publica_de(archivo)
        db.commit()
    return FileResponse(archivo, media_type="image/png", filename=f"qr_equipo_{equipo.id}.png")


@router.delete("/{equipo_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_equipo(
    equipo_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_admin),
):
    """Borrado lógico: el historial del equipo nunca se pierde."""
    equipo = obtener_equipo(db, equipo_id)
    equipo.eliminado_en = datetime.now(timezone.utc)
    db.commit()

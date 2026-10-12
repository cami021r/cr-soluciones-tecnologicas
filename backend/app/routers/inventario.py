import shutil
import uuid
from datetime import datetime, timezone

from app.core.dependencies import requiere_roles, obtener_usuario_actual
from app.models.cotizaciones import Cliente

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


def _construir_equipo_respuesta(e: Equipo) -> EquipoRespuesta:
    c_user = e.cliente.usuario if e.cliente else None
    return EquipoRespuesta(
        id=e.id,
        categoria_id=e.categoria_id,
        categoria_nombre=e.categoria.nombre if e.categoria else None,
        numero_serie=e.numero_serie,
        marca=e.marca,
        modelo=e.modelo,
        descripcion=e.descripcion,
        estado=e.estado,
        fecha_compra=e.fecha_compra,
        garantia_hasta=e.garantia_hasta,
        cliente_id=e.cliente_id,
        cliente_nombre=c_user.nombre_completo if c_user else None,
        cliente_empresa=e.cliente.nombre_empresa if e.cliente else None,
        tipo_relacion=e.tipo_relacion or "empresa",
        qr_codigo=e.qr_codigo,
        creado_en=e.creado_en,
        fotos=[FotoRespuesta.model_validate(f) for f in (e.fotos or [])],
        movimientos=[MovimientoRespuesta.model_validate(m) for m in (e.movimientos or [])],
    )


@router.get("/mis-equipos", response_model=list[EquipoRespuesta])
def listar_mis_equipos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    """Devuelve los equipos vinculados directamente o bajo contrato del cliente autenticado."""
    cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario.id).first()
    if not cliente:
        return []

    equipos = (
        db.query(Equipo)
        .filter(Equipo.cliente_id == cliente.id, Equipo.eliminado_en.is_(None))
        .all()
    )
    return [_construir_equipo_respuesta(e) for e in equipos]


@router.get("", response_model=EquipoPaginado)
def listar_equipos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_tecnicos),
    estado: str | None = Query(default=None),
    categoria_id: int | None = Query(default=None),
    cliente_id: int | None = Query(default=None, description="Filtrar por cliente"),
    segmento: str | None = Query(default=None, description="'empresa' para stock propio, 'cliente' para asignados a clientes"),
    tipo_relacion: str | None = Query(default=None, description="'empresa', 'venta', 'arriendo'"),
    buscar: str | None = Query(default=None, description="Marca, modelo o número de serie"),
    pagina: int = Query(default=1, ge=1),
    por_pagina: int = Query(default=50, ge=1, le=100),
):
    consulta = db.query(Equipo).filter(Equipo.eliminado_en.is_(None))

    if segmento == "empresa":
        consulta = consulta.filter(
            (Equipo.cliente_id.is_(None)) | (Equipo.tipo_relacion == "empresa")
        )
    elif segmento == "cliente":
        consulta = consulta.filter(
            Equipo.cliente_id.is_not(None),
            Equipo.tipo_relacion.in_(["venta", "arriendo"]),
        )

    if tipo_relacion is not None:
        consulta = consulta.filter(Equipo.tipo_relacion == tipo_relacion)
    if estado is not None:
        consulta = consulta.filter(Equipo.estado == estado)
    if categoria_id is not None:
        consulta = consulta.filter(Equipo.categoria_id == categoria_id)
    if cliente_id is not None:
        consulta = consulta.filter(Equipo.cliente_id == cliente_id)
    if buscar:
        patron = f"%{buscar.strip()}%"
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
        resultados=[_construir_equipo_respuesta(e) for e in resultados],
    )


@router.get("/{equipo_id}", response_model=EquipoRespuesta)
def detalle_equipo(
    equipo_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_tecnicos),
):
    return _construir_equipo_respuesta(obtener_equipo(db, equipo_id))


@router.patch("/{equipo_id}", response_model=EquipoRespuesta)
def actualizar_equipo(
    equipo_id: int,
    datos: EquipoActualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_tecnicos),
):
    equipo = obtener_equipo(db, equipo_id)
    estado_anterior = equipo.estado
    campos_modificados = []

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        if campo == "observacion_cambio":
            continue
        if getattr(equipo, campo) != valor:
            campos_modificados.append(f"{campo}: {getattr(equipo, campo)} -> {valor}")
            setattr(equipo, campo, valor)

    if campos_modificados:
        obs = datos.observacion_cambio or f"Actualización: {', '.join(campos_modificados)}"
        mov = MovimientoEquipo(
            equipo_id=equipo.id,
            usuario_id=usuario.id,
            estado_anterior=estado_anterior,
            estado_nuevo=equipo.estado,
            observacion=obs,
        )
        db.add(mov)

    db.commit()
    db.refresh(equipo)
    return _construir_equipo_respuesta(equipo)


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

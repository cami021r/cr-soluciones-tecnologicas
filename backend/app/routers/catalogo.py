from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import obtener_usuario_actual, requiere_roles
from app.database import get_db
from app.models.catalogo import PreguntaClaveServicio, ServicioCatalogo
from app.models.usuarios import Usuario
from app.schemas.catalogo import (
    PreguntaClaveActualizar,
    PreguntaClaveCrear,
    PreguntaClaveRespuesta,
    ServicioCatalogoActualizar,
    ServicioCatalogoCrear,
    ServicioCatalogoRespuesta,
    ServicioCatalogoSimple,
)

router = APIRouter(prefix="/catalogo", tags=["Catálogo Comercial"])

solo_personal_tecnico = requiere_roles("Administrador", "Técnico")
solo_administradores = requiere_roles("Administrador")


# ===========================================================================
# PASO 5.2: SERVICIOS TÉCNICOS Y PREGUNTAS CLAVE
# ===========================================================================

@router.post(
    "/servicios",
    response_model=ServicioCatalogoRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un nuevo servicio técnico",
)
def crear_servicio(
    datos: ServicioCatalogoCrear,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_personal_tecnico),
):
    """Crea un servicio técnico en el catálogo, con sus preguntas clave iniciales."""
    # Verificar si ya existe un servicio activo con el mismo nombre
    existente = (
        db.query(ServicioCatalogo)
        .filter(
            func.lower(ServicioCatalogo.nombre) == datos.nombre.lower().strip(),
            ServicioCatalogo.eliminado_en.is_(None),
        )
        .first()
    )
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un servicio activo con el nombre '{datos.nombre}'",
        )

    nuevo_servicio = ServicioCatalogo(
        nombre=datos.nombre.strip(),
        descripcion=datos.descripcion.strip() if datos.descripcion else None,
        precio_mano_obra=datos.precio_mano_obra,
        horas_estimadas=datos.horas_estimadas,
        activo=True,
    )
    db.add(nuevo_servicio)
    db.flush()  # Para obtener nuevo_servicio.id

    # Asociar preguntas clave si se enviaron
    for p in datos.preguntas_clave:
        pregunta = PreguntaClaveServicio(
            servicio_id=nuevo_servicio.id,
            pregunta=p.pregunta.strip(),
            tipo_respuesta=p.tipo_respuesta,
            obligatoria=p.obligatoria,
            orden=p.orden,
        )
        db.add(pregunta)

    db.commit()
    db.refresh(nuevo_servicio)
    return nuevo_servicio


@router.get(
    "/servicios",
    response_model=list[ServicioCatalogoRespuesta],
    summary="Listar servicios técnicos del catálogo",
)
def listar_servicios(
    solo_activos: bool = Query(default=True, description="Filtrar solo servicios activos"),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """Obtiene la lista de servicios con sus preguntas clave ordenadas."""
    query = (
        db.query(ServicioCatalogo)
        .options(joinedload(ServicioCatalogo.preguntas_clave))
        .filter(ServicioCatalogo.eliminado_en.is_(None))
    )
    if solo_activos:
        query = query.filter(ServicioCatalogo.activo.is_(True))

    servicios = query.order_by(ServicioCatalogo.nombre.asc()).all()
    return servicios


@router.get(
    "/servicios/{servicio_id}",
    response_model=ServicioCatalogoRespuesta,
    summary="Consultar detalle de un servicio por ID",
)
def obtener_servicio(
    servicio_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """Devuelve la información completa de un servicio y sus preguntas clave."""
    servicio = (
        db.query(ServicioCatalogo)
        .options(joinedload(ServicioCatalogo.preguntas_clave))
        .filter(
            ServicioCatalogo.id == servicio_id,
            ServicioCatalogo.eliminado_en.is_(None),
        )
        .first()
    )
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicio con ID {servicio_id} no encontrado",
        )
    return servicio


@router.put(
    "/servicios/{servicio_id}",
    response_model=ServicioCatalogoRespuesta,
    summary="Editar un servicio técnico existente",
)
def actualizar_servicio(
    servicio_id: int,
    datos: ServicioCatalogoActualizar,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_personal_tecnico),
):
    """Actualiza datos básicos de un servicio (nombre, descripción, precio, horas, estado activo)."""
    servicio = (
        db.query(ServicioCatalogo)
        .filter(
            ServicioCatalogo.id == servicio_id,
            ServicioCatalogo.eliminado_en.is_(None),
        )
        .first()
    )
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicio con ID {servicio_id} no encontrado",
        )

    if datos.nombre is not None:
        nombre_limpio = datos.nombre.strip()
        existente = (
            db.query(ServicioCatalogo)
            .filter(
                func.lower(ServicioCatalogo.nombre) == nombre_limpio.lower(),
                ServicioCatalogo.id != servicio_id,
                ServicioCatalogo.eliminado_en.is_(None),
            )
            .first()
        )
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe otro servicio activo con el nombre '{nombre_limpio}'",
            )
        servicio.nombre = nombre_limpio

    if datos.descripcion is not None:
        servicio.descripcion = datos.descripcion.strip() if datos.descripcion else None
    if datos.precio_mano_obra is not None:
        servicio.precio_mano_obra = datos.precio_mano_obra
    if datos.horas_estimadas is not None:
        servicio.horas_estimadas = datos.horas_estimadas
    if datos.activo is not None:
        servicio.activo = datos.activo

    db.commit()
    db.refresh(servicio)
    return servicio


@router.delete(
    "/servicios/{servicio_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar un servicio técnico (Soft Delete)",
)
def eliminar_servicio(
    servicio_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_administradores),
):
    """Aplica borrado lógico al servicio técnico protegiendo el histórico."""
    servicio = (
        db.query(ServicioCatalogo)
        .filter(
            ServicioCatalogo.id == servicio_id,
            ServicioCatalogo.eliminado_en.is_(None),
        )
        .first()
    )
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicio con ID {servicio_id} no encontrado",
        )

    servicio.activo = False
    servicio.eliminado_en = datetime.now(timezone.utc)
    db.commit()
    return {"mensaje": f"Servicio '{servicio.nombre}' eliminado correctamente del catálogo"}


# ---------------------------------------------------------------------------
# GESTIÓN DE PREGUNTAS CLAVE POR SERVICIO
# ---------------------------------------------------------------------------

@router.post(
    "/servicios/{servicio_id}/preguntas",
    response_model=PreguntaClaveRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Añadir una pregunta clave a un servicio",
)
def agregar_pregunta_clave(
    servicio_id: int,
    datos: PreguntaClaveCrear,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_personal_tecnico),
):
    """Agrega una nueva pregunta clave a un servicio técnico existente."""
    servicio = (
        db.query(ServicioCatalogo)
        .filter(
            ServicioCatalogo.id == servicio_id,
            ServicioCatalogo.eliminado_en.is_(None),
        )
        .first()
    )
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicio con ID {servicio_id} no encontrado",
        )

    nueva_pregunta = PreguntaClaveServicio(
        servicio_id=servicio_id,
        pregunta=datos.pregunta.strip(),
        tipo_respuesta=datos.tipo_respuesta,
        obligatoria=datos.obligatoria,
        orden=datos.orden,
    )
    db.add(nueva_pregunta)
    db.commit()
    db.refresh(nueva_pregunta)
    return nueva_pregunta


@router.put(
    "/servicios/{servicio_id}/preguntas/{pregunta_id}",
    response_model=PreguntaClaveRespuesta,
    summary="Actualizar una pregunta clave existente",
)
def actualizar_pregunta_clave(
    servicio_id: int,
    pregunta_id: int,
    datos: PreguntaClaveActualizar,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_personal_tecnico),
):
    """Modifica el texto, tipo o condición de una pregunta clave."""
    pregunta = (
        db.query(PreguntaClaveServicio)
        .filter(
            PreguntaClaveServicio.id == pregunta_id,
            PreguntaClaveServicio.servicio_id == servicio_id,
        )
        .first()
    )
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pregunta con ID {pregunta_id} no encontrada para el servicio {servicio_id}",
        )

    if datos.pregunta is not None:
        pregunta.pregunta = datos.pregunta.strip()
    if datos.tipo_respuesta is not None:
        pregunta.tipo_respuesta = datos.tipo_respuesta
    if datos.obligatoria is not None:
        pregunta.obligatoria = datos.obligatoria
    if datos.orden is not None:
        pregunta.orden = datos.orden

    db.commit()
    db.refresh(pregunta)
    return pregunta


@router.delete(
    "/servicios/{servicio_id}/preguntas/{pregunta_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar una pregunta clave de un servicio",
)
def eliminar_pregunta_clave(
    servicio_id: int,
    pregunta_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_personal_tecnico),
):
    """Elimina físicamente una pregunta clave de un servicio."""
    pregunta = (
        db.query(PreguntaClaveServicio)
        .filter(
            PreguntaClaveServicio.id == pregunta_id,
            PreguntaClaveServicio.servicio_id == servicio_id,
        )
        .first()
    )
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pregunta con ID {pregunta_id} no encontrada para el servicio {servicio_id}",
        )

    db.delete(pregunta)
    db.commit()
    return {"mensaje": f"Pregunta ID {pregunta_id} eliminada correctamente"}

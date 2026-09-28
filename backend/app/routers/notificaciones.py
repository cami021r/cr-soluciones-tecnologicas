from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import obtener_usuario_actual, requiere_roles
from app.database import get_db
from app.models.notificaciones import LogNotificacion
from app.models.usuarios import Usuario
from app.schemas.notificaciones import (
    LogNotificacionRespuesta,
    ProbarAlertaRequest,
    ProbarAlertaRespuesta,
)
from app.services.notificaciones import ejecutar_tarea_notificacion_asincrona

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones y Mensajería Asíncrona"])

solo_admin = requiere_roles("Administrador")
personal_autorizado = requiere_roles("Administrador", "Técnico")


@router.get(
    "/historial",
    response_model=list[LogNotificacionRespuesta],
    summary="Consultar historial de notificaciones enviadas",
)
def obtener_historial_notificaciones(
    limite: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(personal_autorizado),
):
    return (
        db.query(LogNotificacion)
        .order_by(LogNotificacion.creado_en.desc())
        .limit(limite)
        .all()
    )


@router.post(
    "/probar-alerta",
    response_model=ProbarAlertaRespuesta,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Disparar alerta asíncrona de prueba (BackgroundTasks)",
)
def probar_envio_alerta(
    datos: ProbarAlertaRequest,
    background_tasks: BackgroundTasks,
    usuario: Usuario = Depends(personal_autorizado),
):
    """
    Encola la notificación en una tarea en segundo plano (BackgroundTasks)
    para retornar 202 Accepted en milisegundos sin bloquear la conexión del cliente.
    """
    payload = {
        "mensaje": datos.mensaje_personalizado or "Prueba de conectividad del sistema de alertas C&R",
        "usuario_nombre": usuario.nombre_completo,
    }

    background_tasks.add_task(
        ejecutar_tarea_notificacion_asincrona,
        tipo_evento=datos.tipo_evento,
        datos=payload,
        usuario_id=usuario.id,
    )

    return ProbarAlertaRespuesta(
        mensaje="Alerta encolada exitosamente para despacho asíncrono",
        canal="telegram",
        estado="encolada",
        tarea_asincrona=True,
    )

from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class LogNotificacionRespuesta(BaseModel):
    id: int
    usuario_id: int
    tipo_evento: str
    canal: str
    mensaje: str
    estado: str
    intentos: int
    creado_en: datetime

    model_config = ConfigDict(from_attributes=True)


class ProbarAlertaRequest(BaseModel):
    tipo_evento: Literal[
        "nuevo_ticket",
        "cotizacion_aceptada",
        "cambio_estado_ticket",
        "contrato_por_vencer",
        "prueba_sistema",
    ] = "prueba_sistema"
    destinatario_email: str | None = None
    mensaje_personalizado: str | None = None


class ProbarAlertaRespuesta(BaseModel):
    mensaje: str
    canal: str
    estado: str
    tarea_asincrona: bool

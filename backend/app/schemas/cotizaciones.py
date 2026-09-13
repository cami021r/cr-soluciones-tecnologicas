from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

EstadoConversacion = Literal["activa", "cerrada", "cotizacion_generada"]
RolMensaje = Literal["user", "assistant"]
EstadoCotizacion = Literal["pendiente", "aceptada", "rechazada", "ajuste_solicitado"]
TipoItemCotizacion = Literal["servicio", "producto"]


# ---------------------------------------------------------------------------
# MENSAJES Y CONVERSACIÓN
# ---------------------------------------------------------------------------
class MensajeCrear(BaseModel):
    contenido: str = Field(..., min_length=1, max_length=2000, description="Mensaje del cliente")


class MensajeRespuesta(BaseModel):
    id: int
    rol: RolMensaje
    contenido: str
    creado_en: datetime

    class Config:
        from_attributes = True


class ConversacionRespuesta(BaseModel):
    id: int
    cliente_id: int
    estado: EstadoConversacion
    creado_en: datetime
    mensajes: list[MensajeRespuesta] = []

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# ITEMS Y COTIZACIÓN
# ---------------------------------------------------------------------------
class ItemCotizacionRespuesta(BaseModel):
    id: int
    tipo_item: TipoItemCotizacion
    servicio_id: int | None = None
    producto_id: int | None = None
    descripcion: str
    cantidad: Decimal
    precio_unitario: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True


class CotizacionRespuesta(BaseModel):
    id: int
    cliente_id: int
    conversacion_id: int | None = None
    subtotal: Decimal
    total: Decimal
    estado: EstadoCotizacion
    url_pdf: str | None = None
    fecha_vencimiento: date | None = None
    creado_en: datetime
    items: list[ItemCotizacionRespuesta] = []

    class Config:
        from_attributes = True


class CambiarEstadoCotizacion(BaseModel):
    estado: Literal["aceptada", "rechazada", "ajuste_solicitado"]
    observacion: str | None = None


# ---------------------------------------------------------------------------
# RESPUESTA COMPLETA DE INTERACCIÓN EN CHAT
# ---------------------------------------------------------------------------
class ChatTurnoRespuesta(BaseModel):
    conversacion_id: int
    respuesta_ia: str
    es_cotizacion: bool
    cotizacion: CotizacionRespuesta | None = None

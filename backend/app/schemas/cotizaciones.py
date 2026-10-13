from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

EstadoConversacion = Literal["activa", "cerrada", "cotizacion_generada"]
RolMensaje = Literal["user", "assistant"]
EstadoCotizacion = Literal[
    "pendiente",
    "aceptada",
    "aprobada",
    "contactado",
    "agendado",
    "en_ejecucion",
    "concretado",
    "en_ajuste",
    "rechazada",
    "ajuste_solicitado",
]
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
class ItemCotizacionCrear(BaseModel):
    tipo_item: TipoItemCotizacion = "servicio"
    servicio_id: int | None = None
    producto_id: int | None = None
    descripcion: str
    cantidad: Decimal = Decimal("1.00")
    precio_unitario: Decimal = Decimal("0.00")


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


class HistorialEstadoCotizacionRespuesta(BaseModel):
    id: int
    cotizacion_id: int
    estado: str
    usuario_id: int | None = None
    usuario_nombre: str | None = None
    observacion: str | None = None
    creado_en: datetime

    class Config:
        from_attributes = True


class CotizacionRespuesta(BaseModel):
    id: int
    cliente_id: int
    cliente_nombre: str | None = None
    cliente_email: str | None = None
    cliente_telefono: str | None = None
    cliente_empresa: str | None = None
    conversacion_id: int | None = None
    subtotal: Decimal
    descuento: Decimal = Decimal("0.00")
    porcentaje_iva: Decimal = Decimal("19.00")
    iva: Decimal = Decimal("0.00")
    total: Decimal
    estado: str
    notas_internas: str | None = None
    ingreso_confirmado: bool = False
    fecha_visita_agendada: datetime | None = None
    url_pdf: str | None = None
    fecha_vencimiento: date | None = None
    creado_en: datetime
    eliminado_en: datetime | None = None
    items: list[ItemCotizacionRespuesta] = []
    historial: list[HistorialEstadoCotizacionRespuesta] = []

    class Config:
        from_attributes = True


class CotizacionActualizar(BaseModel):
    descuento: Decimal | None = None
    porcentaje_iva: Decimal | None = None
    fecha_vencimiento: date | None = None
    notas_internas: str | None = None
    fecha_visita_agendada: datetime | None = None
    items: list[ItemCotizacionCrear] | None = None


class CambiarEstadoCotizacion(BaseModel):
    estado: str
    observacion: str | None = None
    fecha_visita: datetime | None = None
    confirmar_ingreso: bool | None = False


# ---------------------------------------------------------------------------
# RESPUESTA COMPLETA DE INTERACCIÓN EN CHAT
# ---------------------------------------------------------------------------
class ChatTurnoRespuesta(BaseModel):
    conversacion_id: int
    respuesta_ia: str
    es_cotizacion: bool
    cotizacion: CotizacionRespuesta | None = None

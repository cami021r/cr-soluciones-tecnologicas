from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

PrioridadTicket = Literal["baja", "media", "alta"]
EstadoTicket = Literal["abierto", "en_proceso", "resuelto", "cerrado"]

# Límites de SLA sugeridos (en horas)
SLA_HORAS = {
    "alta": 8,
    "media": 24,
    "baja": 48,
}


# ---------------------------------------------------------------------------
# COMENTARIOS Y BITÁCORAS
# ---------------------------------------------------------------------------
class ComentarioCrear(BaseModel):
    contenido: str = Field(..., min_length=1, max_length=2000, description="Texto del comentario o avance técnico")
    es_interno: bool = Field(default=False, description="True para bitácora técnica privada, False para visible al cliente")


class ComentarioRespuesta(BaseModel):
    id: int
    ticket_id: int
    usuario_id: int
    usuario_nombre: str | None = None
    usuario_rol: str | None = None
    contenido: str
    es_interno: bool
    creado_en: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# TICKETS DE SOPORTE
# ---------------------------------------------------------------------------
class TicketCrear(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=200)
    descripcion: str = Field(..., min_length=5)
    prioridad: PrioridadTicket = "media"
    categoria: str | None = Field(default="red", description="software, hardware, red, cctv")
    modalidad: str | None = Field(default="remota", description="remota o presencial")
    fecha_visita: datetime | None = None
    equipo_id: int | None = Field(default=None, description="ID del equipo del inventario reportado (opcional)")


class TicketActualizar(BaseModel):
    titulo: str | None = Field(default=None, min_length=3, max_length=200)
    descripcion: str | None = None
    prioridad: PrioridadTicket | None = None
    categoria: str | None = None
    modalidad: str | None = None
    fecha_visita: datetime | None = None
    tecnico_id: int | None = None


class TicketCambiarEstado(BaseModel):
    estado_nuevo: EstadoTicket
    observacion: str | None = Field(default=None, description="Motivo del cambio de estado o diagnóstico")


class TicketRespuesta(BaseModel):
    id: int
    cliente_id: int
    cliente_nombre: str | None = None
    cliente_email: str | None = None
    cliente_telefono: str | None = None
    cliente_empresa: str | None = None
    equipo_id: int | None = None
    equipo_nombre: str | None = None
    tecnico_id: int | None = None
    tecnico_nombre: str | None = None
    titulo: str
    descripcion: str
    prioridad: PrioridadTicket
    estado: EstadoTicket
    categoria: str | None = "red"
    modalidad: str | None = "remota"
    fecha_visita: datetime | None = None
    creado_en: datetime
    cerrado_en: datetime | None = None
    sla_limite_horas: int = 24
    comentarios: list[ComentarioRespuesta] = []

    class Config:
        from_attributes = True


class TicketListadoItem(BaseModel):
    """Respuesta compacta para listados de mesa de ayuda."""
    id: int
    cliente_id: int
    cliente_nombre: str | None = None
    cliente_email: str | None = None
    cliente_telefono: str | None = None
    cliente_empresa: str | None = None
    equipo_id: int | None = None
    equipo_nombre: str | None = None
    tecnico_id: int | None = None
    tecnico_nombre: str | None = None
    titulo: str
    descripcion: str | None = None
    prioridad: PrioridadTicket
    estado: EstadoTicket
    categoria: str | None = "red"
    modalidad: str | None = "remota"
    fecha_visita: datetime | None = None
    creado_en: datetime
    cerrado_en: datetime | None = None
    sla_limite_horas: int = 24

    class Config:
        from_attributes = True

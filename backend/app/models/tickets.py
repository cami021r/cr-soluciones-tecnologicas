from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base

PRIORIDADES_TICKET = ("baja", "media", "alta")
ESTADOS_TICKET = ("abierto", "en_proceso", "resuelto", "cerrado")


class Ticket(Base):
    """Modelo para tickets de soporte técnico e incidentes en C&R."""

    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False, index=True)
    equipo_id = Column(Integer, ForeignKey("equipos.id"), nullable=True, index=True)
    tecnico_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)

    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=False)
    prioridad = Column(
        Enum(*PRIORIDADES_TICKET, name="prioridad_ticket_enum"),
        nullable=False,
        default="media",
    )
    estado = Column(
        Enum(*ESTADOS_TICKET, name="estado_ticket_enum"),
        nullable=False,
        default="abierto",
    )

    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    cerrado_en = Column(DateTime(timezone=True), nullable=True)
    eliminado_en = Column(DateTime(timezone=True), nullable=True)  # Soft delete

    # Relaciones
    cliente = relationship("Cliente")
    equipo = relationship("Equipo")
    tecnico = relationship("Usuario", foreign_keys=[tecnico_id])
    comentarios = relationship(
        "ComentarioTicket",
        back_populates="ticket",
        order_by="ComentarioTicket.creado_en",
        cascade="all, delete-orphan",
    )


class ComentarioTicket(Base):
    """Comentarios de seguimiento, bitácoras internas de técnicos y notas de auditoría."""

    __tablename__ = "comentarios_ticket"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    contenido = Column(Text, nullable=False)
    es_interno = Column(Boolean, nullable=False, default=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("Ticket", back_populates="comentarios")
    usuario = relationship("Usuario")

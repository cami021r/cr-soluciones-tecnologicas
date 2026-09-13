from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base

TIPOS_CLIENTE = ("persona", "empresa")
ESTADOS_CONVERSACION = ("activa", "cerrada", "cotizacion_generada")
ROLES_MENSAJE = ("user", "assistant")
ESTADOS_COTIZACION = ("pendiente", "aceptada", "rechazada", "ajuste_solicitado")
TIPOS_ITEM_COTIZACION = ("servicio", "producto")


class Cliente(Base):
    """Modelo de cliente vinculado a un usuario de autenticación."""

    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    nombre_empresa = Column(String(150), nullable=True)
    tipo = Column(
        Enum(*TIPOS_CLIENTE, name="tipo_cliente_enum"),
        nullable=False,
        default="persona",
    )
    documento = Column(String(20), unique=True, nullable=False, index=True)
    telefono_alt = Column(String(20), nullable=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    eliminado_en = Column(DateTime(timezone=True), nullable=True)

    usuario = relationship("Usuario")
    conversaciones = relationship("ConversacionChat", back_populates="cliente")
    cotizaciones = relationship("Cotizacion", back_populates="cliente")


class ConversacionChat(Base):
    """Sesión de conversación del chatbot con un cliente."""

    __tablename__ = "conversaciones_chat"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False, index=True)
    estado = Column(
        Enum(*ESTADOS_CONVERSACION, name="estado_conversacion_enum"),
        nullable=False,
        default="activa",
    )
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    cliente = relationship("Cliente", back_populates="conversaciones")
    mensajes = relationship(
        "MensajeChat",
        back_populates="conversacion",
        order_by="MensajeChat.creado_en",
        cascade="all, delete-orphan",
    )
    cotizaciones = relationship("Cotizacion", back_populates="conversacion")


class MensajeChat(Base):
    """Mensajes individuales intercambiados en la sesión de chat."""

    __tablename__ = "mensajes_chat"

    id = Column(Integer, primary_key=True, index=True)
    conversacion_id = Column(
        Integer, ForeignKey("conversaciones_chat.id"), nullable=False, index=True
    )
    rol = Column(
        Enum(*ROLES_MENSAJE, name="rol_mensaje_enum"),
        nullable=False,
    )
    contenido = Column(Text, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    conversacion = relationship("ConversacionChat", back_populates="mensajes")


class Cotizacion(Base):
    """Registro formal de una cotización generada a partir del chat o del panel."""

    __tablename__ = "cotizaciones"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False, index=True)
    conversacion_id = Column(
        Integer, ForeignKey("conversaciones_chat.id"), nullable=True, index=True
    )
    subtotal = Column(Numeric(10, 2), nullable=False, default=0.00)
    total = Column(Numeric(10, 2), nullable=False, default=0.00)
    estado = Column(
        Enum(*ESTADOS_COTIZACION, name="estado_cotizacion_enum"),
        nullable=False,
        default="pendiente",
    )
    url_pdf = Column(String(500), nullable=True)
    fecha_vencimiento = Column(Date, nullable=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    eliminado_en = Column(DateTime(timezone=True), nullable=True)  # Soft delete

    cliente = relationship("Cliente", back_populates="cotizaciones")
    conversacion = relationship("ConversacionChat", back_populates="cotizaciones")
    items = relationship(
        "ItemCotizacion",
        back_populates="cotizacion",
        cascade="all, delete-orphan",
    )


class ItemCotizacion(Base):
    """Línea de detalle en una cotización (servicio o producto externo)."""

    __tablename__ = "items_cotizacion"

    id = Column(Integer, primary_key=True, index=True)
    cotizacion_id = Column(
        Integer, ForeignKey("cotizaciones.id"), nullable=False, index=True
    )
    tipo_item = Column(
        Enum(*TIPOS_ITEM_COTIZACION, name="tipo_item_cotizacion_enum"),
        nullable=False,
    )
    servicio_id = Column(
        Integer, ForeignKey("servicios_catalogo.id"), nullable=True, index=True
    )
    producto_id = Column(
        Integer, ForeignKey("productos_externos.id"), nullable=True, index=True
    )
    descripcion = Column(String(300), nullable=False)
    cantidad = Column(Numeric(8, 2), nullable=False, default=1.00)
    precio_unitario = Column(Numeric(10, 2), nullable=False, default=0.00)
    subtotal = Column(Numeric(10, 2), nullable=False, default=0.00)

    cotizacion = relationship("Cotizacion", back_populates="items")
    servicio = relationship("ServicioCatalogo")
    producto = relationship("ProductoExterno")

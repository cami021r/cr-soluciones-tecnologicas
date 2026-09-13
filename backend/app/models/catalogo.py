from sqlalchemy import (
    Boolean,
    Column,
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

TIPOS_RESPUESTA_PREGUNTA = ("numero", "texto", "si_no", "seleccion")


class Proveedor(Base):
    """Modelo para proveedores externos de repuestos y productos."""

    __tablename__ = "proveedores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    contacto = Column(String(100), nullable=True)
    telefono = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)
    activo = Column(Boolean, nullable=False, default=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    productos = relationship("ProductoExterno", back_populates="proveedor")


class ServicioCatalogo(Base):
    """Modelo para servicios técnicos de C&R."""

    __tablename__ = "servicios_catalogo"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio_mano_obra = Column(Numeric(10, 2), nullable=False, default=0.00)
    horas_estimadas = Column(Numeric(5, 2), nullable=False, default=1.00)
    activo = Column(Boolean, nullable=False, default=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    eliminado_en = Column(DateTime(timezone=True), nullable=True)  # Soft delete

    preguntas_clave = relationship(
        "PreguntaClaveServicio",
        back_populates="servicio",
        cascade="all, delete-orphan",
        order_by="PreguntaClaveServicio.orden",
    )


class PreguntaClaveServicio(Base):
    """Preguntas guía requeridas para cotizar un servicio técnico."""

    __tablename__ = "preguntas_clave_servicio"

    id = Column(Integer, primary_key=True, index=True)
    servicio_id = Column(
        Integer, ForeignKey("servicios_catalogo.id"), nullable=False, index=True
    )
    pregunta = Column(String(300), nullable=False)
    tipo_respuesta = Column(
        Enum(*TIPOS_RESPUESTA_PREGUNTA, name="tipo_respuesta_enum"),
        nullable=False,
        default="texto",
    )
    obligatoria = Column(Boolean, nullable=False, default=True)
    orden = Column(Integer, nullable=False, default=1)

    servicio = relationship("ServicioCatalogo", back_populates="preguntas_clave")


class ProductoExterno(Base):
    """Productos o repuestos cotizables provistos por terceros."""

    __tablename__ = "productos_externos"

    id = Column(Integer, primary_key=True, index=True)
    proveedor_id = Column(
        Integer, ForeignKey("proveedores.id"), nullable=False, index=True
    )
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    costo_proveedor = Column(Numeric(10, 2), nullable=False, default=0.00)
    margen_ganancia = Column(Numeric(5, 2), nullable=False, default=0.30)
    tiempo_entrega_dias = Column(Integer, nullable=False, default=1)
    stock_disponible = Column(Integer, nullable=False, default=0)
    activo = Column(Boolean, nullable=False, default=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    eliminado_en = Column(DateTime(timezone=True), nullable=True)  # Soft delete

    proveedor = relationship("Proveedor", back_populates="productos")

    @property
    def precio_venta_sugerido(self) -> float:
        """Calcula el precio de venta aplicando el margen de ganancia."""
        costo = float(self.costo_proveedor or 0)
        margen = float(self.margen_ganancia or 0)
        return round(costo * (1.0 + margen), 2)

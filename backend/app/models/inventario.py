from sqlalchemy import (
    Boolean,
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

ESTADOS_EQUIPO = ("disponible", "rentado", "en_bodega", "en_mantenimiento")


class CategoriaEquipo(Base):
    __tablename__ = "categorias_equipo"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(200), nullable=True)

    equipos = relationship("Equipo", back_populates="categoria")


class Equipo(Base):
    __tablename__ = "equipos"

    id = Column(Integer, primary_key=True, index=True)
    categoria_id = Column(Integer, ForeignKey("categorias_equipo.id"), nullable=False)

    numero_serie = Column(String(100), unique=True, nullable=False, index=True)
    marca = Column(String(100), nullable=False)
    modelo = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    estado = Column(Enum(*ESTADOS_EQUIPO), nullable=False, default="disponible")
    fecha_compra = Column(Date, nullable=True)
    garantia_hasta = Column(Date, nullable=True)

    # Ruta del PNG del QR generado al registrar el equipo
    qr_codigo = Column(String(255), nullable=True)

    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    eliminado_en = Column(DateTime(timezone=True), nullable=True)  # Soft delete

    categoria = relationship("CategoriaEquipo", back_populates="equipos")
    fotos = relationship("FotoEquipo", back_populates="equipo")
    movimientos = relationship("MovimientoEquipo", back_populates="equipo")


class FotoEquipo(Base):
    __tablename__ = "fotos_equipo"

    id = Column(Integer, primary_key=True, index=True)
    equipo_id = Column(Integer, ForeignKey("equipos.id"), nullable=False, index=True)
    url_foto = Column(String(500), nullable=False)
    es_principal = Column(Boolean, nullable=False, default=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    equipo = relationship("Equipo", back_populates="fotos")


class MovimientoEquipo(Base):
    __tablename__ = "historial_movimientos_equipo"

    id = Column(Integer, primary_key=True, index=True)
    equipo_id = Column(Integer, ForeignKey("equipos.id"), nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    estado_anterior = Column(String(50), nullable=True)
    estado_nuevo = Column(String(50), nullable=False)
    observacion = Column(Text, nullable=True)
    fecha = Column(DateTime(timezone=True), server_default=func.now())

    equipo = relationship("Equipo", back_populates="movimientos")
    usuario = relationship("Usuario")


class Contrato(Base):
    """Se usa solo para filtrar el inventario por cliente; la Fase 8 lo amplía."""

    __tablename__ = "contratos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False, index=True)
    cotizacion_id = Column(Integer, nullable=True)
    tipo = Column(Enum("renta", "compra"), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_vencimiento = Column(Date, nullable=True)
    valor_total = Column(Numeric(10, 2), nullable=False, default=0)
    estado = Column(
        Enum("activo", "vencido", "cancelado", "finalizado"), nullable=False, default="activo"
    )
    observaciones = Column(Text, nullable=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    eliminado_en = Column(DateTime(timezone=True), nullable=True)


class EquipoContrato(Base):
    __tablename__ = "equipos_contrato"

    id = Column(Integer, primary_key=True, index=True)
    contrato_id = Column(Integer, ForeignKey("contratos.id"), nullable=False, index=True)
    equipo_id = Column(Integer, ForeignKey("equipos.id"), nullable=False, index=True)
    valor_unitario = Column(Numeric(10, 2), nullable=False, default=0)

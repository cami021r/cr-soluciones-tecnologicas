from sqlalchemy import Boolean, Column, Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import relationship

from app.database import Base


class CategoriaFinanciera(Base):
    __tablename__ = "categorias_financieras"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    tipo = Column(Enum("ingreso", "gasto"), nullable=False)
    descripcion = Column(String(200), nullable=True)

    transacciones = relationship("TransaccionFinanciera", back_populates="categoria")


class TransaccionFinanciera(Base):
    __tablename__ = "transacciones_financieras"

    id = Column(Integer, primary_key=True, index=True)
    categoria_id = Column(Integer, ForeignKey("categorias_financieras.id"), nullable=False, index=True)
    cotizacion_id = Column(Integer, ForeignKey("cotizaciones.id"), nullable=True, index=True)
    descripcion = Column(String(300), nullable=False)
    monto = Column(Numeric(10, 2), nullable=False, default=0.00)
    tipo = Column(Enum("ingreso", "gasto"), nullable=False, index=True)
    es_fijo = Column(Boolean, nullable=False, default=False)
    fecha = Column(Date, nullable=False, index=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    categoria = relationship("CategoriaFinanciera", back_populates="transacciones")
    cotizacion = relationship("Cotizacion")


class ProyeccionMensual(Base):
    __tablename__ = "proyecciones_mensuales"

    id = Column(Integer, primary_key=True, index=True)
    mes = Column(Integer, nullable=False)
    anio = Column(Integer, nullable=False)
    ingreso_proyectado = Column(Numeric(10, 2), nullable=False, default=0.00)
    gasto_proyectado = Column(Numeric(10, 2), nullable=False, default=0.00)
    ingreso_real = Column(Numeric(10, 2), nullable=True)
    gasto_real = Column(Numeric(10, 2), nullable=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

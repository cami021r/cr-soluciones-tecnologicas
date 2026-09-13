from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

TipoRespuesta = Literal["numero", "texto", "si_no", "seleccion"]


# ---------------------------------------------------------------------------
# PREGUNTAS CLAVE POR SERVICIO
# ---------------------------------------------------------------------------
class PreguntaClaveBase(BaseModel):
    pregunta: str = Field(..., min_length=3, max_length=300)
    tipo_respuesta: TipoRespuesta = "texto"
    obligatoria: bool = True
    orden: int = Field(default=1, ge=1)


class PreguntaClaveCrear(PreguntaClaveBase):
    pass


class PreguntaClaveActualizar(BaseModel):
    pregunta: str | None = Field(default=None, min_length=3, max_length=300)
    tipo_respuesta: TipoRespuesta | None = None
    obligatoria: bool | None = None
    orden: int | None = Field(default=None, ge=1)


class PreguntaClaveRespuesta(PreguntaClaveBase):
    id: int
    servicio_id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# SERVICIOS TÉCNICOS DEL CATÁLOGO
# ---------------------------------------------------------------------------
class ServicioCatalogoBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=150)
    descripcion: str | None = None
    precio_mano_obra: Decimal = Field(default=Decimal("0.00"), ge=0)
    horas_estimadas: Decimal = Field(default=Decimal("1.00"), gt=0)


class ServicioCatalogoCrear(ServicioCatalogoBase):
    preguntas_clave: list[PreguntaClaveCrear] = []


class ServicioCatalogoActualizar(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=150)
    descripcion: str | None = None
    precio_mano_obra: Decimal | None = Field(default=None, ge=0)
    horas_estimadas: Decimal | None = Field(default=None, gt=0)
    activo: bool | None = None


class ServicioCatalogoRespuesta(ServicioCatalogoBase):
    id: int
    activo: bool
    creado_en: datetime
    preguntas_clave: list[PreguntaClaveRespuesta] = []

    class Config:
        from_attributes = True


class ServicioCatalogoSimple(ServicioCatalogoBase):
    """Respuesta simplificada sin cargar preguntas clave."""
    id: int
    activo: bool
    creado_en: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# PROVEEDORES
# ---------------------------------------------------------------------------
class ProveedorBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=150)
    contacto: str | None = Field(default=None, max_length=100)
    telefono: str | None = Field(default=None, max_length=20)
    email: str | None = Field(default=None, max_length=150)


class ProveedorCrear(ProveedorBase):
    pass


class ProveedorActualizar(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=150)
    contacto: str | None = None
    telefono: str | None = None
    email: str | None = None
    activo: bool | None = None


class ProveedorRespuesta(ProveedorBase):
    id: int
    activo: bool
    creado_en: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# PRODUCTOS Y REPUESTOS EXTERNOS
# ---------------------------------------------------------------------------
class ProductoExternoBase(BaseModel):
    proveedor_id: int
    nombre: str = Field(..., min_length=2, max_length=150)
    descripcion: str | None = None
    costo_proveedor: Decimal = Field(default=Decimal("0.00"), ge=0)
    margen_ganancia: Decimal = Field(default=Decimal("0.30"), ge=0, le=10)
    tiempo_entrega_dias: int = Field(default=1, ge=0)
    stock_disponible: int = Field(default=0, ge=0)


class ProductoExternoCrear(ProductoExternoBase):
    pass


class ProductoExternoActualizar(BaseModel):
    proveedor_id: int | None = None
    nombre: str | None = Field(default=None, min_length=2, max_length=150)
    descripcion: str | None = None
    costo_proveedor: Decimal | None = Field(default=None, ge=0)
    margen_ganancia: Decimal | None = Field(default=None, ge=0, le=10)
    tiempo_entrega_dias: int | None = Field(default=None, ge=0)
    stock_disponible: int | None = Field(default=None, ge=0)
    activo: bool | None = None


class ProductoExternoRespuesta(ProductoExternoBase):
    id: int
    activo: bool
    creado_en: datetime
    precio_venta_sugerido: float

    class Config:
        from_attributes = True

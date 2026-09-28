from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

EstadoEquipo = Literal["disponible", "rentado", "en_bodega", "en_mantenimiento"]


class CategoriaRespuesta(BaseModel):
    id: int
    nombre: str
    descripcion: str | None

    class Config:
        from_attributes = True


class EquipoCrear(BaseModel):
    categoria_id: int
    numero_serie: str = Field(min_length=1, max_length=100)
    marca: str = Field(min_length=1, max_length=100)
    modelo: str = Field(min_length=1, max_length=100)
    descripcion: str | None = None
    estado: EstadoEquipo = "disponible"
    fecha_compra: date | None = None
    garantia_hasta: date | None = None


class EquipoActualizar(BaseModel):
    categoria_id: int | None = None
    marca: str | None = None
    modelo: str | None = None
    descripcion: str | None = None
    fecha_compra: date | None = None
    garantia_hasta: date | None = None


class CambioEstado(BaseModel):
    estado_nuevo: EstadoEquipo
    observacion: str | None = None


class FotoRespuesta(BaseModel):
    id: int
    url_foto: str
    es_principal: bool

    class Config:
        from_attributes = True


class MovimientoRespuesta(BaseModel):
    id: int
    estado_anterior: str | None
    estado_nuevo: str
    observacion: str | None
    fecha: datetime
    usuario_id: int

    class Config:
        from_attributes = True


class EquipoRespuesta(BaseModel):
    id: int
    categoria_id: int
    numero_serie: str
    marca: str
    modelo: str
    descripcion: str | None
    estado: EstadoEquipo
    fecha_compra: date | None
    garantia_hasta: date | None
    qr_codigo: str | None
    creado_en: datetime | None
    fotos: list[FotoRespuesta] = []

    class Config:
        from_attributes = True


class EquipoPaginado(BaseModel):
    total: int
    pagina: int
    por_pagina: int
    resultados: list[EquipoRespuesta]


class FichaPublica(BaseModel):
    """Lo único que ve quien escanea el QR: sin datos del cliente ni costos."""

    id: int
    marca: str
    modelo: str
    categoria: str
    estado: EstadoEquipo
    garantia_hasta: date | None
    garantia_vigente: bool
    foto_principal: str | None

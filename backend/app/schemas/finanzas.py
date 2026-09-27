from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

TipoTransaccion = Literal["ingreso", "gasto"]
TipoContrato = Literal["renta", "compra"]
EstadoContrato = Literal["activo", "vencido", "cancelado", "finalizado"]


# ---------------------------------------------------------------------------
# CATEGORÍAS FINANCIERAS
# ---------------------------------------------------------------------------
class CategoriaFinancieraCrear(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    tipo: TipoTransaccion
    descripcion: str | None = None


class CategoriaFinancieraRespuesta(BaseModel):
    id: int
    nombre: str
    tipo: TipoTransaccion
    descripcion: str | None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# TRANSACCIONES FINANCIERAS
# ---------------------------------------------------------------------------
class TransaccionCrear(BaseModel):
    categoria_id: int
    descripcion: str = Field(..., min_length=3, max_length=300)
    monto: Decimal = Field(..., gt=0, description="Monto en moneda local sin decimales negativos")
    tipo: TipoTransaccion
    es_fijo: bool = Field(default=False, description="True si es costo fijo (arriendo, nómina), False si es variable")
    fecha: date = Field(default_factory=date.today)


class TransaccionRespuesta(BaseModel):
    id: int
    categoria_id: int
    categoria_nombre: str | None = None
    cotizacion_id: int | None = None
    descripcion: str
    monto: Decimal
    tipo: TipoTransaccion
    es_fijo: bool
    fecha: date
    creado_en: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# CONTRATOS DE RENTA Y COMPRA
# ---------------------------------------------------------------------------
class ContratoCrear(BaseModel):
    cliente_id: int
    cotizacion_id: int | None = None
    tipo: TipoContrato = "renta"
    fecha_inicio: date = Field(default_factory=date.today)
    fecha_vencimiento: date | None = None
    valor_total: Decimal = Field(default=Decimal("0.00"), ge=0)
    observaciones: str | None = None
    equipos_ids: list[int] = []


class ContratoRespuesta(BaseModel):
    id: int
    cliente_id: int
    cliente_nombre: str | None = None
    cotizacion_id: int | None = None
    tipo: TipoContrato
    fecha_inicio: date
    fecha_vencimiento: date | None
    valor_total: Decimal
    estado: EstadoContrato
    observaciones: str | None
    dias_restantes: int | None = None
    alerta_proximo_vencer: bool = False

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# REPORTES Y DASHBOARD DE MÉTRICAS (PASOS 8.5, 8.6, 8.7)
# ---------------------------------------------------------------------------
class ReporteMensualRespuesta(BaseModel):
    mes: int
    anio: int
    ingresos_brutos: Decimal
    costos_totales: Decimal
    utilidad_neta: Decimal
    margen_operativo_porcentaje: float


class ItemProyeccion(BaseModel):
    mes: int
    anio: int
    ingreso_proyectado: Decimal
    gasto_proyectado: Decimal
    utilidad_proyectada: Decimal


class ProyeccionesTrimestreRespuesta(BaseModel):
    trimestre: list[ItemProyeccion]
    tendencia: str
    nota_metodologica: str


class DashboardGraficasRespuesta(BaseModel):
    meses_etiquetas: list[str]
    serie_ingresos: list[float]
    serie_gastos: list[float]
    serie_utilidad: list[float]
    distribucion_gastos_por_categoria: dict[str, float]
    kpis: dict[str, float]

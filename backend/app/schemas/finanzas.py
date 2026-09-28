from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


# --- CATEGORÍAS FINANCIERAS ---
class CategoriaFinancieraBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    tipo: Literal["ingreso", "gasto"]
    descripcion: str | None = Field(None, max_length=200)


class CategoriaFinancieraCrear(CategoriaFinancieraBase):
    pass


class CategoriaFinancieraRespuesta(CategoriaFinancieraBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# --- TRANSACCIONES FINANCIERAS ---
class TransaccionFinancieraBase(BaseModel):
    categoria_id: int
    cotizacion_id: int | None = None
    descripcion: str = Field(..., max_length=300)
    monto: Decimal = Field(..., gt=0)
    tipo: Literal["ingreso", "gasto"]
    es_fijo: bool = False
    fecha: date = Field(default_factory=date.today)


class TransaccionFinancieraCrear(TransaccionFinancieraBase):
    pass


class TransaccionFinancieraRespuesta(TransaccionFinancieraBase):
    id: int
    creado_en: datetime
    categoria_nombre: str | None = None

    model_config = ConfigDict(from_attributes=True)


# --- CONTRATOS ---
class ContratoCrear(BaseModel):
    cliente_id: int
    cotizacion_id: int | None = None
    tipo: Literal["renta", "compra"]
    fecha_inicio: date
    fecha_vencimiento: date | None = None
    valor_total: Decimal = Field(..., ge=0)
    observaciones: str | None = None
    equipos_ids: list[int] = []


class ContratoActualizar(BaseModel):
    estado: Literal["activo", "vencido", "cancelado", "finalizado"] | None = None
    fecha_vencimiento: date | None = None
    observaciones: str | None = None


class ContratoRespuesta(BaseModel):
    id: int
    cliente_id: int
    cotizacion_id: int | None = None
    tipo: str
    fecha_inicio: date
    fecha_vencimiento: date | None = None
    valor_total: Decimal
    estado: str
    observaciones: str | None = None
    dias_restantes: int | None = None
    esta_por_vencer: bool = False
    creado_en: datetime

    model_config = ConfigDict(from_attributes=True)


# --- REPORTES Y MÉTRICAS (PASO 8.5) ---
class DesgloseCategoria(BaseModel):
    categoria_id: int
    categoria_nombre: str
    tipo: str
    total: Decimal
    porcentaje: float


class ReporteMensualRespuesta(BaseModel):
    mes: int
    anio: int
    ingresos_brutos: Decimal
    gastos_totales: Decimal
    gastos_fijos: Decimal
    gastos_variables: Decimal
    utilidad_neta: Decimal
    margen_operativo_porcentaje: float
    distribucion_gastos: list[DesgloseCategoria]


# --- PROYECCIÓN PREDICTIVA (PASO 8.6) ---
class ProyeccionMesItem(BaseModel):
    mes: int
    anio: int
    mes_nombre: str
    ingreso_proyectado: Decimal
    gasto_proyectado: Decimal
    flujo_neto_proyectado: Decimal


class ProyeccionTrimestralRespuesta(BaseModel):
    trimestre: str
    meses_analizados_historicos: int
    tendencia: str
    proyecciones: list[ProyeccionMesItem]
    total_ingresos_proyectados: Decimal
    total_gastos_proyectados: Decimal
    flujo_neto_acumulado_proyectado: Decimal


# --- FORMATO PARA GRÁFICAS DE CHART.JS (PASO 8.7) ---
class DatasetChart(BaseModel):
    label: str
    data: list[float]
    backgroundColor: str | list[str] | None = None
    borderColor: str | None = None


class GraficaResumenAnual(BaseModel):
    labels: list[str]
    datasets: list[DatasetChart]


class GraficaDistribucionGastos(BaseModel):
    labels: list[str]
    datasets: list[DatasetChart]


class DashboardFinancieroRespuesta(BaseModel):
    ingresos_mes_actual: Decimal
    gastos_mes_actual: Decimal
    utilidad_neta_mes_actual: Decimal
    margen_operativo_mes_actual: float
    contratos_activos: int
    contratos_por_vencer_15_dias: int
    cotizaciones_aceptadas_mes: int

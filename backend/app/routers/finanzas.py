from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import extract, func
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import obtener_usuario_actual, requiere_roles
from app.database import get_db
from app.models.cotizaciones import Cotizacion
from app.models.finanzas import CategoriaFinanciera, ProyeccionMensual, TransaccionFinanciera
from app.models.inventario import Contrato, EquipoContrato
from app.models.usuarios import Usuario
from app.schemas.finanzas import (
    CategoriaFinancieraCrear,
    CategoriaFinancieraRespuesta,
    ContratoActualizar,
    ContratoCrear,
    ContratoRespuesta,
    DashboardFinancieroRespuesta,
    GraficaDistribucionGastos,
    GraficaResumenAnual,
    ProyeccionTrimestralRespuesta,
    ReporteMensualRespuesta,
    TransaccionFinancieraCrear,
    TransaccionFinancieraRespuesta,
)
from app.services.finanzas import (
    calcular_reporte_mensual,
    evaluar_contrato_expiracion,
    obtener_datos_chartjs_anual,
    obtener_distribucion_gastos_chartjs,
    predecir_flujo_caja_trimestre,
)

router = APIRouter(prefix="/finanzas", tags=["Motor Financiero y Métricas"])

solo_admin = requiere_roles("Administrador")
personal_autorizado = requiere_roles("Administrador", "Técnico")


# ===========================================================================
# CATEGORÍAS FINANCIERAS
# ===========================================================================

@router.get(
    "/categorias",
    response_model=list[CategoriaFinancieraRespuesta],
    summary="Listar categorías financieras",
)
def listar_categorias_financieras(
    tipo: Literal["ingreso", "gasto"] | None = Query(None, description="Filtrar por tipo"),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(personal_autorizado),
):
    query = db.query(CategoriaFinanciera)
    if tipo:
        query = query.filter(CategoriaFinanciera.tipo == tipo)
    return query.order_by(CategoriaFinanciera.nombre).all()


@router.post(
    "/categorias",
    response_model=CategoriaFinancieraRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nueva categoría financiera",
)
def crear_categoria_financiera(
    datos: CategoriaFinancieraCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_admin),
):
    existente = db.query(CategoriaFinanciera).filter(CategoriaFinanciera.nombre == datos.nombre).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe una categoría financiera con el nombre '{datos.nombre}'",
        )
    cat = CategoriaFinanciera(**datos.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


# ===========================================================================
# PASO 8.3: REGISTRO Y CONSULTA DE TRANSACCIONES Y GASTOS OPERATIVOS
# ===========================================================================

@router.post(
    "/transacciones",
    response_model=TransaccionFinancieraRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Carga manual de gastos operativos o ingresos",
)
def registrar_transaccion(
    datos: TransaccionFinancieraCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_admin),
):
    """
    Permite el registro manual de gastos operativos (servicios, insumos, compras imprevistas)
    o ingresos varios, clasificándolos en fijos o variables.
    """
    categoria = db.query(CategoriaFinanciera).get(datos.categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría financiera con ID {datos.categoria_id} no existe",
        )

    transaccion = TransaccionFinanciera(**datos.model_dump())
    db.add(transaccion)
    db.commit()
    db.refresh(transaccion)

    return TransaccionFinancieraRespuesta(
        id=transaccion.id,
        categoria_id=transaccion.categoria_id,
        cotizacion_id=transaccion.cotizacion_id,
        descripcion=transaccion.descripcion,
        monto=transaccion.monto,
        tipo=transaccion.tipo,
        es_fijo=transaccion.es_fijo,
        fecha=transaccion.fecha,
        creado_en=transaccion.creado_en,
        categoria_nombre=categoria.nombre,
    )


@router.get(
    "/transacciones",
    response_model=list[TransaccionFinancieraRespuesta],
    summary="Listar y filtrar transacciones financieras",
)
def listar_transacciones(
    tipo: Literal["ingreso", "gasto"] | None = Query(None),
    categoria_id: int | None = Query(None),
    es_fijo: bool | None = Query(None),
    fecha_inicio: date | None = Query(None),
    fecha_fin: date | None = Query(None),
    limite: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(personal_autorizado),
):
    query = db.query(TransaccionFinanciera).options(joinedload(TransaccionFinanciera.categoria))
    if tipo:
        query = query.filter(TransaccionFinanciera.tipo == tipo)
    if categoria_id:
        query = query.filter(TransaccionFinanciera.categoria_id == categoria_id)
    if es_fijo is not None:
        query = query.filter(TransaccionFinanciera.es_fijo == es_fijo)
    if fecha_inicio:
        query = query.filter(TransaccionFinanciera.fecha >= fecha_inicio)
    if fecha_fin:
        query = query.filter(TransaccionFinanciera.fecha <= fecha_fin)

    transacciones = query.order_by(TransaccionFinanciera.fecha.desc()).limit(limite).all()
    return [
        TransaccionFinancieraRespuesta(
            id=t.id,
            categoria_id=t.categoria_id,
            cotizacion_id=t.cotizacion_id,
            descripcion=t.descripcion,
            monto=t.monto,
            tipo=t.tipo,
            es_fijo=t.es_fijo,
            fecha=t.fecha,
            creado_en=t.creado_en,
            categoria_nombre=t.categoria.nombre if t.categoria else None,
        )
        for t in transacciones
    ]


# ===========================================================================
# PASO 8.4: CONTRATOS DE RENTA Y ALERTAS DE VENCIMIENTO
# ===========================================================================

@router.post(
    "/contratos",
    response_model=ContratoRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo contrato de renta o compra",
)
def crear_contrato(
    datos: ContratoCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(personal_autorizado),
):
    contrato = Contrato(
        cliente_id=datos.cliente_id,
        cotizacion_id=datos.cotizacion_id,
        tipo=datos.tipo,
        fecha_inicio=datos.fecha_inicio,
        fecha_vencimiento=datos.fecha_vencimiento,
        valor_total=datos.valor_total,
        observaciones=datos.observaciones,
        estado="activo",
    )
    db.add(contrato)
    db.flush()

    for eq_id in datos.equipos_ids:
        eq_c = EquipoContrato(
            contrato_id=contrato.id,
            equipo_id=eq_id,
            valor_unitario=datos.valor_total,
        )
        db.add(eq_c)

    db.commit()
    db.refresh(contrato)
    return evaluar_contrato_expiracion(contrato)


@router.get(
    "/contratos",
    response_model=list[ContratoRespuesta],
    summary="Listar contratos con cálculo de días y estado",
)
def listar_contratos(
    cliente_id: int | None = Query(None),
    estado: str | None = Query(None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(personal_autorizado),
):
    query = db.query(Contrato).filter(Contrato.eliminado_en.is_(None))
    if cliente_id:
        query = query.filter(Contrato.cliente_id == cliente_id)
    if estado:
        query = query.filter(Contrato.estado == estado)

    contratos = query.order_by(Contrato.fecha_inicio.desc()).all()
    return [evaluar_contrato_expiracion(c) for c in contratos]


@router.get(
    "/contratos/alertas-vencimiento",
    response_model=list[ContratoRespuesta],
    summary="Alertas de contratos próximos a expirar (15 días)",
)
def contratos_proximos_a_vencer(
    dias_umbral: int = Query(15, ge=1, le=90, description="Días de anticipación para la alerta"),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(personal_autorizado),
):
    """Detecta proactivamente contratos de renta activos próximos a vencer."""
    contratos = (
        db.query(Contrato)
        .filter(
            Contrato.estado == "activo",
            Contrato.fecha_vencimiento.isnot(None),
            Contrato.eliminado_en.is_(None),
        )
        .all()
    )
    alertas = []
    for c in contratos:
        evaluado = evaluar_contrato_expiracion(c, dias_umbral=dias_umbral)
        if evaluado["esta_por_vencer"]:
            alertas.append(evaluado)
    return alertas


@router.patch(
    "/contratos/{contrato_id}",
    response_model=ContratoRespuesta,
    summary="Actualizar estado o fecha de vencimiento de contrato",
)
def actualizar_contrato(
    contrato_id: int,
    datos: ContratoActualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_admin),
):
    contrato = db.query(Contrato).filter(Contrato.id == contrato_id, Contrato.eliminado_en.is_(None)).first()
    if not contrato:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contrato no encontrado")

    if datos.estado:
        contrato.estado = datos.estado
    if datos.fecha_vencimiento:
        contrato.fecha_vencimiento = datos.fecha_vencimiento
    if datos.observaciones is not None:
        contrato.observaciones = datos.observaciones

    db.commit()
    db.refresh(contrato)
    return evaluar_contrato_expiracion(contrato)


# ===========================================================================
# PASO 8.5: REPORTES MENSUALES Y AGREGACIÓN DE COSTOS
# ===========================================================================

@router.get(
    "/metricas/mensuales",
    response_model=ReporteMensualRespuesta,
    summary="Reporte mensual de ingresos, costos, utilidad y margen",
)
def reporte_mensual(
    mes: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    anio: int = Query(default_factory=lambda: date.today().year, ge=2020, le=2035),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(personal_autorizado),
):
    """Calcula el estado de resultados mensual sin redondeos flotantes."""
    return calcular_reporte_mensual(db, mes, anio)


# ===========================================================================
# PASO 8.6: PREDICCIÓN Y PROYECCIÓN DE FLUJO DE CAJA TRIMESTRAL
# ===========================================================================

@router.get(
    "/metricas/proyeccion-trimestral",
    response_model=ProyeccionTrimestralRespuesta,
    summary="Algoritmo predictivo de flujo de caja para el siguiente trimestre",
)
def proyeccion_flujo_caja(
    anio: int = Query(default_factory=lambda: date.today().year, ge=2020, le=2035),
    mes: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(personal_autorizado),
):
    """Genera proyecciones de flujo de caja analizando historial contable y contratos activos."""
    return predecir_flujo_caja_trimestre(db, anio, mes)


# ===========================================================================
# PASO 8.7: ENDPOINTS FORMATEADOS PARA CHART.JS (FRONTEND)
# ===========================================================================

@router.get(
    "/graficas/resumen-anual",
    response_model=GraficaResumenAnual,
    summary="Estructura de datos lista para gráfica de barras/líneas anual de Chart.js",
)
def graficas_anuales(
    anio: int = Query(default_factory=lambda: date.today().year, ge=2020, le=2035),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(personal_autorizado),
):
    return obtener_datos_chartjs_anual(db, anio)


@router.get(
    "/graficas/distribucion-gastos",
    response_model=GraficaDistribucionGastos,
    summary="Estructura de datos lista para gráfica de dona de gastos por categoría en Chart.js",
)
def graficas_gastos(
    mes: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    anio: int = Query(default_factory=lambda: date.today().year, ge=2020, le=2035),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(personal_autorizado),
):
    return obtener_distribucion_gastos_chartjs(db, mes, anio)


@router.get(
    "/dashboard-resumen",
    response_model=DashboardFinancieroRespuesta,
    summary="Métricas clave consolidadas para las tarjetas principales del Panel Administrador",
)
def dashboard_resumen(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(personal_autorizado),
):
    hoy = date.today()
    rep = calcular_reporte_mensual(db, hoy.month, hoy.year)

    contratos_activos = db.query(Contrato).filter(Contrato.estado == "activo", Contrato.eliminado_en.is_(None)).count()

    # Contratos por vencer
    contratos = db.query(Contrato).filter(Contrato.estado == "activo", Contrato.fecha_vencimiento.isnot(None)).all()
    por_vencer = sum(1 for c in contratos if evaluar_contrato_expiracion(c, dias_umbral=15)["esta_por_vencer"])

    cotizaciones_mes = (
        db.query(Cotizacion)
        .filter(
            Cotizacion.estado.in_(["aceptada", "aprobada"]),
            extract("month", Cotizacion.creado_en) == hoy.month,
            extract("year", Cotizacion.creado_en) == hoy.year,
        )
        .count()
    )

    return DashboardFinancieroRespuesta(
        ingresos_mes_actual=rep["ingresos_brutos"],
        gastos_mes_actual=rep["gastos_totales"],
        utilidad_neta_mes_actual=rep["utilidad_neta"],
        margen_operativo_mes_actual=rep["margen_operativo_porcentaje"],
        contratos_activos=contratos_activos,
        contratos_por_vencer_15_dias=por_vencer,
        cotizaciones_aceptadas_mes=cotizaciones_mes,
    )

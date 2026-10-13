from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import extract, func
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import obtener_usuario_actual, requiere_roles
from app.database import get_db
from app.models.catalogo import ProductoExterno, ServicioCatalogo
from app.models.cotizaciones import Cotizacion, ItemCotizacion
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
    GananciaItem,
    GraficaDistribucionGastos,
    GraficaResumenAnual,
    MetricasFinancierasAvanzadas,
    ProyeccionTrimestralRespuesta,
    ReporteMensualRespuesta,
    TransaccionFinancieraActualizar,
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
personal_autorizado = requiere_roles("Administrador")


# ===========================================================================
# CATEGORÍAS FINANCIERAS
# ===========================================================================

@router.get(
    "/categorias",
    response_model=list[CategoriaFinancieraRespuesta],
    summary="Listar categorías financieras",
)
def listar_categorias_financieras(
    tipo: Literal["ingreso", "gasto", "inversion"] | None = Query(None, description="Filtrar por tipo"),
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
    tipo: Literal["ingreso", "gasto", "inversion"] | None = Query(None),
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


@router.patch(
    "/transacciones/{transaccion_id}",
    response_model=TransaccionFinancieraRespuesta,
    summary="Modificar una transacción financiera registrada",
)
def modificar_transaccion(
    transaccion_id: int,
    datos: TransaccionFinancieraActualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_admin),
):
    """Permite al administrador modificar montos, descripciones o categorías de gastos e inversiones."""
    t = db.query(TransaccionFinanciera).filter(TransaccionFinanciera.id == transaccion_id).first()
    if not t:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transacción con ID {transaccion_id} no encontrada",
        )

    if datos.categoria_id is not None:
        cat = db.query(CategoriaFinanciera).get(datos.categoria_id)
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categoría con ID {datos.categoria_id} no existe",
            )
        t.categoria_id = datos.categoria_id

    if datos.descripcion is not None:
        t.descripcion = datos.descripcion.strip()
    if datos.monto is not None:
        t.monto = datos.monto
    if datos.tipo is not None:
        t.tipo = datos.tipo
    if datos.es_fijo is not None:
        t.es_fijo = datos.es_fijo
    if datos.fecha is not None:
        t.fecha = datos.fecha

    db.commit()
    db.refresh(t)

    return TransaccionFinancieraRespuesta(
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


@router.delete(
    "/transacciones/{transaccion_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar una transacción financiera",
)
def eliminar_transaccion(
    transaccion_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_admin),
):
    """Permite anular o eliminar un gasto, ingreso o inversión registrado erróneamente."""
    t = db.query(TransaccionFinanciera).filter(TransaccionFinanciera.id == transaccion_id).first()
    if not t:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transacción con ID {transaccion_id} no encontrada",
        )

    db.delete(t)
    db.commit()
    return {"mensaje": f"Transacción #{transaccion_id} eliminada exitosamente"}


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


@router.delete(
    "/contratos/{contrato_id}",
    status_code=status.HTTP_200_OK,
    summary="Archivar o eliminar un contrato",
)
def eliminar_contrato(
    contrato_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_admin),
):
    """Permite al administrador archivar contratos finalizados o cancelados."""
    contrato = db.query(Contrato).filter(Contrato.id == contrato_id).first()
    if not contrato:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contrato no encontrado")

    contrato.eliminado_en = datetime.now(timezone.utc)
    contrato.estado = "finalizado"
    db.commit()
    return {"mensaje": f"Contrato #{contrato_id} archivado exitosamente"}


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


# ===========================================================================
# FASE 4: CENTRO DE FINANZAS E INDICADORES AVANZADOS PARA EL ADMINISTRADOR
# ===========================================================================

@router.get(
    "/metricas/avanzadas",
    response_model=MetricasFinancierasAvanzadas,
    summary="Centro de finanzas e indicadores comerciales avanzados",
)
def metricas_avanzadas(
    periodo: Literal["30_dias", "mes_actual", "trimestre", "anio_actual", "historico"] = Query("mes_actual"),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(personal_autorizado),
):
    """
    Consolida métricas separando:
    - Posible venta (embudo comercial no concretado)
    - Ingreso verificado (proyectos concretados con pago confirmado)
    - Gastos operativos e Inversión
    - Ganancia neta y margen comercial
    - Rentabilidad desglosada por cada producto y servicio del catálogo
    """
    hoy = date.today()

    if periodo == "30_dias":
        fecha_desde = hoy - timedelta(days=30)
    elif periodo == "mes_actual":
        fecha_desde = date(hoy.year, hoy.month, 1)
    elif periodo == "trimestre":
        mes_inicio_trimestre = ((hoy.month - 1) // 3) * 3 + 1
        fecha_desde = date(hoy.year, mes_inicio_trimestre, 1)
    elif periodo == "anio_actual":
        fecha_desde = date(hoy.year, 1, 1)
    else:  # historico
        fecha_desde = None

    # 1. Ingresos Verificados (Transacciones tipo 'ingreso')
    q_ingresos = db.query(func.coalesce(func.sum(TransaccionFinanciera.monto), Decimal("0.00"))).filter(
        TransaccionFinanciera.tipo == "ingreso"
    )
    if fecha_desde:
        q_ingresos = q_ingresos.filter(TransaccionFinanciera.fecha >= fecha_desde)
    ingresos_verificados = Decimal(str(q_ingresos.scalar() or 0))

    # 2. Gastos Operativos (Transacciones tipo 'gasto')
    q_gastos = db.query(func.coalesce(func.sum(TransaccionFinanciera.monto), Decimal("0.00"))).filter(
        TransaccionFinanciera.tipo == "gasto"
    )
    if fecha_desde:
        q_gastos = q_gastos.filter(TransaccionFinanciera.fecha >= fecha_desde)
    gastos_operativos = Decimal(str(q_gastos.scalar() or 0))

    # 3. Inversión Total (Transacciones tipo 'inversion')
    q_inversion = db.query(func.coalesce(func.sum(TransaccionFinanciera.monto), Decimal("0.00"))).filter(
        TransaccionFinanciera.tipo == "inversion"
    )
    if fecha_desde:
        q_inversion = q_inversion.filter(TransaccionFinanciera.fecha >= fecha_desde)
    inversion_total = Decimal(str(q_inversion.scalar() or 0))

    # 4. Posible Venta (Cotizaciones activas en curso en el embudo comercial no concretadas)
    estados_en_curso = [
        "pendiente",
        "aceptada",
        "aprobada",
        "contactado",
        "agendado",
        "en_ejecucion",
        "en_ajuste",
        "ajuste_solicitado",
    ]
    q_posible = db.query(func.coalesce(func.sum(Cotizacion.total), Decimal("0.00"))).filter(
        Cotizacion.estado.in_(estados_en_curso),
        Cotizacion.ingreso_confirmado.is_(False),
        Cotizacion.eliminado_en.is_(None),
    )
    if fecha_desde:
        q_posible = q_posible.filter(Cotizacion.creado_en >= datetime.combine(fecha_desde, datetime.min.time()))
    posible_venta = Decimal(str(q_posible.scalar() or 0))

    # Conteo de proyectos concretados y en curso
    q_concretados = db.query(Cotizacion).filter(Cotizacion.estado == "concretado", Cotizacion.eliminado_en.is_(None))
    q_en_curso = db.query(Cotizacion).filter(Cotizacion.estado.in_(estados_en_curso), Cotizacion.eliminado_en.is_(None))
    if fecha_desde:
        q_concretados = q_concretados.filter(Cotizacion.creado_en >= datetime.combine(fecha_desde, datetime.min.time()))
        q_en_curso = q_en_curso.filter(Cotizacion.creado_en >= datetime.combine(fecha_desde, datetime.min.time()))
    cantidad_proyectos_concretados = q_concretados.count()
    cantidad_cotizaciones_en_curso = q_en_curso.count()

    # Si hay proyectos concretados pero aún no tenían transacción registrada, sumar al ingreso
    if ingresos_verificados == Decimal("0.00") and cantidad_proyectos_concretados > 0:
        sum_concretados = db.query(func.coalesce(func.sum(Cotizacion.total), Decimal("0.00"))).filter(
            Cotizacion.estado == "concretado",
            Cotizacion.eliminado_en.is_(None),
        ).scalar()
        ingresos_verificados = Decimal(str(sum_concretados or 0))

    # 5. Ganancia Neta = Ingresos Verificados - (Gastos Operativos + Inversión)
    ganancia_neta = ingresos_verificados - (gastos_operativos + inversion_total)

    # 6. Margen Promedio Comercial (%)
    if ingresos_verificados > Decimal("0.00"):
        margen_promedio_comercial = float(((ingresos_verificados - gastos_operativos) / ingresos_verificados) * 100)
    else:
        margen_promedio_comercial = 0.0

    # 7. Ganancia por Servicio Técnico
    servicios_db = db.query(ServicioCatalogo).filter(ServicioCatalogo.eliminado_en.is_(None)).all()
    ganancias_por_servicio = []
    for s in servicios_db:
        p_venta = Decimal(str(s.precio_mano_obra or 0))
        # Costo base operativo estimado: 40% de la tarifa
        costo_base = (p_venta * Decimal("0.40")).quantize(Decimal("0.01"))
        ganancia_u = (p_venta - costo_base).quantize(Decimal("0.01"))
        margen_s = float((ganancia_u / p_venta * 100)) if p_venta > 0 else 0.0

        unidades = db.query(func.coalesce(func.sum(ItemCotizacion.cantidad), Decimal("0.00"))).join(Cotizacion).filter(
            ItemCotizacion.servicio_id == s.id,
            Cotizacion.estado.in_(["concretado", "aceptada", "aprobada", "en_ejecucion"]),
            Cotizacion.eliminado_en.is_(None),
        ).scalar()
        u_vendidas = int(unidades or 0)
        ganancia_total = (ganancia_u * Decimal(str(u_vendidas))).quantize(Decimal("0.01"))

        ganancias_por_servicio.append(GananciaItem(
            id=s.id,
            nombre=s.nombre,
            tipo="servicio",
            precio_venta=p_venta,
            costo=costo_base,
            ganancia_unitaria=ganancia_u,
            margen_porcentaje=round(margen_s, 1),
            unidades_vendidas=u_vendidas,
            ganancia_total_generada=ganancia_total,
        ))

    # 8. Ganancia por Producto & Repuesto
    productos_db = db.query(ProductoExterno).filter(ProductoExterno.eliminado_en.is_(None)).all()
    ganancias_por_producto = []
    for p in productos_db:
        costo_p = Decimal(str(p.costo_proveedor or 0))
        p_ventap = Decimal(str(p.precio_venta_sugerido or 0))
        ganancia_up = (p_ventap - costo_p).quantize(Decimal("0.01"))
        margen_p = float(p.margen_ganancia * 100) if p.margen_ganancia else 0.0

        unidades_p = db.query(func.coalesce(func.sum(ItemCotizacion.cantidad), Decimal("0.00"))).join(Cotizacion).filter(
            ItemCotizacion.producto_id == p.id,
            Cotizacion.estado.in_(["concretado", "aceptada", "aprobada", "en_ejecucion"]),
            Cotizacion.eliminado_en.is_(None),
        ).scalar()
        up_vendidas = int(unidades_p or 0)
        ganancia_total_p = (ganancia_up * Decimal(str(up_vendidas))).quantize(Decimal("0.01"))

        ganancias_por_producto.append(GananciaItem(
            id=p.id,
            nombre=p.nombre,
            tipo="producto",
            precio_venta=p_ventap,
            costo=costo_p,
            ganancia_unitaria=ganancia_up,
            margen_porcentaje=round(margen_p, 1),
            unidades_vendidas=up_vendidas,
            ganancia_total_generada=ganancia_total_p,
        ))

    # 9. Flujo Comparativo para gráficas
    flujo_comparativo = [
        {"etiqueta": "Ingresos Verificados", "monto": float(ingresos_verificados), "color": "#10b981"},
        {"etiqueta": "Gastos Operativos", "monto": float(gastos_operativos), "color": "#f59e0b"},
        {"etiqueta": "Inversión en Infraestructura", "monto": float(inversion_total), "color": "#6366f1"},
        {"etiqueta": "Ganancia Neta", "monto": float(ganancia_neta), "color": "#3b82f6"},
        {"etiqueta": "Posible Venta (Embudo)", "monto": float(posible_venta), "color": "#8b5cf6"},
    ]

    return MetricasFinancierasAvanzadas(
        periodo=periodo,
        ingresos_verificados=ingresos_verificados,
        posible_venta=posible_venta,
        gastos_operativos=gastos_operativos,
        inversion_total=inversion_total,
        ganancia_neta=ganancia_neta,
        margen_promedio_comercial=round(margen_promedio_comercial, 1),
        cantidad_proyectos_concretados=cantidad_proyectos_concretados,
        cantidad_cotizaciones_en_curso=cantidad_cotizaciones_en_curso,
        ganancias_por_servicio=ganancias_por_servicio,
        ganancias_por_producto=ganancias_por_producto,
        flujo_comparativo=flujo_comparativo,
    )

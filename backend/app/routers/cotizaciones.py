from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import obtener_usuario_actual, requiere_roles
from app.database import get_db
from app.services.notificaciones import ejecutar_tarea_notificacion_asincrona
from decimal import Decimal

from app.services.pdf import generar_pdf_cotizacion
from app.models.cotizaciones import (
    Cliente,
    ConversacionChat,
    Cotizacion,
    HistorialEstadoCotizacion,
    ItemCotizacion,
    MensajeChat,
)
from app.models.finanzas import CategoriaFinanciera, TransaccionFinanciera
from app.models.usuarios import Usuario
from app.schemas.cotizaciones import (
    CambiarEstadoCotizacion,
    ChatTurnoRespuesta,
    ConversacionRespuesta,
    CotizacionActualizar,
    CotizacionRespuesta,
    HistorialEstadoCotizacionRespuesta,
    ItemCotizacionCrear,
    ItemCotizacionRespuesta,
    MensajeCrear,
)
from app.services.cotizador import (
    calcular_cotizacion_financiera,
    construir_contexto_rag,
    extraer_json_cotizacion,
    limpiar_texto_para_usuario,
)
from app.services.finanzas import registrar_ingreso_cotizacion
from app.services.ia import consultar_ia

router = APIRouter(prefix="/cotizaciones", tags=["Cotizaciones y Chatbot IA"])

solo_personal = requiere_roles("Administrador", "Técnico")


def _obtener_o_crear_cliente(db: Session, usuario: Usuario) -> Cliente:
    """Garantiza que el usuario autenticado cuente con un perfil de cliente registrado."""
    cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario.id).first()
    if not cliente:
        # Generar un registro de cliente por defecto con sus datos de usuario
        doc_default = f"CC-{usuario.id}-{usuario.telefono or '0000'}"
        cliente = Cliente(
            usuario_id=usuario.id,
            nombre_empresa=None,
            tipo="persona",
            documento=doc_default,
            telefono_alt=usuario.telefono,
        )
        db.add(cliente)
        db.commit()
        db.refresh(cliente)
    return cliente


# ===========================================================================
# PASO 6.4: ENDPOINT DE MENSAJERÍA BIDIRECCIONAL CON EL CHATBOT IA
# ===========================================================================

@router.post(
    "/chat",
    response_model=ChatTurnoRespuesta,
    status_code=status.HTTP_200_OK,
    summary="Enviar mensaje al Chatbot IA y generar cotización interactiva",
)
def interactuar_con_chatbot(
    datos: MensajeCrear,
    conversacion_id: int | None = Query(default=None, description="ID de conversación existente"),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """
    Recibe el mensaje del cliente, mantiene el historial de la sesión, inyecta
    el catálogo RAG y consulta a la IA (Gemini / Claude / Simulador). Si la IA detecta
    que la cotización está lista, calcula los valores financieros y la persiste.
    """
    cliente = _obtener_o_crear_cliente(db, usuario_actual)

    # 1. Recuperar o inicializar la conversación
    conversacion = None
    if conversacion_id:
        conversacion = (
            db.query(ConversacionChat)
            .filter(
                ConversacionChat.id == conversacion_id,
                ConversacionChat.cliente_id == cliente.id,
            )
            .first()
        )

    if not conversacion:
        conversacion = ConversacionChat(cliente_id=cliente.id, estado="activa")
        db.add(conversacion)
        db.flush()

    # 2. Registrar el mensaje del usuario en la base de datos
    nuevo_msg_usuario = MensajeChat(
        conversacion_id=conversacion.id,
        rol="user",
        contenido=datos.contenido.strip(),
    )
    db.add(nuevo_msg_usuario)
    db.commit()

    # 3. Construir historial de conversación completo para la IA
    historial_db = (
        db.query(MensajeChat)
        .filter(MensajeChat.conversacion_id == conversacion.id)
        .order_by(MensajeChat.creado_en.asc())
        .all()
    )
    historial_formateado = [
        {"rol": m.rol, "contenido": m.contenido} for m in historial_db
    ]

    # 4. RAG: Recuperar catálogo comercial activo (Fase 5)
    contexto_catalogo = construir_contexto_rag(db)

    # 5. Consultar al motor de IA
    respuesta_raw_ia = consultar_ia(historial_formateado, contexto_catalogo)

    # 6. Parsear posible JSON de cotización
    json_cotizacion = extraer_json_cotizacion(respuesta_raw_ia)
    texto_para_usuario = limpiar_texto_para_usuario(respuesta_raw_ia)

    # 7. Registrar respuesta del asistente en el chat
    msg_asistente = MensajeChat(
        conversacion_id=conversacion.id,
        rol="assistant",
        contenido=texto_para_usuario,
    )
    db.add(msg_asistente)

    cotizacion_creada = None

    # 8. PASO 6.6 y 6.7: Si es cotización válida, calcular y guardar
    if json_cotizacion.get("es_cotizacion"):
        servicios_ia = json_cotizacion.get("servicios", [])
        productos_ia = json_cotizacion.get("productos", [])

        if servicios_ia or productos_ia:
            calculo = calcular_cotizacion_financiera(
                db,
                servicios_ia,
                productos_ia,
                descuento=Decimal("0.00"),
                porcentaje_iva=Decimal("19.00"),
            )

            fecha_exp = date.today() + timedelta(days=15)  # Validez 15 días
            cotizacion_obj = Cotizacion(
                cliente_id=cliente.id,
                conversacion_id=conversacion.id,
                subtotal=calculo["subtotal"],
                descuento=calculo["descuento"],
                porcentaje_iva=calculo["porcentaje_iva"],
                iva=calculo["iva"],
                total=calculo["total"],
                estado="pendiente",
                fecha_vencimiento=fecha_exp,
            )
            db.add(cotizacion_obj)
            db.flush()

            for item in calculo["items"]:
                item_db = ItemCotizacion(
                    cotizacion_id=cotizacion_obj.id,
                    tipo_item=item["tipo_item"],
                    servicio_id=item["servicio_id"],
                    producto_id=item["producto_id"],
                    descripcion=item["descripcion"],
                    cantidad=item["cantidad"],
                    precio_unitario=item["precio_unitario"],
                    subtotal=item["subtotal"],
                )
                db.add(item_db)

            # Historial inicial tipo seguimiento de envío
            hist_ini = HistorialEstadoCotizacion(
                cotizacion_id=cotizacion_obj.id,
                estado="pendiente",
                usuario_id=usuario_actual.id,
                usuario_nombre=usuario_actual.nombre_completo,
                observacion="Cotización generada automáticamente a través del Cotizador Inteligente C&R",
            )
            db.add(hist_ini)

            conversacion.estado = "cotizacion_generada"
            db.commit()
            db.refresh(cotizacion_obj)
            cotizacion_creada = cotizacion_obj

    db.commit()

    return ChatTurnoRespuesta(
        conversacion_id=conversacion.id,
        respuesta_ia=texto_para_usuario,
        es_cotizacion=bool(cotizacion_creada),
        cotizacion=_construir_respuesta_cotizacion(cotizacion_creada) if cotizacion_creada else None,
    )


def _construir_respuesta_cotizacion(c: Cotizacion) -> CotizacionRespuesta:
    """Serializa la cotización incluyendo datos de contacto del cliente y trazabilidad."""
    cli = c.cliente
    c_user = cli.usuario if cli else None
    cli_nom = cli.nombre_empresa if (cli and cli.nombre_empresa) else (c_user.nombre_completo if c_user else "Cliente")
    return CotizacionRespuesta(
        id=c.id,
        cliente_id=c.cliente_id,
        cliente_nombre=cli_nom,
        cliente_email=c_user.email if c_user else None,
        cliente_telefono=c_user.telefono or (cli.telefono_alt if cli else None),
        cliente_empresa=cli.nombre_empresa if cli else None,
        conversacion_id=c.conversacion_id,
        subtotal=c.subtotal,
        descuento=c.descuento,
        porcentaje_iva=c.porcentaje_iva,
        iva=c.iva,
        total=c.total,
        estado=c.estado,
        notas_internas=c.notas_internas,
        ingreso_confirmado=bool(c.ingreso_confirmado),
        fecha_visita_agendada=c.fecha_visita_agendada,
        url_pdf=c.url_pdf,
        fecha_vencimiento=c.fecha_vencimiento,
        creado_en=c.creado_en,
        items=[
            ItemCotizacionRespuesta(
                id=it.id,
                tipo_item=it.tipo_item,
                servicio_id=it.servicio_id,
                producto_id=it.producto_id,
                descripcion=it.descripcion,
                cantidad=it.cantidad,
                precio_unitario=it.precio_unitario,
                subtotal=it.subtotal,
            ) for it in (c.items or [])
        ],
        historial=[
            HistorialEstadoCotizacionRespuesta(
                id=h.id,
                cotizacion_id=h.cotizacion_id,
                estado=h.estado,
                usuario_id=h.usuario_id,
                usuario_nombre=h.usuario_nombre,
                observacion=h.observacion,
                creado_en=h.creado_en,
            ) for h in (c.historial or [])
        ],
    )


# ===========================================================================
# PASO 6.8: GESTIÓN DE COTIZACIONES (LISTAR, CONSULTAR, EDITAR Y ESTADOS)
# ===========================================================================

@router.get(
    "/",
    response_model=list[CotizacionRespuesta],
    summary="Listar cotizaciones con filtros",
)
def listar_cotizaciones(
    estado: str | None = Query(default=None, description="Filtrar por estado"),
    buscar: str | None = Query(default=None, description="Buscar por cliente o ID"),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """Devuelve cotizaciones con datos de cliente, items e historial."""
    query = (
        db.query(Cotizacion)
        .options(
            joinedload(Cotizacion.items),
            joinedload(Cotizacion.cliente).joinedload(Cliente.usuario),
            joinedload(Cotizacion.historial),
        )
        .filter(Cotizacion.eliminado_en.is_(None))
    )

    if usuario_actual.rol.nombre == "Cliente":
        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario_actual.id).first()
        if not cliente:
            return []
        query = query.filter(Cotizacion.cliente_id == cliente.id)

    if estado:
        query = query.filter(Cotizacion.estado == estado)

    cotizaciones = query.order_by(Cotizacion.creado_en.desc()).all()
    resultado = [_construir_respuesta_cotizacion(c) for c in cotizaciones]

    if buscar:
        termino = buscar.strip().lower()
        resultado = [
            c for c in resultado
            if termino in (c.cliente_nombre or "").lower()
            or termino in (c.cliente_empresa or "").lower()
            or termino in (c.cliente_email or "").lower()
            or termino in str(c.id)
        ]

    return resultado


@router.get(
    "/{cotizacion_id}",
    response_model=CotizacionRespuesta,
    summary="Consultar detalle de una cotización con items e historial",
)
def obtener_cotizacion(
    cotizacion_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """Devuelve la ficha financiera, los items y la línea de tiempo de la cotización."""
    cotizacion = (
        db.query(Cotizacion)
        .options(
            joinedload(Cotizacion.items),
            joinedload(Cotizacion.cliente).joinedload(Cliente.usuario),
            joinedload(Cotizacion.historial),
        )
        .filter(
            Cotizacion.id == cotizacion_id,
            Cotizacion.eliminado_en.is_(None),
        )
        .first()
    )
    if not cotizacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cotización con ID {cotizacion_id} no encontrada",
        )

    if usuario_actual.rol.nombre == "Cliente":
        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario_actual.id).first()
        if not cliente or cotizacion.cliente_id != cliente.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes autorización para consultar esta cotización",
            )

    return _construir_respuesta_cotizacion(cotizacion)


@router.patch(
    "/{cotizacion_id}",
    response_model=CotizacionRespuesta,
    summary="Modificar cotización (ítems, precios, descuento, IVA, vigencia y notas)",
)
def modificar_cotizacion(
    cotizacion_id: int,
    datos: CotizacionActualizar,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_personal),
):
    """
    Permite al administrador modificar ítems, tarifas, descuentos, IVA configurable,
    vigencia y notas internas de la propuesta.
    """
    cotizacion = (
        db.query(Cotizacion)
        .options(
            joinedload(Cotizacion.items),
            joinedload(Cotizacion.cliente).joinedload(Cliente.usuario),
            joinedload(Cotizacion.historial),
        )
        .filter(Cotizacion.id == cotizacion_id, Cotizacion.eliminado_en.is_(None))
        .first()
    )
    if not cotizacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotización no encontrada")

    if datos.descuento is not None:
        cotizacion.descuento = datos.descuento
    if datos.porcentaje_iva is not None:
        cotizacion.porcentaje_iva = datos.porcentaje_iva
    if datos.fecha_vencimiento is not None:
        cotizacion.fecha_vencimiento = datos.fecha_vencimiento
    if datos.notas_internas is not None:
        cotizacion.notas_internas = datos.notas_internas
    if datos.fecha_visita_agendada is not None:
        cotizacion.fecha_visita_agendada = datos.fecha_visita_agendada

    # Modificar ítems si fueron proporcionados
    if datos.items is not None:
        db.query(ItemCotizacion).filter(ItemCotizacion.cotizacion_id == cotizacion.id).delete()
        subtotal_calc = Decimal("0.00")
        for it in datos.items:
            sub_it = (Decimal(str(it.cantidad)) * Decimal(str(it.precio_unitario))).quantize(Decimal("0.01"))
            subtotal_calc += sub_it
            item_db = ItemCotizacion(
                cotizacion_id=cotizacion.id,
                tipo_item=it.tipo_item,
                servicio_id=it.servicio_id,
                producto_id=it.producto_id,
                descripcion=it.descripcion.strip(),
                cantidad=it.cantidad,
                precio_unitario=it.precio_unitario,
                subtotal=sub_it,
            )
            db.add(item_db)
        cotizacion.subtotal = subtotal_calc

    # Recalcular base, IVA y total con precisión exacta
    base = max(Decimal("0.00"), Decimal(str(cotizacion.subtotal)) - Decimal(str(cotizacion.descuento or 0)))
    iva_calc = (base * (Decimal(str(cotizacion.porcentaje_iva or 19)) / Decimal("100.00"))).quantize(Decimal("0.01"))
    cotizacion.iva = iva_calc
    cotizacion.total = (base + iva_calc).quantize(Decimal("0.01"))

    # Registrar en historial
    hist = HistorialEstadoCotizacion(
        cotizacion_id=cotizacion.id,
        estado=cotizacion.estado,
        usuario_id=usuario_actual.id,
        usuario_nombre=usuario_actual.nombre_completo,
        observacion="Presupuesto, condiciones e ítems modificados por administración",
    )
    db.add(hist)
    db.commit()
    db.refresh(cotizacion)
    return _construir_respuesta_cotizacion(cotizacion)


@router.patch(
    "/{cotizacion_id}/estado",
    response_model=CotizacionRespuesta,
    summary="Cambiar estado de una cotización y avanzar en el embudo comercial",
)
def actualizar_estado_cotizacion(
    cotizacion_id: int,
    datos: CambiarEstadoCotizacion,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """
    Transición de estados en el ciclo de vida comercial:
    - Pendiente ➔ Aceptada (por el cliente) ➔ Aprobada (por admin) ➔ Contactado ➔ Agendado ➔ En ejecución ➔ Proyecto concretado.
    - Alternos: En ajuste, Rechazada.
    IMPORTANTE: Cuando el cliente acepta, NO pasa a ingresos contables; espera la aprobación
    y solo al estar en 'concretado' (con ingreso confirmado) se reconoce como ingreso verificado.
    """
    cotizacion = (
        db.query(Cotizacion)
        .options(
            joinedload(Cotizacion.items),
            joinedload(Cotizacion.cliente).joinedload(Cliente.usuario),
            joinedload(Cotizacion.historial),
        )
        .filter(
            Cotizacion.id == cotizacion_id,
            Cotizacion.eliminado_en.is_(None),
        )
        .first()
    )
    if not cotizacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cotización con ID {cotizacion_id} no encontrada",
        )

    # Validar que si es cliente solo pueda modificar sus propias cotizaciones
    es_cliente = usuario_actual.rol.nombre == "Cliente"
    if es_cliente:
        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario_actual.id).first()
        if not cliente or cotizacion.cliente_id != cliente.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes autorización para modificar esta cotización",
            )
        # El cliente solo puede aceptar, rechazar o solicitar ajuste
        if datos.estado not in ("aceptada", "rechazada", "ajuste_solicitado", "en_ajuste"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Acción no permitida para el rol Cliente",
            )

    estado_anterior = cotizacion.estado
    cotizacion.estado = datos.estado

    if datos.fecha_visita:
        cotizacion.fecha_visita_agendada = datos.fecha_visita

    # Texto por defecto de la transición para la línea de tiempo
    desc_observacion = datos.observacion
    if not desc_observacion:
        descripciones_estado = {
            "aceptada": "El cliente revisó y aceptó la cotización. En espera de aprobación por parte de C&R.",
            "aprobada": "Propuesta formal aprobada por administración. Pasa a seguimiento comercial.",
            "contactado": "Cliente contactado por el equipo de ingeniería/comercial.",
            "agendado": f"Visita técnica o inicio agendado{' para: ' + str(datos.fecha_visita)[:16] if datos.fecha_visita else ''}.",
            "en_ejecucion": "Servicios técnicos e instalación en ejecución activa.",
            "concretado": "Proyecto culminado y concretado a satisfacción.",
            "en_ajuste": "Propuesta devuelta para ajustes y revisión de presupuesto.",
            "ajuste_solicitado": "El cliente solicitó ajustes o cambios en la propuesta.",
            "rechazada": "Propuesta declinada o descartada.",
        }
        desc_observacion = descripciones_estado.get(datos.estado, f"Estado cambiado a {datos.estado}")

    # Registrar en la línea de tiempo inmutable
    hist_entry = HistorialEstadoCotizacion(
        cotizacion_id=cotizacion.id,
        estado=datos.estado,
        usuario_id=usuario_actual.id,
        usuario_nombre=usuario_actual.nombre_completo,
        observacion=desc_observacion,
    )
    db.add(hist_entry)

    # FASE 4: INGRESO VERIFICADO ÚNICAMENTE AL CONCRETAR EL PROYECTO O CONFIRMAR INGRESO
    if datos.estado == "concretado" or datos.confirmar_ingreso:
        cotizacion.ingreso_confirmado = True
        categoria_ingreso = (
            db.query(CategoriaFinanciera)
            .filter(CategoriaFinanciera.tipo == "ingreso")
            .first()
        )
        if not categoria_ingreso:
            categoria_ingreso = CategoriaFinanciera(
                nombre="Proyectos Concretados",
                tipo="ingreso",
                descripcion="Ingreso por proyectos formalmente concretados y entregados",
            )
            db.add(categoria_ingreso)
            db.flush()

        transaccion_existente = (
            db.query(TransaccionFinanciera)
            .filter(TransaccionFinanciera.cotizacion_id == cotizacion.id)
            .first()
        )
        if not transaccion_existente:
            transaccion = TransaccionFinanciera(
                categoria_id=categoria_ingreso.id,
                cotizacion_id=cotizacion.id,
                descripcion=f"Ingreso verificado por Proyecto Concretado #{cotizacion.id}",
                monto=cotizacion.total,
                tipo="ingreso",
                es_fijo=False,
                fecha=date.today(),
            )
            db.add(transaccion)

    db.commit()
    db.refresh(cotizacion)

    # Notificaciones según evento
    if datos.estado == "aceptada" and estado_anterior != "aceptada":
        background_tasks.add_task(
            ejecutar_tarea_notificacion_asincrona,
            tipo_evento="cotizacion_aceptada",
            datos={
                "cotizacion_id": cotizacion.id,
                "total": float(cotizacion.total or 0.0),
                "cliente_nombre": usuario_actual.nombre_completo,
            },
            usuario_id=usuario_actual.id,
        )

    return _construir_respuesta_cotizacion(cotizacion)


@router.get(
    "/chat/{conversacion_id}/historial",
    response_model=ConversacionRespuesta,
    summary="Consultar transcripción completa de una conversación de chat",
)
def obtener_historial_conversacion(
    conversacion_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """Devuelve el historial cronológico de mensajes de una conversación."""
    conversacion = (
        db.query(ConversacionChat)
        .options(joinedload(ConversacionChat.mensajes))
        .filter(ConversacionChat.id == conversacion_id)
        .first()
    )
    if not conversacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversación con ID {conversacion_id} no encontrada",
        )

    if usuario_actual.rol.nombre == "Cliente":
        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario_actual.id).first()
        if not cliente or conversacion.cliente_id != cliente.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para ver esta conversación",
            )

    return conversacion

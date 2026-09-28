from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import obtener_usuario_actual, requiere_roles
from app.database import get_db
from app.models.cotizaciones import (
    Cliente,
    ConversacionChat,
    Cotizacion,
    ItemCotizacion,
    MensajeChat,
)
from app.models.usuarios import Usuario
from app.schemas.cotizaciones import (
    CambiarEstadoCotizacion,
    ChatTurnoRespuesta,
    ConversacionRespuesta,
    CotizacionRespuesta,
    MensajeCrear,
)
from app.services.cotizador import (
    calcular_cotizacion_financiera,
    construir_contexto_rag,
    extraer_json_cotizacion,
    limpiar_texto_para_usuario,
)
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
            calculo = calcular_cotizacion_financiera(db, servicios_ia, productos_ia)

            fecha_exp = date.today() + timedelta(days=15)  # Validez 15 días
            cotizacion_obj = Cotizacion(
                cliente_id=cliente.id,
                conversacion_id=conversacion.id,
                subtotal=calculo["subtotal"],
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

            conversacion.estado = "cotizacion_generada"
            db.commit()
            db.refresh(cotizacion_obj)
            cotizacion_creada = cotizacion_obj

    db.commit()

    return ChatTurnoRespuesta(
        conversacion_id=conversacion.id,
        respuesta_ia=texto_para_usuario,
        es_cotizacion=bool(cotizacion_creada),
        cotizacion=cotizacion_creada,
    )


# ===========================================================================
# PASO 6.8: GESTIÓN DE COTIZACIONES (LISTAR, CONSULTAR, ACEPTAR / RECHAZAR)
# ===========================================================================

@router.get(
    "/",
    response_model=list[CotizacionRespuesta],
    summary="Listar cotizaciones",
)
def listar_cotizaciones(
    estado: str | None = Query(default=None, description="Filtrar por estado"),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """Devuelve las cotizaciones del usuario actual o todas si es técnico/admin."""
    query = (
        db.query(Cotizacion)
        .options(joinedload(Cotizacion.items))
        .filter(Cotizacion.eliminado_en.is_(None))
    )

    # Si es cliente, solo ve sus propias cotizaciones
    if usuario_actual.rol.nombre == "Cliente":
        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario_actual.id).first()
        if not cliente:
            return []
        query = query.filter(Cotizacion.cliente_id == cliente.id)

    if estado:
        query = query.filter(Cotizacion.estado == estado)

    return query.order_by(Cotizacion.creado_en.desc()).all()


@router.get(
    "/{cotizacion_id}",
    response_model=CotizacionRespuesta,
    summary="Consultar detalle de una cotización con items",
)
def obtener_cotizacion(
    cotizacion_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """Devuelve el desglose financiero completo de la cotización."""
    cotizacion = (
        db.query(Cotizacion)
        .options(joinedload(Cotizacion.items))
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

    # Si es cliente, verificar pertenencia
    if usuario_actual.rol.nombre == "Cliente":
        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario_actual.id).first()
        if not cliente or cotizacion.cliente_id != cliente.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes autorización para consultar esta cotización",
            )

    return cotizacion


@router.patch(
    "/{cotizacion_id}/estado",
    response_model=CotizacionRespuesta,
    summary="Cambiar estado de una cotización (Aceptar, Rechazar o Solicitar Ajuste)",
)
def actualizar_estado_cotizacion(
    cotizacion_id: int,
    datos: CambiarEstadoCotizacion,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """Permite al cliente aceptar, rechazar o solicitar ajuste a su presupuesto."""
    cotizacion = (
        db.query(Cotizacion)
        .options(joinedload(Cotizacion.items))
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
    if usuario_actual.rol.nombre == "Cliente":
        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario_actual.id).first()
        if not cliente or cotizacion.cliente_id != cliente.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes autorización para modificar esta cotización",
            )

    cotizacion.estado = datos.estado
    db.commit()
    db.refresh(cotizacion)
    return cotizacion


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

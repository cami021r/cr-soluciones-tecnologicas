from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import obtener_usuario_actual, requiere_roles
from app.database import get_db
from app.models.cotizaciones import Cliente
from app.models.inventario import Equipo, MovimientoEquipo
from app.models.tickets import ComentarioTicket, Ticket
from app.models.usuarios import Usuario
from app.schemas.tickets import (
    SLA_HORAS,
    ComentarioCrear,
    ComentarioRespuesta,
    TicketActualizar,
    TicketCambiarEstado,
    TicketCrear,
    TicketListadoItem,
    TicketRespuesta,
)

router = APIRouter(prefix="/tickets", tags=["Mesa de Ayuda y Tickets"])

solo_personal_tecnico = requiere_roles("Administrador", "Técnico")
solo_administradores = requiere_roles("Administrador")


def _obtener_o_crear_cliente(db: Session, usuario: Usuario) -> Cliente:
    """Garantiza que el usuario cuente con un registro de cliente asociado."""
    cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario.id).first()
    if not cliente:
        doc_default = f"CC-{usuario.id}-{usuario.telefono or '0000'}"
        cliente = Cliente(
            usuario_id=usuario.id,
            tipo="persona",
            documento=doc_default,
            telefono_alt=usuario.telefono,
        )
        db.add(cliente)
        db.commit()
        db.refresh(cliente)
    return cliente


# ===========================================================================
# PASO 7.3: DISPARADOR DE AUDITORÍA (AUDIT TRAIL) INMUTABLE
# ===========================================================================

def _registrar_auditoria_inmutable(
    db: Session,
    ticket_id: int,
    usuario: Usuario,
    accion: str,
    estado_anterior: str | None,
    estado_nuevo: str,
    observacion: str | None = None,
) -> None:
    """
    Registra en la base de datos una entrada inmutable de auditoría
    indicando qué técnico o usuario modificó el estado del ticket y en qué momento exacto.
    """
    nota_auditoria = (
        f"[AUDITORÍA TÉCNICA] {usuario.nombre_completo} ({usuario.rol.nombre}) realizó la acción '{accion}'. "
        f"Transición de estado: '{estado_anterior or 'N/A'}' ➔ '{estado_nuevo}'. "
        f"{f'Nota: {observacion}' if observacion else ''}"
    )
    entrada_auditoria = ComentarioTicket(
        ticket_id=ticket_id,
        usuario_id=usuario.id,
        contenido=nota_auditoria.strip(),
        es_interno=True,  # Las notas de auditoría siempre quedan blindadas como bitácora interna
    )
    db.add(entrada_auditoria)


# ===========================================================================
# PASO 7.2: APERTURA DE TICKETS VINCULADOS A EQUIPOS
# ===========================================================================

@router.post(
    "/",
    response_model=TicketRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Abrir un nuevo ticket de soporte",
)
def crear_ticket(
    datos: TicketCrear,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """
    Permite a un cliente o personal técnico registrar un nuevo ticket de falla o servicio.
    Si se vincula a un equipo del inventario, se valida y se marca en mantenimiento.
    """
    cliente = _obtener_o_crear_cliente(db, usuario_actual)

    # Validar equipo si se especificó
    equipo = None
    if datos.equipo_id:
        equipo = (
            db.query(Equipo)
            .filter(Equipo.id == datos.equipo_id, Equipo.eliminado_en.is_(None))
            .first()
        )
        if not equipo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Equipo con ID {datos.equipo_id} no existe en el inventario",
            )
        # Cambiar automáticamente el equipo a mantenimiento y registrar en trazabilidad
        estado_ant_equipo = equipo.estado
        equipo.estado = "en_mantenimiento"
        mov = MovimientoEquipo(
            equipo_id=equipo.id,
            usuario_id=usuario_actual.id,
            estado_anterior=estado_ant_equipo,
            estado_nuevo="en_mantenimiento",
            observacion=f"Equipo reportado con incidente en ticket: '{datos.titulo}'",
        )
        db.add(mov)

    nuevo_ticket = Ticket(
        cliente_id=cliente.id,
        equipo_id=equipo.id if equipo else None,
        tecnico_id=None,
        titulo=datos.titulo.strip(),
        descripcion=datos.descripcion.strip(),
        prioridad=datos.prioridad,
        estado="abierto",
    )
    db.add(nuevo_ticket)
    db.flush()

    # PASO 7.3: Registrar auditoría de creación
    _registrar_auditoria_inmutable(
        db=db,
        ticket_id=nuevo_ticket.id,
        usuario=usuario_actual,
        accion="Creación de ticket",
        estado_anterior=None,
        estado_nuevo="abierto",
        observacion=f"Prioridad asignada: {datos.prioridad}",
    )

    db.commit()
    db.refresh(nuevo_ticket)

    return _construir_respuesta_ticket(nuevo_ticket, usuario_actual)


# ===========================================================================
# PASO 7.5: CONSULTAS AVANZADAS ORDENADAS POR PRIORIDAD Y SLA
# ===========================================================================

@router.get(
    "/",
    response_model=list[TicketListadoItem],
    summary="Listar tickets con orden de prioridad y vencimiento de SLA",
)
def listar_tickets(
    estado: str | None = Query(default=None, description="Filtrar por estado"),
    prioridad: str | None = Query(default=None, description="Filtrar por prioridad"),
    tecnico_id: int | None = Query(default=None, description="Filtrar por técnico asignado"),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """
    Lista tickets ordenados estrictamente por SLA de atención:
    1. Prioridad Alta (SLA 8h)
    2. Prioridad Media (SLA 24h)
    3. Prioridad Baja (SLA 48h)
    Y secundariamente por fecha de creación (los más antiguos primero).
    """
    query = (
        db.query(Ticket)
        .options(joinedload(Ticket.tecnico))
        .filter(Ticket.eliminado_en.is_(None))
    )

    # Control de acceso según rol
    if usuario_actual.rol.nombre == "Cliente":
        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario_actual.id).first()
        if not cliente:
            return []
        query = query.filter(Ticket.cliente_id == cliente.id)
    elif tecnico_id is not None:
        query = query.filter(Ticket.tecnico_id == tecnico_id)

    if estado:
        query = query.filter(Ticket.estado == estado)
    if prioridad:
        query = query.filter(Ticket.prioridad == prioridad)

    # Ordenamiento avanzado por urgencia de SLA
    orden_sla = case(
        (Ticket.prioridad == "alta", 1),
        (Ticket.prioridad == "media", 2),
        (Ticket.prioridad == "baja", 3),
        else_=4,
    )

    tickets = query.order_by(orden_sla.asc(), Ticket.creado_en.asc()).all()

    items = []
    for t in tickets:
        sla_h = SLA_HORAS.get(t.prioridad, 24)
        items.append(
            TicketListadoItem(
                id=t.id,
                cliente_id=t.cliente_id,
                equipo_id=t.equipo_id,
                tecnico_id=t.tecnico_id,
                tecnico_nombre=t.tecnico.nombre_completo if t.tecnico else None,
                titulo=t.titulo,
                prioridad=t.prioridad,
                estado=t.estado,
                creado_en=t.creado_en,
                cerrado_en=t.cerrado_en,
                sla_limite_horas=sla_h,
            )
        )
    return items


@router.get(
    "/{ticket_id}",
    response_model=TicketRespuesta,
    summary="Consultar detalle de un ticket",
)
def obtener_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """Devuelve la ficha completa del ticket con sus comentarios filtrados por rol."""
    ticket = (
        db.query(Ticket)
        .options(
            joinedload(Ticket.comentarios).joinedload(ComentarioTicket.usuario),
            joinedload(Ticket.tecnico),
        )
        .filter(Ticket.id == ticket_id, Ticket.eliminado_en.is_(None))
        .first()
    )
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket con ID {ticket_id} no encontrado",
        )

    # Validar acceso para clientes
    if usuario_actual.rol.nombre == "Cliente":
        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario_actual.id).first()
        if not cliente or ticket.cliente_id != cliente.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para consultar este ticket",
            )

    return _construir_respuesta_ticket(ticket, usuario_actual)


# ===========================================================================
# PASO 7.4: COMENTARIOS Y BITÁCORAS TÉCNICAS PRIVADAS
# ===========================================================================

@router.post(
    "/{ticket_id}/comentarios",
    response_model=ComentarioRespuesta,
    status_code=status.HTTP_201_CREATED,
    summary="Agregar comentario o avance de servicio a un ticket",
)
def agregar_comentario(
    ticket_id: int,
    datos: ComentarioCrear,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    """
    Permite registrar comentarios.
    - Clientes: Solo pueden crear comentarios públicos visibles.
    - Técnicos/Admins: Pueden crear bitácoras internas (es_interno=True) o mensajes para el cliente.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.eliminado_en.is_(None)).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket con ID {ticket_id} no encontrado",
        )

    # Si es cliente, verificar pertenencia y forzar es_interno=False
    es_interno_real = datos.es_interno
    if usuario_actual.rol.nombre == "Cliente":
        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario_actual.id).first()
        if not cliente or ticket.cliente_id != cliente.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para comentar en este ticket",
            )
        es_interno_real = False

    comentario = ComentarioTicket(
        ticket_id=ticket.id,
        usuario_id=usuario_actual.id,
        contenido=datos.contenido.strip(),
        es_interno=es_interno_real,
    )
    db.add(comentario)
    db.commit()
    db.refresh(comentario)

    return ComentarioRespuesta(
        id=comentario.id,
        ticket_id=comentario.ticket_id,
        usuario_id=comentario.usuario_id,
        usuario_nombre=usuario_actual.nombre_completo,
        usuario_rol=usuario_actual.rol.nombre,
        contenido=comentario.contenido,
        es_interno=comentario.es_interno,
        creado_en=comentario.creado_en,
    )


@router.patch(
    "/{ticket_id}/estado",
    response_model=TicketRespuesta,
    summary="Actualizar estado del ticket con registro de auditoría (Audit Trail)",
)
def cambiar_estado_ticket(
    ticket_id: int,
    datos: TicketCambiarEstado,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_personal_tecnico),
):
    """Cambia el estado de un ticket y dispara el registro de auditoría inmutable."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.eliminado_en.is_(None)).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket con ID {ticket_id} no encontrado",
        )

    estado_anterior = ticket.estado
    ticket.estado = datos.estado_nuevo

    # Si el estado es resuelto o cerrado
    if datos.estado_nuevo in ["resuelto", "cerrado"] and not ticket.cerrado_en:
        ticket.cerrado_en = datetime.now(timezone.utc)

    # Disparar auditoría
    _registrar_auditoria_inmutable(
        db=db,
        ticket_id=ticket.id,
        usuario=usuario_actual,
        accion="Actualización de estado",
        estado_anterior=estado_anterior,
        estado_nuevo=datos.estado_nuevo,
        observacion=datos.observacion,
    )

    db.commit()
    db.refresh(ticket)
    return _construir_respuesta_ticket(ticket, usuario_actual)


@router.patch(
    "/{ticket_id}/asignar",
    response_model=TicketRespuesta,
    summary="Asignar un técnico responsable al ticket",
)
def asignar_tecnico(
    ticket_id: int,
    tecnico_id: int = Query(..., description="ID del usuario técnico"),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_personal_tecnico),
):
    """Asigna o reasigna un técnico responsable para atender el ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.eliminado_en.is_(None)).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket con ID {ticket_id} no encontrado",
        )

    tecnico = db.query(Usuario).filter(Usuario.id == tecnico_id).first()
    if not tecnico or tecnico.rol.nombre not in ["Administrador", "Técnico"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El usuario {tecnico_id} no cuenta con perfil técnico habilitado",
        )

    ticket.tecnico_id = tecnico.id
    if ticket.estado == "abierto":
        ticket.estado = "en_proceso"

    _registrar_auditoria_inmutable(
        db=db,
        ticket_id=ticket.id,
        usuario=usuario_actual,
        accion="Asignación técnica",
        estado_anterior=ticket.estado,
        estado_nuevo=ticket.estado,
        observacion=f"Técnico asignado: {tecnico.nombre_completo}",
    )

    db.commit()
    db.refresh(ticket)
    return _construir_respuesta_ticket(ticket, usuario_actual)


# ===========================================================================
# PASO 7.6: CIERRE OFICIAL DE TICKETS Y LIBERACIÓN DEL EQUIPO EN INVENTARIO
# ===========================================================================

@router.patch(
    "/{ticket_id}/cerrar",
    response_model=TicketRespuesta,
    summary="Cierre oficial del ticket y liberación de equipo en el inventario",
)
def cerrar_ticket_oficial(
    ticket_id: int,
    diagnostico_final: str = Query(..., min_length=5, description="Diagnóstico y solución aplicada"),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_personal_tecnico),
):
    """
    Cierra oficialmente el ticket archivando el expediente. Si el ticket estaba
    asociado a un equipo del inventario, lo libera devolviéndolo al estado 'disponible'
    y registrando la trazabilidad correspondiente.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.eliminado_en.is_(None)).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket con ID {ticket_id} no encontrado",
        )

    estado_anterior = ticket.estado
    ticket.estado = "cerrado"
    ticket.cerrado_en = datetime.now(timezone.utc)

    # Si estaba vinculado a un equipo, liberarlo en el inventario
    if ticket.equipo_id:
        equipo = db.query(Equipo).filter(Equipo.id == ticket.equipo_id).first()
        if equipo:
            estado_ant_eq = equipo.estado
            equipo.estado = "disponible"
            mov = MovimientoEquipo(
                equipo_id=equipo.id,
                usuario_id=usuario_actual.id,
                estado_anterior=estado_ant_eq,
                estado_nuevo="disponible",
                observacion=f"Equipo liberado tras resolución exitosa del ticket #{ticket.id}: {diagnostico_final}",
            )
            db.add(mov)

    # Registro de auditoría
    _registrar_auditoria_inmutable(
        db=db,
        ticket_id=ticket.id,
        usuario=usuario_actual,
        accion="Cierre oficial y archivo de expediente",
        estado_anterior=estado_anterior,
        estado_nuevo="cerrado",
        observacion=f"Diagnóstico final: {diagnostico_final}",
    )

    db.commit()
    db.refresh(ticket)
    return _construir_respuesta_ticket(ticket, usuario_actual)


def _construir_respuesta_ticket(ticket: Ticket, usuario_actual: Usuario) -> TicketRespuesta:
    """Construye la respuesta aplicando las políticas de privacidad de comentarios."""
    es_cliente = usuario_actual.rol.nombre == "Cliente"

    comentarios_filtrados = []
    for c in ticket.comentarios or []:
        # Si es cliente, ocultar bitácoras técnicas privadas y auditoría interna
        if es_cliente and c.es_interno:
            continue

        comentarios_filtrados.append(
            ComentarioRespuesta(
                id=c.id,
                ticket_id=c.ticket_id,
                usuario_id=c.usuario_id,
                usuario_nombre=c.usuario.nombre_completo if c.usuario else None,
                usuario_rol=c.usuario.rol.nombre if c.usuario and c.usuario.rol else None,
                contenido=c.contenido,
                es_interno=c.es_interno,
                creado_en=c.creado_en,
            )
        )

    sla_h = SLA_HORAS.get(ticket.prioridad, 24)

    return TicketRespuesta(
        id=ticket.id,
        cliente_id=ticket.cliente_id,
        equipo_id=ticket.equipo_id,
        tecnico_id=ticket.tecnico_id,
        titulo=ticket.titulo,
        descripcion=ticket.descripcion,
        prioridad=ticket.prioridad,
        estado=ticket.estado,
        creado_en=ticket.creado_en,
        cerrado_en=ticket.cerrado_en,
        sla_limite_horas=sla_h,
        comentarios=comentarios_filtrados,
    )

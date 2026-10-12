from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import get_db
from app.core.dependencies import requiere_roles
from app.models.cotizaciones import Cliente, Cotizacion
from app.models.inventario import Equipo
from app.models.tickets import Ticket
from app.models.usuarios import Usuario
from app.schemas.clientes import (
    ClienteActualizar,
    ClienteItemResumen,
    ClienteDetalleRespuesta,
)

router = APIRouter(prefix="/clientes", tags=["Módulo de Clientes"])

solo_personal = requiere_roles("Administrador", "Técnico")
solo_administradores = requiere_roles("Administrador")


@router.get("", response_model=list[ClienteItemResumen])
def listar_clientes(
    buscar: str | None = Query(default=None, description="Buscar por nombre, email, teléfono, empresa o documento"),
    tipo: str | None = Query(default=None, description="persona o empresa"),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_personal),
):
    """
    Lista todos los clientes registrados en la plataforma con métricas de cotizaciones,
    equipos asignados y tickets de soporte.
    """
    consulta = db.query(Cliente).join(Usuario, Cliente.usuario_id == Usuario.id).filter(
        Cliente.eliminado_en.is_(None)
    )

    if tipo:
        consulta = consulta.filter(Cliente.tipo == tipo)

    if buscar:
        patron = f"%{buscar.strip()}%"
        consulta = consulta.filter(
            Usuario.nombre.like(patron)
            | Usuario.apellido.like(patron)
            | Usuario.email.like(patron)
            | Usuario.telefono.like(patron)
            | Cliente.nombre_empresa.like(patron)
            | Cliente.documento.like(patron)
        )

    clientes = consulta.order_by(Cliente.id.desc()).all()
    resultado: list[ClienteItemResumen] = []

    for c in clientes:
        u = c.usuario
        # Cotizaciones
        cotizaciones = db.query(Cotizacion).filter(Cotizacion.cliente_id == c.id).all()
        total_cot = len(cotizaciones)
        aceptadas = [cot for cot in cotizaciones if cot.estado == "aceptada"]
        total_aceptadas = len(aceptadas)
        total_comprado = sum(float(cot.total) for cot in aceptadas)

        # Equipos vinculados
        equipos_count = db.query(Equipo).filter(
            Equipo.cliente_id == c.id, Equipo.eliminado_en.is_(None)
        ).count()

        # Tickets
        tickets = db.query(Ticket).filter(
            Ticket.cliente_id == c.id, Ticket.eliminado_en.is_(None)
        ).all()
        total_tickets = len(tickets)
        tickets_abiertos = len([t for t in tickets if t.estado in ["abierto", "en_proceso"]])

        resultado.append(
            ClienteItemResumen(
                id=c.id,
                usuario_id=c.usuario_id,
                nombre=u.nombre if u else "",
                apellido=u.apellido if u else "",
                nombre_completo=u.nombre_completo if u else "Cliente",
                email=u.email if u else "",
                telefono=u.telefono if u else None,
                telefono_alt=c.telefono_alt,
                nombre_empresa=c.nombre_empresa,
                tipo=c.tipo,
                documento=c.documento,
                creado_en=c.creado_en,
                total_cotizaciones=total_cot,
                total_cotizaciones_aceptadas=total_aceptadas,
                total_comprado=total_comprado,
                total_equipos=equipos_count,
                total_tickets=total_tickets,
                tickets_abiertos=tickets_abiertos,
            )
        )

    return resultado


@router.get("/{cliente_id}", response_model=ClienteDetalleRespuesta)
def detalle_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_personal),
):
    """
    Ficha completa de un cliente con su histórico de cotizaciones, equipos comprados
    o arrendados, y tickets de soporte técnico.
    """
    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id, Cliente.eliminado_en.is_(None)
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    u = cliente.usuario

    # Cotizaciones
    cotizaciones = (
        db.query(Cotizacion)
        .filter(Cotizacion.cliente_id == cliente.id)
        .order_by(Cotizacion.id.desc())
        .all()
    )
    total_comprado = sum(
        float(cot.total) for cot in cotizaciones if cot.estado == "aceptada"
    )
    lista_cot = [
        {
            "id": cot.id,
            "total": float(cot.total),
            "subtotal": float(cot.subtotal),
            "estado": cot.estado,
            "creado_en": cot.creado_en.isoformat() if cot.creado_en else None,
            "fecha_vencimiento": cot.fecha_vencimiento.isoformat() if cot.fecha_vencimiento else None,
            "items_count": len(cot.items or []),
        }
        for cot in cotizaciones
    ]

    # Equipos vinculados
    equipos = (
        db.query(Equipo)
        .filter(Equipo.cliente_id == cliente.id, Equipo.eliminado_en.is_(None))
        .all()
    )
    lista_eq = [
        {
            "id": eq.id,
            "marca": eq.marca,
            "modelo": eq.modelo,
            "numero_serie": eq.numero_serie,
            "categoria": eq.categoria.nombre if eq.categoria else None,
            "estado": eq.estado,
            "tipo_relacion": eq.tipo_relacion or "empresa",
            "garantia_hasta": eq.garantia_hasta.isoformat() if eq.garantia_hasta else None,
            "qr_codigo": eq.qr_codigo,
        }
        for eq in equipos
    ]

    # Tickets
    tickets = (
        db.query(Ticket)
        .filter(Ticket.cliente_id == cliente.id, Ticket.eliminado_en.is_(None))
        .order_by(Ticket.id.desc())
        .all()
    )
    lista_tk = [
        {
            "id": tk.id,
            "titulo": tk.titulo,
            "prioridad": tk.prioridad,
            "estado": tk.estado,
            "categoria": tk.categoria,
            "modalidad": tk.modalidad,
            "creado_en": tk.creado_en.isoformat() if tk.creado_en else None,
            "tecnico_nombre": tk.tecnico.nombre_completo if tk.tecnico else "Sin asignar",
        }
        for tk in tickets
    ]

    return ClienteDetalleRespuesta(
        id=cliente.id,
        usuario_id=cliente.usuario_id,
        nombre=u.nombre if u else "",
        apellido=u.apellido if u else "",
        nombre_completo=u.nombre_completo if u else "Cliente",
        email=u.email if u else "",
        telefono=u.telefono if u else None,
        telefono_alt=cliente.telefono_alt,
        nombre_empresa=cliente.nombre_empresa,
        tipo=cliente.tipo,
        documento=cliente.documento,
        creado_en=cliente.creado_en,
        total_comprado=total_comprado,
        cotizaciones=lista_cot,
        equipos=lista_eq,
        tickets=lista_tk,
    )


@router.patch("/{cliente_id}", response_model=ClienteDetalleRespuesta)
def editar_cliente(
    cliente_id: int,
    datos: ClienteActualizar,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_administradores),
):
    """
    Permite al administrador editar los datos de contacto y perfil de un cliente.
    """
    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id, Cliente.eliminado_en.is_(None)
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    u = cliente.usuario

    if datos.nombre_empresa is not None:
        cliente.nombre_empresa = datos.nombre_empresa.strip() or None
    if datos.tipo is not None:
        cliente.tipo = datos.tipo
    if datos.documento is not None:
        cliente.documento = datos.documento.strip()
    if datos.telefono_alt is not None:
        cliente.telefono_alt = datos.telefono_alt.strip() or None

    if u:
        if datos.nombre is not None:
            u.nombre = datos.nombre.strip()
        if datos.apellido is not None:
            u.apellido = datos.apellido.strip()
        if datos.telefono is not None:
            u.telefono = datos.telefono.strip() or None

    db.commit()
    db.refresh(cliente)

    return detalle_cliente(cliente.id, db, usuario_actual)


@router.delete("/{cliente_id}", status_code=status.HTTP_200_OK)
def eliminar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(solo_administradores),
):
    """
    Borrado lógico de cliente y desactivación de su cuenta de usuario.
    """
    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id, Cliente.eliminado_en.is_(None)
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    ahora = datetime.now(timezone.utc)
    cliente.eliminado_en = ahora
    if cliente.usuario:
        cliente.usuario.activo = False
        cliente.usuario.eliminado_en = ahora

    db.commit()
    return {"mensaje": f"Cliente #{cliente_id} eliminado exitosamente"}

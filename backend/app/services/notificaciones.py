import logging
import os
import time
from datetime import datetime, timezone
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.notificaciones import LogNotificacion

logger = logging.getLogger(__name__)

TELEGRAM_API_BASE = "https://api.telegram.org"


# ===========================================================================
# PASO 9.4: PLANTILLAS DE ALERTAS EN TIEMPO REAL
# ===========================================================================

def formatear_plantilla_alerta(tipo_evento: str, datos: dict[str, Any]) -> str:
    """Genera el texto formateado en Markdown para Telegram según el evento del sistema."""
    if tipo_evento == "nuevo_ticket":
        return (
            f"🎫 *NUEVO TICKET REGISTRADO*\n"
            f"• *Ticket:* #{datos.get('ticket_id')}\n"
            f"• *Título:* {datos.get('titulo')}\n"
            f"• *Prioridad:* {str(datos.get('prioridad', '')).upper()}\n"
            f"• *Cliente:* {datos.get('cliente_nombre', 'Cliente')}\n"
            f"• *Equipo ID:* {datos.get('equipo_id') or 'N/A'}\n"
            f"• *Hora:* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        )

    elif tipo_evento == "cotizacion_aceptada":
        return (
            f"💰 *¡COTIZACIÓN ACEPTADA POR EL CLIENTE!*\n"
            f"• *Cotización:* #{datos.get('cotizacion_id')}\n"
            f"• *Monto Total:* ${datos.get('total', 0):,.2f} COP\n"
            f"• *Cliente:* {datos.get('cliente_nombre', 'Cliente')}\n"
            f"• *Estado contable:* Ingreso registrado automáticamente en Fase 8\n"
            f"• *Hora:* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        )

    elif tipo_evento == "cambio_estado_ticket":
        return (
            f"🔄 *ACTUALIZACIÓN DE TICKET*\n"
            f"• *Ticket:* #{datos.get('ticket_id')}\n"
            f"• *Nuevo Estado:* {str(datos.get('nuevo_estado', '')).upper()}\n"
            f"• *Técnico/Responsable:* {datos.get('usuario_nombre', 'Personal C&R')}\n"
            f"• *Nota:* {datos.get('diagnostico', 'Actualización de avance')}"
        )

    elif tipo_evento == "contrato_por_vencer":
        return (
            f"⚠️ *ALERTA: CONTRATO PRÓXIMO A VENCER*\n"
            f"• *Contrato:* #{datos.get('contrato_id')}\n"
            f"• *Cliente:* {datos.get('cliente_nombre', 'Cliente')}\n"
            f"• *Días restantes:* {datos.get('dias_restantes')} días\n"
            f"• *Fecha Vencimiento:* {datos.get('fecha_vencimiento')}"
        )

    return f"ℹ️ *ALERTA C&R SOLUCIONES*\n• *Evento:* {tipo_evento}\n• *Detalle:* {datos.get('mensaje', 'Notificación general del sistema')}"


# ===========================================================================
# PASO 9.3: REINTENTOS AUTOMÁTICOS CON ESPERA EXPONENCIAL
# ===========================================================================

def enviar_mensaje_telegram(mensaje: str, max_intentos: int = 3) -> tuple[bool, int]:
    """
    Envía mensaje vía Telegram Bot API con política de reintentos exponenciales:
    Intento 1: inmediato, Intento 2: espera 1s, Intento 3: espera 2s.
    Retorna (exitoso: bool, total_intentos: int).
    """
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.getenv("TELEGRAM_CHAT_ID_ADMIN", "").strip()

    if not token or not chat_id:
        logger.info("Telegram no configurado (modo simulación activo)")
        return True, 1

    url = f"{TELEGRAM_API_BASE}/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": mensaje, "parse_mode": "Markdown"}

    intentos = 0
    espera = 1.0

    while intentos < max_intentos:
        intentos += 1
        try:
            with httpx.Client(timeout=10) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    return True, intentos
                logger.warning(f"Telegram respondió status {res.status_code}: {res.text}. Reintentando...")
        except Exception as e:
            logger.warning(f"Fallo conexión con Telegram (intento {intentos}/{max_intentos}): {e}")

        if intentos < max_intentos:
            time.sleep(espera)
            espera *= 2.0  # Exponencial: 1.0, 2.0, 4.0...

    return False, intentos


# ===========================================================================
# PASO 9.2: TAREA ASÍNCRONA (BACKGROUND TASK) QUE NO CONGELA LA PETICIÓN
# ===========================================================================

def ejecutar_tarea_notificacion_asincrona(
    tipo_evento: str,
    datos: dict[str, Any],
    usuario_id: int,
) -> None:
    """
    Función que se ejecuta en segundo plano (BackgroundTasks) para aislar
    la latencia de redes externas y garantizar respuesta inmediata al usuario.
    """
    mensaje = formatear_plantilla_alerta(tipo_evento, datos)
    exito, intentos = enviar_mensaje_telegram(mensaje)

    # Persistir auditoría en la tabla log_notificaciones
    db = SessionLocal()
    try:
        log = LogNotificacion(
            usuario_id=usuario_id,
            tipo_evento=tipo_evento,
            canal="telegram",
            mensaje=mensaje,
            estado="enviado" if exito else "fallido",
            intentos=intentos,
        )
        db.add(log)
        db.commit()
    except Exception as e:
        logger.error(f"Error guardando log de notificación: {e}")
    finally:
        db.close()

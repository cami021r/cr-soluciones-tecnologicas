"""Bot interactivo de Telegram para C&R Soluciones Tecnológicas.

Permite a los usuarios y al personal interactuar directamente con el bot de Telegram (@cyrsolucion_bot):
- /start o /ayuda: Saludo y opciones del sistema.
- /catalogo: Muestra servicios y productos disponibles.
- /cotizar <mensaje>: Cotiza mediante Inteligencia Artificial.
- Cualquier mensaje de texto: Asesor virtual C&R con IA.

Uso:
    python run_telegram_bot.py
"""

import logging
import os
import sys
import time
from pathlib import Path

# Asegurar compatibilidad de consola en Windows con caracteres UTF-8
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Asegurar que el directorio raíz de backend esté en sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
load_dotenv(backend_dir / ".env")

import httpx
from app.database import SessionLocal
from app.services.cotizador import construir_contexto_rag
from app.services.ia import consultar_ia

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("telegram_bot")

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
BASE_URL = f"https://api.telegram.org/bot{TOKEN}"


def enviar_mensaje(chat_id: int | str, texto: str, parse_mode: str = "HTML") -> bool:
    """Envía un mensaje formateado al chat de Telegram especificado."""
    try:
        with httpx.Client(timeout=15) as client:
            res = client.post(
                f"{BASE_URL}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": texto,
                    "parse_mode": parse_mode,
                },
            )
            return res.status_code == 200
    except Exception as e:
        logger.error(f"Error enviando mensaje a chat {chat_id}: {e}")
        return False


def manejar_comando_start(chat_id: int | str, nombre_usuario: str) -> None:
    mensaje = (
        f"👋 <b>¡Hola, {nombre_usuario}!</b>\n\n"
        f"Bienvenido al asistente oficial de <b>C&R Soluciones Tecnológicas</b> 💻🛠️\n\n"
        f"Estamos listos para ayudarte con soporte técnico, redes, cámaras de seguridad y cotizaciones.\n\n"
        f"<b>Comandos disponibles:</b>\n"
        f"• 📋 <b>/catalogo</b> - Consulta nuestros servicios y productos.\n"
        f"• 💡 <b>/cotizar &lt;descripción&gt;</b> - Cotiza de forma inteligente con IA.\n"
        f"• ℹ️ <b>/ayuda</b> - Información de contacto y mesa de ayuda.\n\n"
        f"<i>O simplemente escribe tu duda aquí y te responderemos de inmediato.</i>"
    )
    enviar_mensaje(chat_id, mensaje)


def manejar_comando_catalogo(chat_id: int | str) -> None:
    try:
        db = SessionLocal()
        try:
            from app.models.catalogo import ProductoExterno, ServicioCatalogo
            servicios = db.query(ServicioCatalogo).filter(ServicioCatalogo.activo.is_(True)).limit(5).all()
            productos = db.query(ProductoExterno).filter(ProductoExterno.activo.is_(True)).limit(5).all()

            texto = "📋 <b>CATÁLOGO OFICIAL C&R SOLUCIONES</b>\n\n"
            texto += "🔧 <b>Servicios Principales:</b>\n"
            for s in servicios:
                texto += f"• <b>{s.nombre}:</b> ${float(s.precio_mano_obra):,.0f} COP (Est: {float(s.horas_estimadas)}h)\n"

            texto += "\n📦 <b>Equipos y Materiales:</b>\n"
            for p in productos:
                texto += f"• <b>{p.nombre}:</b> ${float(p.precio_venta_sugerido):,.0f} COP (Stock: {p.stock_disponible})\n"

            texto += "\n<i>Para cotizar estos u otros elementos, escribe /cotizar o pregúntale al bot.</i>"
            enviar_mensaje(chat_id, texto)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error consultando catálogo: {e}")
        # Fallback informativo si la BD no está disponible
        texto_fallback = (
            "📋 <b>SERVICIOS C&R SOLUCIONES TECNOLÓGICAS:</b>\n"
            "• Mantenimiento preventivo y correctivo de cómputo.\n"
            "• Instalación y configuración de cámaras de seguridad (CCTV).\n"
            "• Cableado estructurado y redes WiFi empresariales.\n"
            "• Asesoría, ensamble y repuestos de hardware.\n\n"
            "<i>Escribe lo que necesitas y te ayudaremos con la cotización.</i>"
        )
        enviar_mensaje(chat_id, texto_fallback)


def manejar_consulta_ia(chat_id: int | str, mensaje_usuario: str) -> None:
    """Procesa el mensaje del usuario con el motor de IA de C&R Soluciones."""
    enviar_mensaje(chat_id, "⏳ <i>Analizando tu requerimiento con el motor de C&R Soluciones...</i>")

    contexto = ""
    try:
        db = SessionLocal()
        try:
            contexto = construir_contexto_rag(db)
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"No se pudo cargar contexto RAG de BD ({e}), usando catálogo base.")
        contexto = "Servicios: Instalación CCTV, Mantenimiento PC, Cableado Cat 6. Productos: Cámaras IP Dahua, Bobina UTP, Switch Gigabit."

    mensajes = [{"role": "user", "content": mensaje_usuario}]
    try:
        respuesta_ia = consultar_ia(mensajes, contexto)
        
        # Si la respuesta contiene el bloque JSON técnico de cotización, extraer la parte conversacional
        if "```json" in respuesta_ia:
            partes = respuesta_ia.split("```json")
            texto_limpio = partes[0].strip()
        else:
            texto_limpio = respuesta_ia.strip()

        if not texto_limpio:
            texto_limpio = "Hemos recibido tu consulta con éxito. Un asesor de C&R Soluciones Tecnológicas se pondrá en contacto o puedes revisar el catálogo con /catalogo."

        respuesta_final = f"🤖 <b>Asesor Virtual C&R:</b>\n\n{texto_limpio}"
        enviar_mensaje(chat_id, respuesta_final, parse_mode="HTML")
    except Exception as e:
        logger.error(f"Error en consulta IA: {e}")
        enviar_mensaje(
            chat_id,
            "⚠️ Gracias por tu mensaje. Para una cotización personalizada o soporte inmediato, también puedes visitar nuestra plataforma web o escribirnos al soporte."
        )


def procesar_actualizacion(update: dict) -> None:
    """Procesa un update recibido de Telegram."""
    mensaje = update.get("message")
    if not mensaje:
        return

    chat = mensaje.get("chat", {})
    chat_id = chat.get("id")
    texto = mensaje.get("text", "").strip()
    usuario = mensaje.get("from", {})
    nombre = usuario.get("first_name", "Cliente")

    if not chat_id or not texto:
        return

    logger.info(f"Mensaje de {nombre} (Chat {chat_id}): {texto}")

    if texto.startswith("/start"):
        manejar_comando_start(chat_id, nombre)
    elif texto.startswith("/ayuda") or texto.startswith("/help"):
        manejar_comando_start(chat_id, nombre)
    elif texto.startswith("/catalogo"):
        manejar_comando_catalogo(chat_id)
    elif texto.startswith("/cotizar"):
        consulta = texto[len("/cotizar"):].strip()
        if not consulta:
            enviar_mensaje(
                chat_id,
                "💡 <i>Por favor escribe qué necesitas cotizar después del comando. Ejemplo:</i>\n<code>/cotizar 4 cámaras de seguridad y un switch para un local</code>"
            )
        else:
            manejar_consulta_ia(chat_id, consulta)
    else:
        # Cualquier texto se atiende con el asesor IA
        manejar_consulta_ia(chat_id, texto)


def iniciar_polling() -> None:
    """Ejecuta el bucle de polling para escuchar mensajes en Telegram."""
    if not TOKEN:
        logger.error("No se encontró TELEGRAM_BOT_TOKEN en el entorno (.env).")
        print("ERROR: Configura TELEGRAM_BOT_TOKEN en backend/.env antes de iniciar el bot.")
        return

    print("=" * 60)
    print("🤖 BOT DE TELEGRAM C&R SOLUCIONES TECNOLÓGICAS INICIADO")
    print(f"Token: {TOKEN[:10]}... (Configurado)")
    print("Escuchando mensajes en Telegram (@cyrsolucion_bot)...")
    print("Presiona Ctrl+C para detener.")
    print("=" * 60)

    ultimo_update_id = 0

    while True:
        try:
            url = f"{BASE_URL}/getUpdates"
            params = {"timeout": 20, "offset": ultimo_update_id + 1}
            with httpx.Client(timeout=30) as client:
                res = client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    for update in data.get("result", []):
                        ultimo_update_id = update["update_id"]
                        procesar_actualizacion(update)
                elif res.status_code == 409:
                    logger.warning("Conflicto con otra instancia o webhook activo. Reintentando...")
                    time.sleep(5)
                else:
                    logger.warning(f"Respuesta inesperada de Telegram ({res.status_code}): {res.text}")
                    time.sleep(2)
        except httpx.RequestError as e:
            logger.warning(f"Error de red temporal: {e}")
            time.sleep(3)
        except KeyboardInterrupt:
            print("\nBot de Telegram detenido por el usuario.")
            break
        except Exception as e:
            logger.error(f"Error inesperado en polling: {e}")
            time.sleep(3)


if __name__ == "__main__":
    iniciar_polling()

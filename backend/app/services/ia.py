import json
import logging
import os
import re
from typing import Any

import httpx

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# ===========================================================================
# PASO 6.2: PROMPT DEL SISTEMA MAESTRO Y REGLAS ANTI-ALUCINACIÓN
# ===========================================================================

PROMPT_SISTEMA_MAESTRO = """Eres el Asesor Técnico y Comercial Virtual de 'C&R Soluciones Tecnológicas', una empresa especializada en telecomunicaciones, redes corporativas, cableado estructurado, sistemas de videovigilancia (CCTV) y soporte de infraestructura en Colombia.

TU MISIÓN:
Conversar cordialmente con el cliente, comprender sus requerimientos de soporte o instalación, hacerle las preguntas técnicas clave pertinentes del catálogo y, cuando tengas suficiente claridad, generar una cotización formal estructurada.

REGLAS ESTRICTAS DE OPERACIÓN (ANTI-ALUCINACIÓN):
1. SOLO puedes ofertar y cotizar servicios y productos que existan explícitamente en el CATÁLOGO TÉCNICO proporcionado a continuación.
2. NUNCA inventes precios, descuentos no autorizados ni repuestos que no estén en la lista oficial.
3. Si el cliente solicita algo que no manejamos, infórmale amablemente que en este momento C&R no ofrece ese producto o servicio en particular y sugiérele alternativas de nuestro catálogo.
4. Tono: Profesional, cordial, empático y orientado a solucionar problemas técnicos con precisión. Usa modismos profesionales colombianos estándar.
5. Preguntas clave: Si el cliente muestra interés en un servicio, hazle las preguntas clave asociadas (por ejemplo: cantidad de puntos, tipo de tendido, interior/exterior, número de dispositivos) antes de precipitarte a cerrar el valor.

CATÁLOGO COMERCIAL VIGENTE DE C&R SOLUCIONES:
{contexto_catalogo}

FORMATO DE RESPUESTA:
- Responde primero en texto claro y bien redactado para el cliente.
- OBLIGATORIO: Al final de TODO mensaje, debes incluir SIEMPRE un bloque de metadatos JSON delimitado exactamente con ```json y ```.
- Si la conversación aún está en fase de preguntas o diálogo y NO está lista para cotizar:
```json
{
  "es_cotizacion": false,
  "resumen": "Aclarando requerimientos con el cliente",
  "servicios": [],
  "productos": [],
  "observaciones": ""
}
```
- Si el cliente ya dio la información necesaria y es momento de generar la cotización:
```json
{
  "es_cotizacion": true,
  "resumen": "Descripción breve del proyecto a cotizar",
  "servicios": [
    {"id": <ID_DEL_SERVICIO>, "cantidad": <CANTIDAD>}
  ],
  "productos": [
    {"id": <ID_DEL_PRODUCTO>, "cantidad": <CANTIDAD>}
  ],
  "observaciones": "Notas sobre instalación, garantía o condiciones particulares"
}
```
"""


# ===========================================================================
# PASO 6.1: CLIENTE POLIVALENTE (GEMINI / CLAUDE / SIMULADOR SENA)
# ===========================================================================

def consultar_ia(mensajes: list[dict[str, str]], contexto_catalogo: str) -> str:
    """
    Envía la conversación y el catálogo RAG al motor de IA configurado.
    Prioridad:
    1. Google Gemini API (gratuita).
    2. Anthropic Claude API (si está configurada).
    3. Simulador Inteligente C&R (fallback autónomo $0 pesos).
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()

    prompt_sistema = PROMPT_SISTEMA_MAESTRO.format(contexto_catalogo=contexto_catalogo)

    # 1. Intentar con Gemini si la API key está disponible
    if gemini_key:
        try:
            return _consultar_gemini(gemini_key, prompt_sistema, mensajes)
        except Exception as e:
            logger.warning(f"Error consultando Gemini API: {e}. Probando siguiente proveedor...")

    # 2. Intentar con Anthropic Claude si la API key está disponible
    if anthropic_key:
        try:
            return _consultar_anthropic(anthropic_key, prompt_sistema, mensajes)
        except Exception as e:
            logger.warning(f"Error consultando Anthropic API: {e}. Activando simulador...")

    # 3. Fallback inteligente: Simulador local para pruebas sin saldo
    logger.info("Ejecutando en Modo Simulador Inteligente C&R ($0 costo).")
    return _simular_respuesta_c_and_r(mensajes, contexto_catalogo)


def _consultar_gemini(api_key: str, prompt_sistema: str, mensajes: list[dict[str, str]]) -> str:
    """Llama a Google Gemini vía HTTP REST API sin necesidad de dependencias adicionales."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"

    # Formatear el historial para Gemini
    contents = []
    # El prompt del sistema se incluye como contexto inicial
    contents.append({
        "role": "user",
        "parts": [{"text": f"[INSTRUCCIÓN DEL SISTEMA]:\n{prompt_sistema}"}]
    })
    contents.append({
        "role": "model",
        "parts": [{"text": "Entendido. Soy el Asesor Técnico y Comercial de C&R Soluciones. Seguiré estrictamente el catálogo y las directrices anti-alucinación."}]
    })

    for m in mensajes:
        rol = "user" if m.get("rol") == "user" else "model"
        contents.append({"role": rol, "parts": [{"text": m.get("contenido", "")}]})

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.2,
            "topP": 0.95,
            "maxOutputTokens": 2048,
        },
    }

    with httpx.Client(timeout=35.0) as client:
        res = client.post(url, json=payload)
        res.raise_for_status()
        data = res.json()
        candidates = data.get("candidates", [])
        if candidates and "content" in candidates[0]:
            parts = candidates[0]["content"].get("parts", [])
            if parts:
                return parts[0].get("text", "")
        raise ValueError("Respuesta vacía de Gemini API")


def _consultar_anthropic(api_key: str, prompt_sistema: str, mensajes: list[dict[str, str]]) -> str:
    """Llama a la API de Anthropic Claude."""
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    mensajes_claude = [
        {
            "role": "user" if m.get("rol") == "user" else "assistant",
            "content": m.get("contenido", ""),
        }
        for m in mensajes
    ]

    payload = {
        "model": "claude-3-haiku-20240307",
        "system": prompt_sistema,
        "messages": mensajes_claude,
        "max_tokens": 1500,
        "temperature": 0.2,
    }

    with httpx.Client(timeout=35.0) as client:
        res = client.post(url, headers=headers, json=payload)
        res.raise_for_status()
        data = res.json()
        contenido = data.get("content", [])
        if contenido and "text" in contenido[0]:
            return contenido[0]["text"]
        raise ValueError("Respuesta vacía de Anthropic API")


def _simular_respuesta_c_and_r(mensajes: list[dict[str, str]], contexto_catalogo: str) -> str:
    """
    Simulador determinista de conversación y cotización.
    Garantiza pruebas 100% funcionales, gratuitas y realistas.
    """
    ultimo_mensaje = mensajes[-1]["contenido"].lower() if mensajes else ""
    cantidad_mensajes = len(mensajes)

    # 1. Si el usuario pide cámaras o seguridad
    if any(k in ultimo_mensaje for k in ["cámara", "camara", "cctv", "vigilancia", "dahua", "hikvision"]):
        if cantidad_mensajes <= 2:
            return (
                "¡Hola! Con mucho gusto te asesoramos en C&R Soluciones Tecnológicas para tu sistema de cámaras de seguridad.\n\n"
                "Para estructurar la propuesta técnica adecuada, por favor indícanos:\n"
                "1. ¿Cuántas cámaras necesitas instalar aproximadamente?\n"
                "2. ¿Serán para ambientes interiores o exteriores?\n"
                "3. ¿Cuentas con equipo de grabación (DVR/NVR) o requieres incluirlo?\n\n"
                "```json\n"
                "{\n"
                '  "es_cotizacion": false,\n'
                '  "resumen": "Consultando detalles de instalación de cámaras",\n'
                '  "servicios": [],\n'
                '  "productos": [],\n'
                '  "observaciones": "Esperando especificaciones del cliente"\n'
                "}\n"
                "```"
            )
        else:
            return (
                "¡Excelente! Hemos estructurado tu cotización con base en nuestro catálogo oficial:\n\n"
                "- **Instalación y configuración de cámaras IP**: Mano de obra especializada y puesta a punto.\n"
                "- **Cámara Dahua 4MP exterior StarLight**: Resolución de alta fidelidad para intemperie.\n"
                "- **Switch TP-Link 8 puertos Gigabit**: Para conexión PoE y enlace de datos.\n\n"
                "A continuación hemos generado el detalle técnico para que puedas revisarlo y confirmar tu presupuesto:\n\n"
                "```json\n"
                "{\n"
                '  "es_cotizacion": true,\n'
                '  "resumen": "Instalación de cámaras de seguridad IP y switch de datos",\n'
                '  "servicios": [\n'
                '    {"id": 3, "cantidad": 2}\n'
                "  ],\n"
                '  "productos": [\n'
                '    {"id": 1, "cantidad": 2},\n'
                '    {"id": 2, "cantidad": 1}\n'
                "  ],\n"
                '  "observaciones": "Incluye fijación, configuración de red y garantía de 1 año en equipos"\n'
                "}\n"
                "```"
            )

    # 2. Si el usuario pide redes o cableado
    if any(k in ultimo_mensaje for k in ["cable", "red", "cableado", "cat6", "punto", "wifi", "router", "internet"]):
        if cantidad_mensajes <= 2:
            return (
                "¡Buen día! En C&R Soluciones somos expertos en cableado estructurado e infraestructura de red.\n\n"
                "Para poder calcular los materiales y tiempos exactos:\n"
                "1. ¿Cuántos puntos de red necesitas instalar?\n"
                "2. ¿En cuántos pisos o áreas se distribuirán?\n"
                "3. ¿El lugar cuenta con cielorraso o canaleta existente?\n\n"
                "```json\n"
                "{\n"
                '  "es_cotizacion": false,\n'
                '  "resumen": "Recopilando requerimientos de cableado de red",\n'
                '  "servicios": [],\n'
                '  "productos": [],\n'
                '  "observaciones": ""\n'
                "}\n"
                "```"
            )
        else:
            return (
                "¡Perfecto! Hemos preparado la propuesta técnica de cableado y conectividad:\n\n"
                "- **Instalación cableado Cat6**: Punto a punto con certificación.\n"
                "- **Cable UTP Cat6 Panduit**: Bobina certificada de alta velocidad.\n"
                "- **Router MikroTik hAP ac²**: Enrutamiento avanzado y cobertura WiFi.\n\n"
                "Ya puedes revisar el cálculo formal del presupuesto:\n\n"
                "```json\n"
                "{\n"
                '  "es_cotizacion": true,\n'
                '  "resumen": "Tendido de cableado Cat6 e instalación de router WiFi",\n'
                '  "servicios": [\n'
                '    {"id": 1, "cantidad": 4}\n'
                "  ],\n"
                '  "productos": [\n'
                '    {"id": 3, "cantidad": 1},\n'
                '    {"id": 4, "cantidad": 1}\n'
                "  ],\n"
                '  "observaciones": "Conexión punto a punto con cable certificado Panduit"\n'
                "}\n"
                "```"
            )

    # 3. Saludo o consulta general
    return (
        "¡Hola! Te damos la bienvenida a **C&R Soluciones Tecnológicas**. 👋\n\n"
        "Soy tu asesor virtual. Te puedo ayudar a cotizar:\n"
        "- Instalación y mantenimiento de redes y cableado Cat6.\n"
        "- Configuración de routers y WiFi empresarial (MikroTik, TP-Link).\n"
        "- Instalación de cámaras de seguridad IP (Dahua, Hikvision).\n"
        "- Mantenimiento preventivo y correctivo de computadores.\n\n"
        "¿En qué proyecto o requerimiento te gustaría que te apoyemos hoy?\n\n"
        "```json\n"
        "{\n"
        '  "es_cotizacion": false,\n'
        '  "resumen": "Saludo inicial y presentación de servicios",\n'
        '  "servicios": [],\n'
        '  "productos": [],\n'
        '  "observaciones": ""\n'
        "}\n"
        "```"
    )

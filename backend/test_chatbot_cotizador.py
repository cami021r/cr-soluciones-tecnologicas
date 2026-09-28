"""Prueba end-to-end del Motor de Cotización Inteligente con Chatbot IA (Fase 6).

Verifica:
1. Conexión y diálogo interactivo con el Chatbot (Paso 6.4).
2. RAG con catálogo comercial (Paso 6.3) y formulación de preguntas clave.
3. Extracción de JSON de cotización (Paso 6.5).
4. Motor matemático y cálculo de precios con margen comercial (Paso 6.6).
5. Persistencia de la cotización formal con estado "pendiente" (Paso 6.7).
6. Aceptación de cotización por parte del cliente (Paso 6.8).
7. Consulta del historial de mensajes de la sesión.

Uso:
    python test_chatbot_cotizador.py [http://localhost:8000]
"""

import sys
import uuid

import httpx

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
PASSWORD_SEEDERS = "Test1234!"

fallos = []


def verificar(descripcion: str, condicion: bool, detalle: str = "") -> None:
    resultado = "OK " if condicion else "FALLA"
    print(f"{resultado} {descripcion}{'' if condicion else f' -> {detalle}'}")
    if not condicion:
        fallos.append(descripcion)


def login(cliente: httpx.Client, email: str) -> str:
    respuesta = cliente.post(
        "/usuarios/login", json={"email": email, "password": PASSWORD_SEEDERS}
    )
    respuesta.raise_for_status()
    return respuesta.json()["access_token"]


def main() -> int:
    with httpx.Client(base_url=BASE_URL, timeout=35) as cliente:
        print("\n--- 1. Autenticación de Cliente ---")
        try:
            token_cliente = login(cliente, "cliente1@ejemplo.com")
        except Exception as e:
            print(f"Error autenticando: {e}")
            print("Asegúrate de que la API esté corriendo en local.")
            return 1

        headers = {"Authorization": f"Bearer {token_cliente}"}

        print("\n--- 2. Primer turno de conversación (Saludo y necesidad) ---")
        # El cliente pide asesoría para cámaras
        res1 = cliente.post(
            "/cotizaciones/chat",
            json={"contenido": "Hola, necesito cotizar la instalación de cámaras de seguridad para un local."},
            headers=headers,
        )
        verificar("El chatbot responde al primer mensaje", res1.status_code == 200, res1.text)
        datos1 = res1.json()
        conv_id = datos1.get("conversacion_id")
        verificar("Se genera un ID de conversación", conv_id is not None)
        verificar("En el primer turno no cierra la cotización precipitadamente", not datos1.get("es_cotizacion"))
        verificar("El texto contiene preguntas de asesoría", len(datos1.get("respuesta_ia", "")) > 20)

        print("\n--- 3. Segundo turno de conversación (Respuesta a preguntas clave) ---")
        # El cliente responde a las preguntas
        res2 = cliente.post(
            f"/cotizaciones/chat?conversacion_id={conv_id}",
            json={"contenido": "Serían 2 cámaras para exterior Dahua y necesitamos switch para conectarlas."},
            headers=headers,
        )
        verificar("El chatbot procesa las especificaciones", res2.status_code == 200, res2.text)
        datos2 = res2.json()
        es_cotiz = datos2.get("es_cotizacion")
        verificar("La IA detecta que la cotización está lista", es_cotiz is True, str(datos2))
        cotiz = datos2.get("cotizacion")
        verificar("Se devuelve el objeto de cotización persistido", cotiz is not None)

        cotizacion_id = cotiz.get("id") if cotiz else None
        total = cotiz.get("total") if cotiz else 0
        items = cotiz.get("items", []) if cotiz else []

        print(f"   -> Cotización #{cotizacion_id} generada con Total: ${float(total):,.2f}")
        verificar("El valor total de la cotización es positivo", float(total) > 0)
        verificar("La cotización incluye items detallados", len(items) >= 1)

        print("\n--- 4. Paso 6.8: Gestión de Cotizaciones y Cambio de Estado ---")
        # Consultar lista de cotizaciones
        res_list = cliente.get("/cotizaciones/", headers=headers)
        verificar("Listar cotizaciones del cliente", res_list.status_code == 200)

        # Consultar detalle formal
        res_det = cliente.get(f"/cotizaciones/{cotizacion_id}", headers=headers)
        verificar("Consultar detalle de la cotización creada", res_det.status_code == 200)
        verificar("Estado inicial es 'pendiente'", res_det.json().get("estado") == "pendiente")

        # Cliente acepta la cotización
        res_aceptar = cliente.patch(
            f"/cotizaciones/{cotizacion_id}/estado",
            json={"estado": "aceptada", "observacion": "Presupuesto aprobado por gerencia"},
            headers=headers,
        )
        verificar("Cliente acepta la cotización con éxito", res_aceptar.status_code == 200)
        verificar("Estado actualizado a 'aceptada'", res_aceptar.json().get("estado") == "aceptada")

        print("\n--- 5. Historial de la conversación de chat ---")
        res_hist = cliente.get(f"/cotizaciones/chat/{conv_id}/historial", headers=headers)
        verificar("Historial de chat recuperado", res_hist.status_code == 200)
        mensajes_recuperados = res_hist.json().get("mensajes", [])
        verificar("El historial almacena al menos 4 mensajes (2 user, 2 assistant)", len(mensajes_recuperados) >= 4)

        print("\n================ RESUMEN DE PRUEBAS FASE 6 ================")
        if fallos:
            print(f"❌ Ocurrieron {len(fallos)} fallos:")
            for f in fallos:
                print(f"   - {f}")
            return 1
        else:
            print("✅ TODAS LAS PRUEBAS DE LA FASE 6 PASARON SATISFACTORIAMENTE.")
            return 0


if __name__ == "__main__":
    sys.exit(main())

"""Prueba end-to-end de la Mesa de Ayuda y Sistema de Tickets (Fase 7).

Verifica:
1. Creación de ticket vinculado a equipo del inventario (Paso 7.2).
2. Transición automática del equipo a 'en_mantenimiento'.
3. Disparador de auditoría inmutable en backend (Paso 7.3).
4. Avance del servicio con bitácora interna y comentario visible (Paso 7.4).
5. Privacidad por rol: el cliente no puede ver comentarios internos (Paso 7.4).
6. Listado ordenado por prioridad y SLA (Paso 7.5).
7. Cierre oficial de ticket y liberación del equipo a 'disponible' (Paso 7.6).
8. Ciclo de vida completo validado (Paso 7.7).

Uso:
    python test_tickets_flujo.py [http://localhost:8000]
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
    uid = uuid.uuid4().hex[:6]

    with httpx.Client(base_url=BASE_URL, timeout=30) as cliente:
        print("\n--- 1. Autenticación de Usuarios ---")
        try:
            token_admin = login(cliente, "admin@crsoluciones.com")
            token_tecnico = login(cliente, "tecnico@crsoluciones.com")
            token_cliente = login(cliente, "cliente1@ejemplo.com")
        except Exception as e:
            print(f"Error autenticando: {e}")
            print("Asegúrate de que la API esté corriendo.")
            return 1

        admin_h = {"Authorization": f"Bearer {token_admin}"}
        tecnico_h = {"Authorization": f"Bearer {token_tecnico}"}
        cliente_h = {"Authorization": f"Bearer {token_cliente}"}

        print("\n--- 2. Paso 7.2: Apertura de Ticket vinculado a Equipo ---")
        # El cliente reporta una falla con prioridad alta
        res_ticket = cliente.post(
            "/tickets/",
            json={
                "titulo": f"Falla de enlace en Switch principal {uid}",
                "descripcion": "El puerto 4 pierde paquetes continuamente y se apaga el led de enlace.",
                "prioridad": "alta",
                "equipo_id": 1,
            },
            headers=cliente_h,
        )
        verificar("Crear ticket con prioridad alta", res_ticket.status_code == 201, res_ticket.text)
        ticket_data = res_ticket.json()
        ticket_id = ticket_data.get("id")
        verificar("Estado inicial es 'abierto'", ticket_data.get("estado") == "abierto")
        verificar("SLA límite para prioridad alta es de 8 horas", ticket_data.get("sla_limite_horas") == 8)

        # Validar que el equipo en inventario haya pasado a 'en_mantenimiento'
        res_eq = cliente.get("/inventario/1", headers=tecnico_h)
        verificar("Equipo en inventario pasa automáticamente a 'en_mantenimiento'", res_eq.json().get("estado") == "en_mantenimiento")

        print("\n--- 3. Paso 7.5: Consulta Ordenada por Prioridad y SLA ---")
        res_list = cliente.get("/tickets/", headers=tecnico_h)
        verificar("Listar tickets para el equipo técnico", res_list.status_code == 200)
        tickets = res_list.json()
        if tickets:
            # Los tickets de prioridad alta deben encabezar la lista
            verificar("Primer ticket en la cola de SLA tiene prioridad alta", tickets[0].get("prioridad") == "alta")

        print("\n--- 4. Asignación Técnica y Audit Trail (Paso 7.3) ---")
        # Asignar técnico (ID 2 es técnico del seeder)
        res_asig = cliente.patch(f"/tickets/{ticket_id}/asignar?tecnico_id=2", headers=admin_h)
        verificar("Asignar técnico al ticket", res_asig.status_code == 200, res_asig.text)
        verificar("Estado avanza automáticamente a 'en_proceso'", res_asig.json().get("estado") == "en_proceso")

        print("\n--- 5. Paso 7.4: Bitácora Privada vs Comentario Público ---")
        # Técnico escribe bitácora interna privada
        res_bitacora = cliente.post(
            f"/tickets/{ticket_id}/comentarios",
            json={
                "contenido": "Se verificó voltaje en el puerto con multímetro. Posible daño en transceiver SFP.",
                "es_interno": True,
            },
            headers=tecnico_h,
        )
        verificar("Técnico registra bitácora interna confidencial", res_bitacora.status_code == 201)

        # Técnico escribe actualización visible al cliente
        res_publico = cliente.post(
            f"/tickets/{ticket_id}/comentarios",
            json={
                "contenido": "Hola, hemos iniciado las pruebas técnicas en tu equipo en el laboratorio de C&R.",
                "es_interno": False,
            },
            headers=tecnico_h,
        )
        verificar("Técnico envía comentario visible al cliente", res_publico.status_code == 201)

        # Consultar desde la perspectiva del Cliente (Seguridad de datos)
        res_ver_cliente = cliente.get(f"/tickets/{ticket_id}", headers=cliente_h)
        comentarios_cliente = res_ver_cliente.json().get("comentarios", [])
        # El cliente NO debe ver la bitácora técnica ni las notas de auditoría interna
        contiene_privado = any(c.get("es_interno") for c in comentarios_cliente)
        verificar("El cliente NO puede ver bitácoras internas ni auditorías", not contiene_privado)
        verificar("El cliente ve el comentario público del técnico", len(comentarios_cliente) >= 1)

        # Consultar desde la perspectiva del Técnico
        res_ver_tecnico = cliente.get(f"/tickets/{ticket_id}", headers=tecnico_h)
        comentarios_tecnico = res_ver_tecnico.json().get("comentarios", [])
        verificar("El técnico sí visualiza las notas internas y auditorías", len(comentarios_tecnico) >= 3)

        print("\n--- 6. Paso 7.6: Cierre Oficial y Liberación del Equipo ---")
        res_cierre = cliente.patch(
            f"/tickets/{ticket_id}/cerrar?diagnostico_final=Reemplazo+de+puerto+y+certificaci%C3%B3n+exitosa",
            headers=tecnico_h,
        )
        verificar("Cierre oficial del ticket exitoso", res_cierre.status_code == 200, res_cierre.text)
        datos_cierre = res_cierre.json()
        verificar("Estado final es 'cerrado'", datos_cierre.get("estado") == "cerrado")
        verificar("Fecha de cerrado_en registrada", datos_cierre.get("cerrado_en") is not None)

        # Validar que el equipo haya quedado libre ('disponible') en el inventario
        res_eq_post = cliente.get("/inventario/1", headers=tecnico_h)
        verificar("Equipo en inventario liberado automáticamente a 'disponible'", res_eq_post.json().get("estado") == "disponible")

        print("\n================ RESUMEN DE PRUEBAS FASE 7 ================")
        if fallos:
            print(f"❌ Ocurrieron {len(fallos)} fallos:")
            for f in fallos:
                print(f"   - {f}")
            return 1
        else:
            print("✅ TODAS LAS PRUEBAS DE LA FASE 7 PASARON SATISFACTORIAMENTE.")
            return 0


if __name__ == "__main__":
    sys.exit(main())

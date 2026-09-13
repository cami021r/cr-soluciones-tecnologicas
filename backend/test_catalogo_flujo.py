"""Prueba end-to-end del flujo del Catálogo Comercial (Fase 5).

Verifica:
1. Creación de proveedores y productos externos vinculados.
2. Creación y actualización de servicios técnicos con preguntas clave.
3. Cálculo automático del precio de venta con margen de ganancia.
4. Búsqueda unificada en el catálogo (Paso 5.5).
5. Ruta de lectura rápida en milisegundos para el Chatbot IA (Paso 5.6).
6. Borrado lógico (Soft delete) de servicios y productos.

Uso:
    python test_catalogo_flujo.py [http://localhost:8000]
"""

import sys
import time
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
        print("\n--- 1. Autenticación de usuarios para pruebas ---")
        try:
            token_admin = login(cliente, "admin@crsoluciones.com")
            token_tecnico = login(cliente, "tecnico@crsoluciones.com")
            token_cliente = login(cliente, "cliente1@ejemplo.com")
        except Exception as e:
            print(f"Error conectando a la API o haciendo login: {e}")
            print("Asegúrate de que la API esté corriendo con 'uvicorn app.main:app'")
            return 1

        admin_headers = {"Authorization": f"Bearer {token_admin}"}
        tecnico_headers = {"Authorization": f"Bearer {token_tecnico}"}
        cliente_headers = {"Authorization": f"Bearer {token_cliente}"}

        print("\n--- 2. Paso 5.4: CRUD de Proveedores ---")
        # Crear proveedor
        res = cliente.post(
            "/catalogo/proveedores",
            json={
                "nombre": f"Proveedor Test {uid}",
                "contacto": "Carlos Vendedor",
                "telefono": "3119876543",
                "email": f"ventas_{uid}@proveedor.com",
            },
            headers=tecnico_headers,
        )
        verificar("Crear proveedor exitoso", res.status_code == 201, res.text)
        proveedor_id = res.json().get("id")

        # Proveedor duplicado debe fallar
        res_dup = cliente.post(
            "/catalogo/proveedores",
            json={"nombre": f"Proveedor Test {uid}"},
            headers=tecnico_headers,
        )
        verificar("Proveedor con nombre duplicado es rechazado", res_dup.status_code == 400, res_dup.text)

        # Listar proveedores
        res_list = cliente.get("/catalogo/proveedores", headers=cliente_headers)
        verificar("Listar proveedores con autenticación", res_list.status_code == 200, res_list.text)

        print("\n--- 3. Paso 5.2: Servicios Técnicos y Preguntas Clave ---")
        # Crear servicio con preguntas clave
        datos_servicio = {
            "nombre": f"Mantenimiento Fibra Óptica {uid}",
            "descripcion": "Revisión integral y empalme por fusión",
            "precio_mano_obra": 150000.00,
            "horas_estimadas": 2.50,
            "preguntas_clave": [
                {
                    "pregunta": "¿Cuántos hilos de fibra se van a fusionar?",
                    "tipo_respuesta": "numero",
                    "obligatoria": True,
                    "orden": 1,
                },
                {
                    "pregunta": "¿Es tendido aéreo o subterráneo?",
                    "tipo_respuesta": "seleccion",
                    "obligatoria": True,
                    "orden": 2,
                },
            ],
        }
        res_serv = cliente.post("/catalogo/servicios", json=datos_servicio, headers=tecnico_headers)
        verificar("Crear servicio técnico con preguntas clave", res_serv.status_code == 201, res_serv.text)
        servicio_id = res_serv.json().get("id")
        preguntas = res_serv.json().get("preguntas_clave", [])
        verificar("Preguntas clave asociadas correctamente", len(preguntas) == 2, str(preguntas))

        # Agregar pregunta clave individual
        res_preg = cliente.post(
            f"/catalogo/servicios/{servicio_id}/preguntas",
            json={
                "pregunta": "¿Se requiere certificación con reflectómetro (OTDR)?",
                "tipo_respuesta": "si_no",
                "obligatoria": False,
                "orden": 3,
            },
            headers=tecnico_headers,
        )
        verificar("Añadir pregunta clave a servicio existente", res_preg.status_code == 201, res_preg.text)

        # Consultar detalle del servicio
        res_serv_det = cliente.get(f"/catalogo/servicios/{servicio_id}", headers=cliente_headers)
        verificar("Consultar detalle de servicio con preguntas", res_serv_det.status_code == 200, res_serv_det.text)
        verificar("Servicio contiene 3 preguntas clave", len(res_serv_det.json().get("preguntas_clave", [])) == 3)

        print("\n--- 4. Paso 5.3: Productos Externos y Precio Calculado ---")
        # Crear producto externo
        res_prod = cliente.post(
            "/catalogo/productos",
            json={
                "proveedor_id": proveedor_id,
                "nombre": f"Transceiver SFP+ 10G {uid}",
                "descripcion": "Módulo óptico monomodo 10km",
                "costo_proveedor": 100000.00,
                "margen_ganancia": 0.35,  # 35% de ganancia -> Precio venta: 135000
                "tiempo_entrega_dias": 2,
                "stock_disponible": 15,
            },
            headers=tecnico_headers,
        )
        verificar("Crear producto externo exitoso", res_prod.status_code == 201, res_prod.text)
        producto_id = res_prod.json().get("id")
        precio_calculado = res_prod.json().get("precio_venta_sugerido")
        verificar(
            "Cálculo correcto de precio de venta sugerido (100k + 35% = 135k)",
            precio_calculado == 135000.00,
            f"Precio obtenido: {precio_calculado}",
        )

        print("\n--- 5. Paso 5.5: Búsqueda Unificada en el Catálogo ---")
        res_busq = cliente.get(f"/catalogo/buscar?q=Fibra", headers=cliente_headers)
        verificar("Endpoint de búsqueda responde 200", res_busq.status_code == 200, res_busq.text)
        total_serv = res_busq.json().get("total_servicios", 0)
        verificar("Búsqueda encuentra el servicio creado", total_serv >= 1, str(res_busq.json()))

        print("\n--- 6. Paso 5.6: Lectura Rápida de Conocimiento para Chatbot IA ---")
        t_inicio = time.perf_counter()
        res_ia = cliente.get("/catalogo/chatbot/conocimiento")
        t_transcurrido_ms = (time.perf_counter() - t_inicio) * 1000

        verificar("Endpoint de conocimiento IA responde 200", res_ia.status_code == 200, res_ia.text)
        verificar(
            f"Tiempo de respuesta veloz (< 200ms): {t_transcurrido_ms:.2f} ms",
            t_transcurrido_ms < 200,
            f"{t_transcurrido_ms:.2f} ms",
        )
        datos_ia = res_ia.json()
        verificar("Contiene estructura con servicios y productos", "servicios" in datos_ia and "productos" in datos_ia)

        print("\n--- 7. Soft Delete (Borrado Lógico) ---")
        # Borrar servicio por admin
        res_del_serv = cliente.delete(f"/catalogo/servicios/{servicio_id}", headers=admin_headers)
        verificar("Borrado lógico de servicio técnico por Admin", res_del_serv.status_code == 200, res_del_serv.text)

        # Borrar producto por admin
        res_del_prod = cliente.delete(f"/catalogo/productos/{producto_id}", headers=admin_headers)
        verificar("Borrado lógico de producto por Admin", res_del_prod.status_code == 200, res_del_prod.text)

        # Validar que ya no aparezca en activos
        res_serv_after = cliente.get(f"/catalogo/servicios/{servicio_id}", headers=cliente_headers)
        verificar("Servicio con soft delete no se muestra como activo", res_serv_after.status_code == 404)

        # Desactivar proveedor
        res_del_prov = cliente.delete(f"/catalogo/proveedores/{proveedor_id}", headers=admin_headers)
        verificar("Desactivar proveedor por Admin", res_del_prov.status_code == 200, res_del_prov.text)

        print("\n================ RESUMEN DE PRUEBAS FASE 5 ================")
        if fallos:
            print(f"❌ Ocurrieron {len(fallos)} fallos:")
            for f in fallos:
                print(f"   - {f}")
            return 1
        else:
            print("✅ TODAS LAS PRUEBAS DE LA FASE 5 PASARON SATISFACTORIAMENTE.")
            return 0


if __name__ == "__main__":
    sys.exit(main())

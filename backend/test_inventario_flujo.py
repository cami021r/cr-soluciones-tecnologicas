"""Prueba end-to-end del módulo de inventario (registro, QR, fotos, estados, filtros).

Uso: levantar la API y ejecutar `python test_inventario_flujo.py [http://localhost:8000]`
"""

import io
import sys
import time
import uuid

import httpx
from PIL import Image

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
PASSWORD_SEEDERS = "Test1234!"

fallos = []


def verificar(descripcion: str, condicion: bool, detalle: str = "") -> None:
    print(f"{'OK ' if condicion else 'FALLA'} {descripcion}{'' if condicion else f' -> {detalle}'}")
    if not condicion:
        fallos.append(descripcion)


def login(cliente: httpx.Client, email: str) -> str:
    respuesta = cliente.post(
        "/usuarios/login", json={"email": email, "password": PASSWORD_SEEDERS}
    )
    respuesta.raise_for_status()
    return respuesta.json()["access_token"]


def imagen_de_prueba() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (2400, 1200), (30, 90, 180)).save(buffer, format="PNG")
    return buffer.getvalue()


def main() -> None:
    with httpx.Client(base_url=BASE_URL, timeout=30) as cliente:
        token_tecnico = login(cliente, "tecnico@crsoluciones.com")
        token_admin = login(cliente, "admin@crsoluciones.com")
        tecnico = {"Authorization": f"Bearer {token_tecnico}"}
        admin = {"Authorization": f"Bearer {token_admin}"}

        # Un Cliente recién registrado no puede tocar el inventario
        email_cliente = f"cliente_{uuid.uuid4().hex[:8]}@test.com"
        cliente.post(
            "/usuarios/registro",
            json={
                "nombre": "Ana",
                "apellido": "Prueba",
                "email": email_cliente,
                "password": PASSWORD_SEEDERS,
            },
        ).raise_for_status()
        token_cliente = login(cliente, email_cliente)
        r = cliente.get("/inventario", headers={"Authorization": f"Bearer {token_cliente}"})
        verificar("Cliente no puede listar el inventario", r.status_code == 403, r.text)

        r = cliente.get("/inventario")
        verificar("Sin token el inventario está protegido", r.status_code == 401, r.text)

        # Registro de equipo (4.2) con QR automático (4.3)
        serie = f"CAM-TEST-{uuid.uuid4().hex[:8].upper()}"
        r = cliente.post(
            "/inventario",
            headers=tecnico,
            json={
                "categoria_id": 1,
                "numero_serie": serie,
                "marca": "Dahua",
                "modelo": "IPC-TEST",
                "descripcion": "Equipo creado por la prueba automática",
                "fecha_compra": "2025-02-01",
                "garantia_hasta": "2030-02-01",
            },
        )
        verificar("Técnico registra un equipo nuevo", r.status_code == 201, r.text)
        equipo = r.json()
        equipo_id = equipo["id"]
        verificar("El equipo nace con QR generado", bool(equipo["qr_codigo"]), str(equipo))

        r = cliente.get(equipo["qr_codigo"])
        verificar("El PNG del QR se sirve en /media", r.status_code == 200, r.text[:200])

        r = cliente.get(f"/inventario/{equipo_id}/qr", headers=tecnico)
        verificar(
            "El QR se puede descargar para imprimir",
            r.status_code == 200 and r.headers["content-type"] == "image/png",
            r.text[:200],
        )

        r = cliente.post(
            "/inventario",
            headers=tecnico,
            json={"categoria_id": 1, "numero_serie": serie, "marca": "X", "modelo": "Y"},
        )
        verificar("Rechaza número de serie duplicado", r.status_code == 409, r.text)

        r = cliente.post(
            "/inventario",
            headers=tecnico,
            json={
                "categoria_id": 999,
                "numero_serie": f"X-{uuid.uuid4().hex[:6]}",
                "marca": "X",
                "modelo": "Y",
            },
        )
        verificar("Rechaza categoría inexistente", r.status_code == 400, r.text)

        # Fotos con compresión a WebP (4.4)
        r = cliente.post(
            f"/inventario/{equipo_id}/fotos",
            headers=tecnico,
            files={"archivo": ("equipo.png", imagen_de_prueba(), "image/png")},
            data={"es_principal": "true"},
        )
        verificar("Sube foto del equipo", r.status_code == 201, r.text)
        url_foto = r.json()["url_foto"]
        verificar("La foto se guarda como WebP", url_foto.endswith(".webp"), url_foto)

        descargada = None
        for _ in range(20):  # la compresión corre en segundo plano
            respuesta_foto = cliente.get(url_foto)
            if respuesta_foto.status_code == 200:
                descargada = respuesta_foto.content
                break
            time.sleep(0.25)
        verificar("La foto comprimida queda disponible", descargada is not None)
        if descargada:
            with Image.open(io.BytesIO(descargada)) as img:
                verificar("La foto quedó en formato WebP", img.format == "WEBP", str(img.format))
                verificar("La foto se redimensionó a máx. 1600px", img.width == 1600, str(img.size))

        r = cliente.post(
            f"/inventario/{equipo_id}/fotos",
            headers=tecnico,
            files={"archivo": ("notas.txt", b"no soy una imagen", "text/plain")},
        )
        verificar("Rechaza archivos que no son imagen", r.status_code == 415, r.text)

        # Cambio de estado con historial automático (4.5)
        r = cliente.patch(
            f"/inventario/{equipo_id}/estado",
            headers=tecnico,
            json={"estado_nuevo": "en_mantenimiento", "observacion": "Entra a revisión de lente"},
        )
        verificar("Cambia el estado del equipo", r.status_code == 200, r.text)
        verificar("El estado quedó actualizado", r.json()["estado"] == "en_mantenimiento", r.text)

        r = cliente.patch(
            f"/inventario/{equipo_id}/estado",
            headers=tecnico,
            json={"estado_nuevo": "en_mantenimiento"},
        )
        verificar("Rechaza cambiar al mismo estado", r.status_code == 400, r.text)

        r = cliente.get(f"/inventario/{equipo_id}/historial", headers=tecnico)
        historial = r.json()
        verificar("El historial tiene el registro inicial y el cambio", len(historial) == 2, r.text)
        verificar(
            "El movimiento guarda estado anterior y nuevo",
            historial[0]["estado_anterior"] == "disponible"
            and historial[0]["estado_nuevo"] == "en_mantenimiento",
            str(historial[0]),
        )

        # Ficha pública del QR (4.6)
        r = cliente.get(f"/inventario/publico/{equipo_id}")
        verificar("La ficha pública abre sin token", r.status_code == 200, r.text)
        ficha = r.json()
        verificar(
            "La ficha muestra marca, modelo, estado y garantía",
            ficha["marca"] == "Dahua"
            and ficha["modelo"] == "IPC-TEST"
            and ficha["estado"] == "en_mantenimiento"
            and ficha["garantia_vigente"] is True,
            str(ficha),
        )
        verificar(
            "La ficha pública no expone datos internos",
            "numero_serie" not in ficha and "descripcion" not in ficha,
            str(ficha),
        )
        r = cliente.get("/inventario/publico/999999")
        verificar("Ficha pública de equipo inexistente da 404", r.status_code == 404, r.text)

        # Consultas, filtros y paginación (4.7)
        r = cliente.get("/inventario", headers=tecnico, params={"por_pagina": 2, "pagina": 1})
        pagina = r.json()
        verificar("Listado paginado devuelve 2 equipos", len(pagina["resultados"]) == 2, r.text)
        verificar("El total es mayor que la página", pagina["total"] > 2, r.text)

        r = cliente.get("/inventario", headers=tecnico, params={"estado": "disponible"})
        verificar(
            "Filtra por estado",
            all(e["estado"] == "disponible" for e in r.json()["resultados"]),
            r.text,
        )

        r = cliente.get("/inventario", headers=tecnico, params={"buscar": serie})
        verificar(
            "Busca por número de serie",
            r.json()["total"] == 1 and r.json()["resultados"][0]["id"] == equipo_id,
            r.text,
        )

        r = cliente.get("/inventario", headers=tecnico, params={"categoria_id": 2})
        verificar(
            "Filtra por categoría",
            all(e["categoria_id"] == 2 for e in r.json()["resultados"]),
            r.text,
        )

        r = cliente.get("/inventario", headers=tecnico, params={"cliente_id": 1})
        verificar("Filtra por cliente sin error", r.status_code == 200, r.text)

        # Borrado lógico solo para Administrador
        r = cliente.delete(f"/inventario/{equipo_id}", headers=tecnico)
        verificar("Técnico no puede eliminar equipos", r.status_code == 403, r.text)

        r = cliente.delete(f"/inventario/{equipo_id}", headers=admin)
        verificar("Administrador elimina (borrado lógico)", r.status_code == 204, r.text)

        r = cliente.get(f"/inventario/{equipo_id}", headers=tecnico)
        verificar("El equipo eliminado ya no aparece", r.status_code == 404, r.text)

    print()
    if fallos:
        print(f"{len(fallos)} prueba(s) fallaron:")
        for fallo in fallos:
            print(f" - {fallo}")
        sys.exit(1)
    print("Todas las pruebas del flujo de inventario pasaron.")


if __name__ == "__main__":
    main()

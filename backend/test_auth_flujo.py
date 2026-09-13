"""Prueba end-to-end del flujo de autenticación (registro, login, refresh, RBAC, logout).

Uso: levantar la API y ejecutar `python test_auth_flujo.py [http://localhost:8000]`
"""

import sys
import uuid

import httpx

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
PASSWORD_SEEDERS = "Test1234!"

fallos = []


def verificar(descripcion: str, condicion: bool, detalle: str = "") -> None:
    print(f"{'✅' if condicion else '❌'} {descripcion}{'' if condicion else f' -> {detalle}'}")
    if not condicion:
        fallos.append(descripcion)


def main() -> int:
    email = f"prueba_{uuid.uuid4().hex[:8]}@crsoluciones.com"

    with httpx.Client(base_url=BASE_URL, timeout=15) as cliente:
        r = cliente.post("/usuarios/registro", json={
            "nombre": "Usuario", "apellido": "Prueba", "email": email,
            "password": PASSWORD_SEEDERS, "telefono": "3000000000",
        })
        verificar("Registro de usuario nuevo", r.status_code == 201, r.text)

        r = cliente.post("/usuarios/registro", json={
            "nombre": "Usuario", "apellido": "Prueba", "email": email,
            "password": PASSWORD_SEEDERS,
        })
        verificar("Email duplicado es rechazado", r.status_code == 400, r.text)

        r = cliente.post("/usuarios/registro", json={
            "nombre": "Usuario", "apellido": "Prueba",
            "email": f"corta_{uuid.uuid4().hex[:6]}@x.com", "password": "123",
        })
        verificar("Contraseña corta es rechazada", r.status_code == 422, r.text)

        r = cliente.post("/usuarios/login", json={"email": email, "password": "incorrecta"})
        verificar("Login con contraseña incorrecta falla", r.status_code == 401, r.text)

        r = cliente.post("/usuarios/login", json={"email": email, "password": PASSWORD_SEEDERS})
        verificar("Login correcto devuelve access token", r.status_code == 200 and "access_token" in r.json(), r.text)
        token_cliente = r.json().get("access_token", "")
        verificar("Login entrega cookie de refresh", "refresh_token" in cliente.cookies, str(dict(cliente.cookies)))
        refresh_usado = cliente.cookies.get("refresh_token")

        r = cliente.get("/ejemplo/mi-perfil", headers={"Authorization": f"Bearer {token_cliente}"})
        verificar("Ruta protegida acepta el token", r.status_code == 200, r.text)

        r = cliente.get("/ejemplo/mi-perfil")
        verificar("Ruta protegida rechaza sin token", r.status_code == 401, r.text)

        r = cliente.get("/ejemplo/mi-perfil", headers={"Authorization": "Bearer token-falso"})
        verificar("Ruta protegida rechaza token inválido", r.status_code == 401, r.text)

        r = cliente.get("/ejemplo/panel-admin", headers={"Authorization": f"Bearer {token_cliente}"})
        verificar("RBAC: rol Cliente no entra al panel admin", r.status_code == 403, r.text)

        r = cliente.post("/usuarios/refresh")
        verificar("Refresh devuelve un access token nuevo", r.status_code == 200 and "access_token" in r.json(), r.text)
        verificar("Refresh rota la cookie", cliente.cookies.get("refresh_token") != refresh_usado)

        with httpx.Client(base_url=BASE_URL, timeout=15) as ladron:
            ladron.cookies.set("refresh_token", refresh_usado)
            r = ladron.post("/usuarios/refresh")
            verificar("Reusar un refresh rotado es rechazado", r.status_code == 401, r.text)

        r = cliente.post("/usuarios/refresh")
        verificar("Tras detectar reuso se revoca la sesión", r.status_code == 401, r.text)

        r = cliente.post("/usuarios/login", json={"email": "admin@crsoluciones.com", "password": PASSWORD_SEEDERS})
        verificar("Login del admin sembrado funciona", r.status_code == 200, r.text)
        token_admin = r.json().get("access_token", "")

        r = cliente.get("/ejemplo/panel-admin", headers={"Authorization": f"Bearer {token_admin}"})
        verificar("RBAC: rol Administrador entra al panel admin", r.status_code == 200, r.text)

        r = cliente.post("/usuarios/logout")
        verificar("Logout responde correctamente", r.status_code == 200, r.text)

        r = cliente.post("/usuarios/refresh")
        verificar("Refresh después del logout falla", r.status_code == 401, r.text)

    print()
    if fallos:
        print(f"{len(fallos)} prueba(s) fallaron: {', '.join(fallos)}")
        return 1
    print("Todas las pruebas del flujo de autenticación pasaron.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

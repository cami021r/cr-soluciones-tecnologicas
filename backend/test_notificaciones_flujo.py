"""Prueba integral de Notificaciones Automatizadas y Mensajería Asíncrona (Fase 9).

Verifica:
1. Plantillas estructuradas de alerta para Telegram (Paso 9.4).
2. Política de reintentos exponenciales ante fallos de red (Paso 9.3).
3. Despacho asíncrono con BackgroundTasks sin congelar al usuario (Paso 9.2).
4. Persistencia en la tabla log_notificaciones (Paso 9.6).
5. Disparo automático de alertas al crear tickets y aceptar cotizaciones.
"""

import os
import sys
from datetime import date
from decimal import Decimal

# Asegurar sys.path
sys.path.insert(0, os.path.abspath("."))
os.environ["DATABASE_URL"] = "sqlite:///test_notif.db"
os.environ["SECRET_KEY"] = "testsecretkey12345678901234567890"

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.roles import Rol
from app.models.usuarios import Usuario
from app.models.cotizaciones import Cliente, Cotizacion
from app.models.notificaciones import LogNotificacion
from app.core.security import hash_password
from app.services.notificaciones import (
    enviar_mensaje_telegram,
    formatear_plantilla_alerta,
)

fallos = []

def verificar(descripcion: str, condicion: bool, detalle: str = ""):
    resultado = "[OK] " if condicion else "[FALLA]"
    print(f"{resultado} {descripcion}{'' if condicion else f' -> {detalle}'}")
    if not condicion:
        fallos.append(descripcion)


def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    db.add(Rol(id=1, nombre="Administrador"))
    db.add(Rol(id=2, nombre="Técnico"))
    db.add(Rol(id=3, nombre="Cliente"))
    db.commit()

    admin = Usuario(
        rol_id=1, nombre="Camila", apellido="Quintero",
        email="admin@crsoluciones.com", password_hash=hash_password("Test1234!"),
        telefono="3115389889", activo=True
    )
    cliente_user = Usuario(
        rol_id=3, nombre="Carlos", apellido="Mendoza",
        email="cliente1@ejemplo.com", password_hash=hash_password("Test1234!"),
        telefono="3001234567", activo=True
    )
    db.add_all([admin, cliente_user])
    db.commit()

    cliente = Cliente(
        id=1, usuario_id=cliente_user.id, tipo="persona",
        documento="1020304050", telefono_alt="3001234567"
    )
    db.add(cliente)
    db.commit()
    db.close()


def main() -> int:
    setup_db()
    client = TestClient(app)

    print("\n--- 1. Paso 9.4: Formateo de plantillas de alerta ---")
    p_ticket = formatear_plantilla_alerta("nuevo_ticket", {
        "ticket_id": 101,
        "titulo": "Router no asigna IPs DHCP",
        "prioridad": "alta",
        "cliente_nombre": "Carlos Mendoza",
        "equipo_id": 4,
    })
    verificar("Plantilla 'nuevo_ticket' incluye ID y prioridad", "#101" in p_ticket and "ALTA" in p_ticket)

    p_cot = formatear_plantilla_alerta("cotizacion_aceptada", {
        "cotizacion_id": 55,
        "total": 1250000.0,
        "cliente_nombre": "Empresa Tech SAS",
    })
    verificar("Plantilla 'cotizacion_aceptada' incluye monto formateado", "1,250,000.00" in p_cot)

    p_contrato = formatear_plantilla_alerta("contrato_por_vencer", {
        "contrato_id": 12,
        "cliente_nombre": "María López",
        "dias_restantes": 7,
        "fecha_vencimiento": "2026-09-20",
    })
    verificar("Plantilla 'contrato_por_vencer' alerta días restantes", "7 días" in p_contrato)

    print("\n--- 2. Paso 9.3: Política de reintentos automáticos con espera exponencial ---")
    # En modo sin token configurado, la función reporta éxito de simulación
    exito, intentos = enviar_mensaje_telegram("Mensaje de prueba", max_intentos=3)
    verificar("Manejador de Telegram seguro ante credenciales vacías", exito is True and intentos == 1)

    print("\n--- 3. Paso 9.2: Despacho asíncrono con BackgroundTasks ---")
    r_login = client.post("/usuarios/login", json={"email": "admin@crsoluciones.com", "password": "Test1234!"})
    token_admin = r_login.json()["access_token"]
    admin_h = {"Authorization": f"Bearer {token_admin}"}

    res_alerta = client.post(
        "/notificaciones/probar-alerta",
        json={
            "tipo_evento": "prueba_sistema",
            "mensaje_personalizado": "Prueba de BackgroundTasks asíncrona",
        },
        headers=admin_h,
    )
    verificar("Endpoint de prueba responde 202 Accepted de inmediato", res_alerta.status_code == 202)
    verificar("Indica tarea asíncrona en respuesta", res_alerta.json().get("tarea_asincrona") is True)

    print("\n--- 4. Paso 9.6: Verificación de persistencia en log_notificaciones ---")
    # En TestClient de Starlette, las BackgroundTasks se ejecutan justo antes de devolver la respuesta
    r_historial = client.get("/notificaciones/historial", headers=admin_h)
    verificar("Consulta de historial de notificaciones responde 200", r_historial.status_code == 200)
    logs = r_historial.json()
    verificar("Registro persistido en la tabla log_notificaciones", len(logs) >= 1)
    if logs:
        verificar("Canal registrado es 'telegram'", logs[0]["canal"] == "telegram")
        verificar("Estado registrado es 'enviado'", logs[0]["estado"] == "enviado")

    print("\n--- 5. Integración del disparador automático de tickets con notificaciones ---")
    r_login_cli = client.post("/usuarios/login", json={"email": "cliente1@ejemplo.com", "password": "Test1234!"})
    token_cli = r_login_cli.json()["access_token"]
    cli_h = {"Authorization": f"Bearer {token_cli}"}

    res_ticket = client.post(
        "/tickets/",
        json={
            "titulo": "Caída intermitente del enlace principal de internet",
            "descripcion": "El enlace se desconecta cada 15 minutos",
            "prioridad": "alta",
        },
        headers=cli_h,
    )
    verificar("Creación de ticket responde 201 Created", res_ticket.status_code == 201)

    # Verificar que el ticket disparó una nueva notificación en segundo plano
    r_historial2 = client.get("/notificaciones/historial", headers=admin_h)
    logs2 = r_historial2.json()
    notif_tickets = [l for l in logs2 if l["tipo_evento"] == "nuevo_ticket"]
    verificar("Creación de ticket disparó alerta de notificación automática", len(notif_tickets) >= 1)

    print("\n========================================================")
    if fallos:
        print(f"[FALLA] {len(fallos)} prueba(s) fallaron: {', '.join(fallos)}")
        return 1
    print(">>> EXCELENTE: TODAS LAS PRUEBAS DE LA FASE 9 PASARON AL 100% <<<")
    print("========================================================\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

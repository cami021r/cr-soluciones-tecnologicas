"""Prueba de Generación y Descarga de Cotizaciones en PDF (Fase 10).

Verifica:
1. Renderizado dinámico de la cotización formal con membrete corporativo C&R (Paso 10.1).
2. Generación del archivo binario PDF de alta fidelidad (Paso 10.2).
3. Endpoint en FastAPI para descarga directa (Paso 10.3).
4. Paginación y estructura binaria válida (%PDF-) (Paso 10.6).
"""

import os
import sys
from decimal import Decimal

sys.path.insert(0, os.path.abspath("."))
os.environ["DATABASE_URL"] = "sqlite:///test_pdf.db"
os.environ["SECRET_KEY"] = "testsecretkey12345678901234567890"

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.roles import Rol
from app.models.usuarios import Usuario
from app.models.cotizaciones import Cliente, Cotizacion, ItemCotizacion
from app.core.security import hash_password
from app.services.pdf import generar_pdf_cotizacion

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
        id=1, usuario_id=cliente_user.id, nombre_empresa="Mendoza Tech SAS",
        tipo="empresa", documento="901.234.567-8", telefono_alt="3001234567"
    )
    db.add(cliente)
    db.commit()

    cot = Cotizacion(
        id=1,
        cliente_id=1,
        subtotal=Decimal("780000.00"),
        total=Decimal("780000.00"),
        estado="pendiente",
    )
    db.add(cot)
    db.commit()

    # Agregar items detallados
    item1 = ItemCotizacion(
        cotizacion_id=1,
        tipo_item="servicio",
        descripcion="Instalación y certificación de 4 puntos de red Cat6",
        cantidad=4,
        precio_unitario=Decimal("35000.00"),
        subtotal=Decimal("140000.00"),
    )
    item2 = ItemCotizacion(
        cotizacion_id=1,
        tipo_item="producto",
        descripcion="Switch TP-Link Gigabit 8 Puertos TL-SG108",
        cantidad=1,
        precio_unitario=Decimal("180000.00"),
        subtotal=Decimal("180000.00"),
    )
    item3 = ItemCotizacion(
        cotizacion_id=1,
        tipo_item="producto",
        descripcion="Cámara IP Dahua 4MP Exterior StarLight",
        cantidad=1,
        precio_unitario=Decimal("460000.00"),
        subtotal=Decimal("460000.00"),
    )
    db.add_all([item1, item2, item3])
    db.commit()
    db.close()


def main() -> int:
    setup_db()
    client = TestClient(app)

    print("\n--- 1. Paso 10.2: Generación binaria del PDF de cotización ---")
    db = SessionLocal()
    ruta_pdf, url_descarga = generar_pdf_cotizacion(db, 1)
    db.close()

    verificar("Archivo PDF existe en disco", ruta_pdf.exists())
    tamano = ruta_pdf.stat().st_size
    verificar(f"Tamaño de archivo válido ({tamano} bytes > 1KB)", tamano > 1024)

    with open(ruta_pdf, "rb") as f:
        cabecera = f.read(5)
    verificar("Cabecera oficial de documento PDF (%PDF-)", cabecera == b"%PDF-")

    print("\n--- 2. Paso 10.3 y 10.6: Descarga desde endpoint de FastAPI ---")
    r_login = client.post("/usuarios/login", json={"email": "cliente1@ejemplo.com", "password": "Test1234!"})
    token = r_login.json()["access_token"]

    r_pdf = client.get("/cotizaciones/1/pdf", headers={"Authorization": f"Bearer {token}"})
    verificar("Endpoint responde HTTP 200 OK", r_pdf.status_code == 200)
    verificar("Content-Type es 'application/pdf'", "application/pdf" in r_pdf.headers.get("content-type", ""))
    verificar("Nombre de archivo en Content-Disposition", "Cotizacion_COT_0001_CRSoluciones.pdf" in r_pdf.headers.get("content-disposition", ""))
    verificar("Contenido binario no vacío", len(r_pdf.content) > 1024)

    print("\n========================================================")
    if fallos:
        print(f"[FALLA] {len(fallos)} prueba(s) fallaron: {', '.join(fallos)}")
        return 1
    print(">>> EXCELENTE: TODAS LAS PRUEBAS DE LA FASE 10 PASARON AL 100% <<<")
    print("========================================================\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

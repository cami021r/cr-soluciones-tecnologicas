"""Pruebas completas del Motor Financiero y Métricas de Negocio (Fase 8).

Verifica:
1. Modelos de transacciones y categorías financieras (Paso 8.1).
2. Disparador automático de ingreso al aceptar cotización (Paso 8.2).
3. Carga manual de gastos operativos fijos y variables (Paso 8.3).
4. Contratos de renta y alertas de vencimiento (Paso 8.4).
5. Agregación de reportes mensuales sin errores de redondeo (Paso 8.5).
6. Algoritmo predictivo de flujo de caja para el trimestre siguiente (Paso 8.6).
7. Endpoints formateados en JSON para gráficas de Chart.js y dashboard (Paso 8.7).
8. Prueba contable masiva de precisión decimal con cientos de registros (Paso 8.8).
"""

import os
import sys
from datetime import date, timedelta
from decimal import Decimal
import uuid

# Asegurar sys.path
sys.path.insert(0, os.path.abspath("."))
os.environ["DATABASE_URL"] = "sqlite:///test_finanzas.db"
os.environ["SECRET_KEY"] = "testsecretkey12345678901234567890"

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.roles import Rol
from app.models.usuarios import Usuario
from app.models.cotizaciones import Cliente, Cotizacion, ItemCotizacion
from app.models.inventario import CategoriaEquipo, Equipo
from app.models.finanzas import CategoriaFinanciera, TransaccionFinanciera
from app.core.security import hash_password

fallos = []

def verificar(descripcion: str, condicion: bool, detalle: str = ""):
    resultado = "[OK] " if condicion else "[FALLA]"
    print(f"{resultado} {descripcion}{'' if condicion else f' -> {detalle}'}")
    if not condicion:
        fallos.append(descripcion)


def setup_base_de_datos():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Roles
    db.add(Rol(id=1, nombre="Administrador"))
    db.add(Rol(id=2, nombre="Técnico"))
    db.add(Rol(id=3, nombre="Cliente"))
    db.commit()

    # Usuarios
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

    # Cliente
    cliente = Cliente(
        id=1, usuario_id=cliente_user.id, tipo="persona",
        documento="1020304050", telefono_alt="3001234567"
    )
    db.add(cliente)

    # Categorías financieras iniciales
    db.add(CategoriaFinanciera(id=1, nombre="Cotización aceptada", tipo="ingreso", descripcion="Servicios"))
    db.add(CategoriaFinanciera(id=2, nombre="Renta de equipos", tipo="ingreso", descripcion="Arrendamientos"))
    db.add(CategoriaFinanciera(id=3, nombre="Compra de insumos", tipo="gasto", descripcion="Cables y repuestos"))
    db.add(CategoriaFinanciera(id=4, nombre="Servicios públicos", tipo="gasto", descripcion="Luz, internet oficina"))
    db.commit()

    # Categoría y Equipo
    cat_eq = CategoriaEquipo(id=1, nombre="CCTV", descripcion="Cámaras")
    db.add(cat_eq)
    db.commit()

    eq = Equipo(
        id=1, categoria_id=1, numero_serie="EQ-TEST-001",
        marca="Dahua", modelo="IPC-4MP", descripcion="Cámara IP",
        estado="disponible"
    )
    db.add(eq)
    db.commit()
    db.close()


def main() -> int:
    setup_base_de_datos()
    client = TestClient(app)

    print("\n--- 1. Autenticación y credenciales ---")
    r = client.post("/usuarios/login", json={"email": "admin@crsoluciones.com", "password": "Test1234!"})
    verificar("Login de Administrador", r.status_code == 200, r.text)
    admin_h = {"Authorization": f"Bearer {r.json()['access_token']}"}

    r = client.post("/usuarios/login", json={"email": "cliente1@ejemplo.com", "password": "Test1234!"})
    verificar("Login de Cliente", r.status_code == 200, r.text)
    cliente_h = {"Authorization": f"Bearer {r.json()['access_token']}"}

    print("\n--- 2. Paso 8.3: Carga manual de gastos operativos ---")
    r = client.post("/finanzas/transacciones", json={
        "categoria_id": 3,
        "descripcion": "Compra de conectores RJ45 y cable UTP",
        "monto": 185500.50,
        "tipo": "gasto",
        "es_fijo": False,
        "fecha": str(date.today()),
    }, headers=admin_h)
    verificar("Registro de gasto variable (insumos)", r.status_code == 201, r.text)

    r = client.post("/finanzas/transacciones", json={
        "categoria_id": 4,
        "descripcion": "Pago mensual servicio de Internet simétrico oficina",
        "monto": 220000.00,
        "tipo": "gasto",
        "es_fijo": True,
        "fecha": str(date.today()),
    }, headers=admin_h)
    verificar("Registro de gasto fijo (servicios públicos)", r.status_code == 201, r.text)

    r = client.get("/finanzas/transacciones", headers=admin_h)
    verificar("Listado de transacciones financieras", r.status_code == 200 and len(r.json()) >= 2, r.text)

    print("\n--- 3. Paso 8.4: Contratos de renta y alertas de vencimiento ---")
    fecha_ini = date.today() - timedelta(days=350)
    fecha_fin_proxima = date.today() + timedelta(days=10)  # Vence en 10 días (dentro del umbral de 15)

    r = client.post("/finanzas/contratos", json={
        "cliente_id": 1,
        "tipo": "renta",
        "fecha_inicio": str(fecha_ini),
        "fecha_vencimiento": str(fecha_fin_proxima),
        "valor_total": 450000.00,
        "observaciones": "Renta de cámara CCTV y switch 8p",
        "equipos_ids": [1],
    }, headers=admin_h)
    verificar("Creación de contrato de renta", r.status_code == 201, r.text)
    contrato_id = r.json()["id"]

    r = client.get("/finanzas/contratos/alertas-vencimiento?dias_umbral=15", headers=admin_h)
    verificar("Detección de alertas de contrato próximo a vencer", r.status_code == 200 and len(r.json()) >= 1, r.text)
    if r.json():
        verificar("Cálculo exacto de días restantes", r.json()[0]["dias_restantes"] == 10)

    print("\n--- 4. Paso 8.2: Disparador automático al aceptar cotización ---")
    # Crear una cotización formal en base de datos
    db = SessionLocal()
    cot = Cotizacion(
        cliente_id=1,
        subtotal=Decimal("850000.00"),
        total=Decimal("850000.00"),
        estado="pendiente",
    )
    db.add(cot)
    db.commit()
    db.refresh(cot)
    cot_id = cot.id
    db.close()

    # Cliente acepta la cotización
    r = client.patch(f"/cotizaciones/{cot_id}/estado", json={"estado": "aceptada"}, headers=cliente_h)
    verificar("Cliente acepta cotización", r.status_code == 200 and r.json()["estado"] == "aceptada", r.text)

    # Verificar que el disparador automático insertó la transacción contable
    r = client.get(f"/finanzas/transacciones?tipo=ingreso", headers=admin_h)
    ingresos = r.json()
    trans_auto = [t for t in ingresos if t.get("cotizacion_id") == cot_id]
    verificar("Disparador creó registro contable de ingreso automáticamente", len(trans_auto) == 1)
    if trans_auto:
        verificar("Monto exacto de ingreso registrado", Decimal(str(trans_auto[0]["monto"])) == Decimal("850000.00"))

    print("\n--- 5. Paso 8.5: Agregación de reportes mensuales y margen operativo ---")
    hoy = date.today()
    r = client.get(f"/finanzas/metricas/mensuales?mes={hoy.month}&anio={hoy.year}", headers=admin_h)
    verificar("Consulta de reporte mensual", r.status_code == 200, r.text)
    rep = r.json()
    ingresos_brutos = Decimal(str(rep["ingresos_brutos"]))
    gastos_totales = Decimal(str(rep["gastos_totales"]))
    utilidad_neta = Decimal(str(rep["utilidad_neta"]))

    verificar("Aritmética contable exacta (Utilidad = Ingresos - Gastos)", utilidad_neta == ingresos_brutos - gastos_totales)
    verificar("Margen operativo porcentual calculado", rep["margen_operativo_porcentaje"] > 0)
    verificar("Desglose por categoría de gastos disponible", len(rep["distribucion_gastos"]) >= 2)

    print("\n--- 6. Paso 8.6: Algoritmo predictivo de flujo de caja trimestral ---")
    r = client.get(f"/finanzas/metricas/proyeccion-trimestral?mes={hoy.month}&anio={hoy.year}", headers=admin_h)
    verificar("Algoritmo predictivo ejecutado", r.status_code == 200, r.text)
    proy = r.json()
    verificar("Generación de proyecciones para 3 meses siguientes", len(proy["proyecciones"]) == 3)
    verificar("Flujo neto acumulado calculado", Decimal(str(proy["flujo_neto_acumulado_proyectado"])) != Decimal("0.00"))

    print("\n--- 7. Paso 8.7: Endpoints formateados para Chart.js y Dashboard ---")
    r = client.get(f"/finanzas/graficas/resumen-anual?anio={hoy.year}", headers=admin_h)
    verificar("Estructura de barras anuales para Chart.js", r.status_code == 200 and len(r.json()["labels"]) == 12, r.text)

    r = client.get(f"/finanzas/graficas/distribucion-gastos?mes={hoy.month}&anio={hoy.year}", headers=admin_h)
    verificar("Estructura de dona para Chart.js", r.status_code == 200 and "datasets" in r.json(), r.text)

    r = client.get("/finanzas/dashboard-resumen", headers=admin_h)
    verificar("Dashboard resumen con KPIs en tiempo real", r.status_code == 200 and r.json()["contratos_activos"] >= 1, r.text)

    print("\n--- 8. Paso 8.8: Prueba contable masiva de precisión (500 registros con centavos) ---")
    db = SessionLocal()
    total_esperado = Decimal("0.00")
    for i in range(1, 501):
        # Generar montos con centavos variables
        monto_i = Decimal(f"{(i * 123.47) % 5000 + 10.25:.2f}")
        total_esperado += monto_i
        db.add(TransaccionFinanciera(
            categoria_id=3,
            descripcion=f"Simulación de microgasto #{i}",
            monto=monto_i,
            tipo="gasto",
            es_fijo=False,
            fecha=date.today(),
        ))
    db.commit()

    # Sumar directamente desde la API
    rep_sim = calcular_reporte_mensual(db, hoy.month, hoy.year)
    gastos_api = Decimal(str(rep_sim["gastos_totales"]))
    # Restar los gastos previos (185500.50 + 220000.00 = 405500.50)
    gastos_simulados = gastos_api - Decimal("405500.50")
    db.close()

    verificar(
        f"Precisión contable absoluta sin pérdida de decimales en 500 registros (Esperado: ${total_esperado} vs Obtenido: ${gastos_simulados})",
        gastos_simulados == total_esperado
    )

    print("\n========================================================")
    if fallos:
        print(f"[FALLA] {len(fallos)} prueba(s) fallaron: {', '.join(fallos)}")
        return 1
    print(">>> EXCELENTE: TODAS LAS PRUEBAS DE LA FASE 8 PASARON AL 100% <<<")
    print("========================================================\n")
    return 0


if __name__ == "__main__":
    from app.services.finanzas import calcular_reporte_mensual
    raise SystemExit(main())

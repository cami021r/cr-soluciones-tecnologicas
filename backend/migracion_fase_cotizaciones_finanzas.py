"""
Migración para Fase 3 (Cotizaciones) y Fase 4 (Finanzas)
- Amplía el enum de estado de cotizaciones a VARCHAR(50)
- Agrega descuento, porcentaje_iva, iva, notas_internas, ingreso_confirmado, fecha_visita_agendada
- Crea tabla historial_estados_cotizacion
- Amplía tipo en transacciones_financieras y categorias_financieras a VARCHAR(50) (soporta ingreso, gasto, inversion)
"""
import sys
from decimal import Decimal
from sqlalchemy import text
from app.database import engine

def migrar():
    print("Iniciando migración de base de datos para Fase 3 y Fase 4...")
    with engine.begin() as conn:
        # 1. Modificar cotizaciones.estado a VARCHAR(50)
        print("1. Modificando cotizaciones.estado...")
        conn.execute(text("ALTER TABLE cotizaciones MODIFY COLUMN estado VARCHAR(50) NOT NULL DEFAULT 'pendiente'"))

        # 2. Agregar columnas a cotizaciones si no existen
        columnas_actuales = [row[0] for row in conn.execute(text("DESCRIBE cotizaciones")).fetchall()]
        print(f"Columnas actuales en cotizaciones: {columnas_actuales}")

        if "descuento" not in columnas_actuales:
            print("Agregando 'descuento' a cotizaciones...")
            conn.execute(text("ALTER TABLE cotizaciones ADD COLUMN descuento DECIMAL(10,2) NOT NULL DEFAULT 0.00"))

        if "porcentaje_iva" not in columnas_actuales:
            print("Agregando 'porcentaje_iva' a cotizaciones...")
            conn.execute(text("ALTER TABLE cotizaciones ADD COLUMN porcentaje_iva DECIMAL(5,2) NOT NULL DEFAULT 19.00"))

        if "iva" not in columnas_actuales:
            print("Agregando 'iva' a cotizaciones...")
            conn.execute(text("ALTER TABLE cotizaciones ADD COLUMN iva DECIMAL(10,2) NOT NULL DEFAULT 0.00"))

        if "notas_internas" not in columnas_actuales:
            print("Agregando 'notas_internas' a cotizaciones...")
            conn.execute(text("ALTER TABLE cotizaciones ADD COLUMN notas_internas TEXT NULL"))

        if "ingreso_confirmado" not in columnas_actuales:
            print("Agregando 'ingreso_confirmado' a cotizaciones...")
            conn.execute(text("ALTER TABLE cotizaciones ADD COLUMN ingreso_confirmado TINYINT(1) NOT NULL DEFAULT 0"))

        if "fecha_visita_agendada" not in columnas_actuales:
            print("Agregando 'fecha_visita_agendada' a cotizaciones...")
            conn.execute(text("ALTER TABLE cotizaciones ADD COLUMN fecha_visita_agendada DATETIME NULL"))

        # 3. Crear tabla historial_estados_cotizacion
        print("3. Creando tabla historial_estados_cotizacion si no existe...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS historial_estados_cotizacion (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cotizacion_id INT NOT NULL,
                estado VARCHAR(50) NOT NULL,
                usuario_id INT NULL,
                usuario_nombre VARCHAR(150) NULL,
                observacion TEXT NULL,
                creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_cotizacion_id (cotizacion_id),
                CONSTRAINT fk_historial_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """))

        # 4. Modificar tipo en transacciones_financieras y categorias_financieras
        print("4. Modificando tipo en transacciones y categorías a VARCHAR(50)...")
        conn.execute(text("ALTER TABLE transacciones_financieras MODIFY COLUMN tipo VARCHAR(50) NOT NULL"))
        conn.execute(text("ALTER TABLE categorias_financieras MODIFY COLUMN tipo VARCHAR(50) NOT NULL"))

        # 5. Insertar categorías de inversión por defecto si no existen
        cat_inversion = conn.execute(text("SELECT id FROM categorias_financieras WHERE tipo = 'inversion' LIMIT 1")).fetchone()
        if not cat_inversion:
            print("Insertando categorías de inversión iniciales...")
            conn.execute(text("""
                INSERT INTO categorias_financieras (nombre, tipo, descripcion) VALUES
                ('Equipos & Herramientas Propias', 'inversion', 'Adquisición de instrumental técnico, fusionadoras y equipos propios de la empresa'),
                ('Infraestructura Tecnológica', 'inversion', 'Servidores, licencias corporativas y mejoras de red interna')
            """))

        # 6. Actualizar IVA y Total en cotizaciones existentes para que IVA sea 19%
        print("6. Calculando y actualizando IVA (19%) en cotizaciones existentes...")
        cotizaciones = conn.execute(text("SELECT id, subtotal, descuento, porcentaje_iva, estado, creado_en FROM cotizaciones")).fetchall()
        for cot in cotizaciones:
            cid = cot[0]
            subt = Decimal(str(cot[1] or 0))
            desc = Decimal(str(cot[2] or 0))
            p_iva = Decimal(str(cot[3] or 19))
            base = max(Decimal("0.00"), subt - desc)
            iva_calc = (base * (p_iva / Decimal("100.00"))).quantize(Decimal("0.01"))
            total_calc = (base + iva_calc).quantize(Decimal("0.01"))

            conn.execute(text("""
                UPDATE cotizaciones 
                SET iva = :iva, total = :total 
                WHERE id = :cid
            """), {"iva": iva_calc, "total": total_calc, "cid": cid})

            # Crear registro inicial en historial si no tiene
            tiene_historial = conn.execute(text("SELECT id FROM historial_estados_cotizacion WHERE cotizacion_id = :cid LIMIT 1"), {"cid": cid}).fetchone()
            if not tiene_historial:
                conn.execute(text("""
                    INSERT INTO historial_estados_cotizacion (cotizacion_id, estado, usuario_nombre, observacion, creado_en)
                    VALUES (:cid, :estado, 'Sistema C&R', 'Registro inicial de la cotización', :creado_en)
                """), {"cid": cid, "estado": cot[4], "creado_en": cot[5]})

    print("¡Migración completada con éxito!")

if __name__ == "__main__":
    migrar()

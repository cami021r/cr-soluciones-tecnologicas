import json
import logging
import re
from decimal import Decimal
from typing import Any

from sqlalchemy.orm import Session, joinedload

from app.models.catalogo import ProductoExterno, ServicioCatalogo

logger = logging.getLogger(__name__)


# ===========================================================================
# PASO 6.3: ESTRATEGIA RAG (RECUPERACIÓN AUMENTADA PARA EL CONTEXTO DEL CHAT)
# ===========================================================================

def construir_contexto_rag(db: Session, filtro_texto: str | None = None) -> str:
    """
    Recupera los servicios activos y productos de la base de datos (Fase 5)
    y genera un resumen estructurado para inyectar en el prompt de la IA.
    """
    servicios = (
        db.query(ServicioCatalogo)
        .options(joinedload(ServicioCatalogo.preguntas_clave))
        .filter(
            ServicioCatalogo.eliminado_en.is_(None),
            ServicioCatalogo.activo.is_(True),
        )
        .all()
    )

    productos = (
        db.query(ProductoExterno)
        .options(joinedload(ProductoExterno.proveedor))
        .filter(
            ProductoExterno.eliminado_en.is_(None),
            ProductoExterno.activo.is_(True),
        )
        .all()
    )

    lineas = ["--- SERVICIOS DISPONIBLES EN C&R ---"]
    for s in servicios:
        preguntas = [f"'{p.pregunta}'" for p in s.preguntas_clave]
        lineas.append(
            f"- Servicio ID {s.id}: '{s.nombre}' | Mano de obra base: ${float(s.precio_mano_obra):,.2f} | "
            f"Horas est: {float(s.horas_estimadas)}h | Preguntas guía: [{', '.join(preguntas)}]"
        )

    lineas.append("\n--- PRODUCTOS Y REPUESTOS EXTERNOS ---")
    for p in productos:
        proveedor_nom = p.proveedor.nombre if p.proveedor else "General"
        lineas.append(
            f"- Producto ID {p.id}: '{p.nombre}' | Proveedor: {proveedor_nom} | "
            f"Precio Venta Oficial: ${p.precio_venta_sugerido:,.2f} | Stock: {p.stock_disponible} | Entrega: {p.tiempo_entrega_dias} días"
        )

    return "\n".join(lineas)


# ===========================================================================
# PASO 6.5: PARSER SEGURO DEL JSON DE COTIZACIÓN
# ===========================================================================

def extraer_json_cotizacion(texto_respuesta: str) -> dict[str, Any]:
    """
    Busca y parsea de forma segura el bloque JSON incrustado por la IA.
    Maneja excepciones y formatos degradados.
    """
    # 1. Intentar capturar bloque ```json ... ```
    patron_bloque = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```", re.IGNORECASE)
    coincidencia = patron_bloque.search(texto_respuesta)

    cadena_json = ""
    if coincidencia:
        cadena_json = coincidencia.group(1).strip()
    else:
        # 2. Si no hay comillas invertidas, buscar el primer { y el último }
        inicio = texto_respuesta.find("{")
        fin = texto_respuesta.rfind("}")
        if inicio != -1 and fin != -1 and fin > inicio:
            cadena_json = texto_respuesta[inicio : fin + 1].strip()

    if not cadena_json:
        return {
            "es_cotizacion": False,
            "resumen": "",
            "servicios": [],
            "productos": [],
            "observaciones": "",
        }

    try:
        datos = json.loads(cadena_json)
        return {
            "es_cotizacion": bool(datos.get("es_cotizacion", False)),
            "resumen": str(datos.get("resumen", "")),
            "servicios": list(datos.get("servicios", [])),
            "productos": list(datos.get("productos", [])),
            "observaciones": str(datos.get("observaciones", "")),
        }
    except Exception as e:
        logger.warning(f"Error parseando JSON de cotización de la IA: {e}")
        return {
            "es_cotizacion": False,
            "resumen": "Error en formato JSON emitido por la IA",
            "servicios": [],
            "productos": [],
            "observaciones": "",
        }


def limpiar_texto_para_usuario(texto_respuesta: str) -> str:
    """Elimina el bloque técnico de ```json ... ``` para mostrar solo el mensaje conversacional."""
    patron_bloque = re.compile(r"```(?:json)?\s*[\s\S]*?\s*```", re.IGNORECASE)
    texto_limpio = patron_bloque.sub("", texto_respuesta).strip()
    return texto_limpio or texto_respuesta


# ===========================================================================
# PASO 6.6: MOTOR MATEMÁTICO FINANCIERO DE COTIZACIÓN
# Fórmula: Materiales + Horas de mano de obra × Tarifa + Margen
# ===========================================================================

def calcular_cotizacion_financiera(
    db: Session,
    servicios_solicitados: list[dict[str, Any]],
    productos_solicitados: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Aplica las fórmulas financieras oficiales con los datos reales de la base de datos.
    Devuelve los items calculados y el subtotal / total garantizado sin errores de redondeo.
    """
    items_calculados = []
    subtotal_general = Decimal("0.00")

    # 1. Procesar Servicios de mano de obra
    for s_item in servicios_solicitados:
        s_id = s_item.get("id")
        cantidad = Decimal(str(s_item.get("cantidad", 1)))
        if cantidad <= 0:
            cantidad = Decimal("1.00")

        servicio = db.query(ServicioCatalogo).filter(ServicioCatalogo.id == s_id).first()
        if not servicio:
            continue

        tarifa_mano_obra = Decimal(str(servicio.precio_mano_obra or 0))
        subtotal_item = tarifa_mano_obra * cantidad
        subtotal_general += subtotal_item

        items_calculados.append({
            "tipo_item": "servicio",
            "servicio_id": servicio.id,
            "producto_id": None,
            "descripcion": f"{servicio.nombre} (Mano de obra especializada)",
            "cantidad": cantidad,
            "precio_unitario": tarifa_mano_obra,
            "subtotal": subtotal_item,
        })

    # 2. Procesar Productos externos y repuestos
    for p_item in productos_solicitados:
        p_id = p_item.get("id")
        cantidad = Decimal(str(p_item.get("cantidad", 1)))
        if cantidad <= 0:
            cantidad = Decimal("1.00")

        producto = db.query(ProductoExterno).filter(ProductoExterno.id == p_id).first()
        if not producto:
            continue

        costo = Decimal(str(producto.costo_proveedor or 0))
        margen = Decimal(str(producto.margen_ganancia or 0))
        precio_venta_unitario = (costo * (Decimal("1.0") + margen)).quantize(Decimal("0.01"))
        subtotal_item = (precio_venta_unitario * cantidad).quantize(Decimal("0.01"))
        subtotal_general += subtotal_item

        items_calculados.append({
            "tipo_item": "producto",
            "servicio_id": None,
            "producto_id": producto.id,
            "descripcion": f"{producto.nombre}",
            "cantidad": cantidad,
            "precio_unitario": precio_venta_unitario,
            "subtotal": subtotal_item,
        })

    subtotal_general = subtotal_general.quantize(Decimal("0.01"))
    total_general = subtotal_general  # Si se requiere IVA se suma aquí

    return {
        "subtotal": subtotal_general,
        "total": total_general,
        "items": items_calculados,
    }

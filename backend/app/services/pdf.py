import logging
import os
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader
from sqlalchemy.orm import Session, joinedload

from app.core.almacenamiento import DIRECTORIO_MEDIA, url_publica_de
from app.models.cotizaciones import Cotizacion

logger = logging.getLogger(__name__)

DIRECTORIO_TEMPLATES = Path(__file__).resolve().parent.parent / "templates"
DIRECTORIO_PDFS = Path(DIRECTORIO_MEDIA) / "cotizaciones"
DIRECTORIO_PDFS.mkdir(parents=True, exist_ok=True)


def _renderizar_con_reportlab(datos_contexto: dict[str, Any], ruta_salida: Path) -> None:
    """Generador alternativo de alta fidelidad con ReportLab (100% nativo para Windows y entornos sin GTK)."""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    doc = SimpleDocTemplate(
        str(ruta_salida),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )
    styles = getSampleStyleSheet()
    elementos = []

    # 1. Encabezado
    cot = datos_contexto["cotizacion"]
    cli = datos_contexto["cliente"]

    titulo_style = ParagraphStyle(
        "BrandTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
    )
    sub_style = ParagraphStyle(
        "BrandSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#64748b"),
    )
    badge_style = ParagraphStyle(
        "BadgeTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        alignment=2,  # Right
        textColor=colors.HexColor("#2563eb"),
    )
    badge_num = ParagraphStyle(
        "BadgeNum",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=18,
        alignment=2,
        textColor=colors.HexColor("#0f172a"),
    )

    t_header = Table(
        [
            [
                Paragraph("<b>C&R</b> <font color='#2563eb'>Soluciones</font>", titulo_style),
                Paragraph("COTIZACIÓN FORMAL", badge_style),
            ],
            [
                Paragraph("C&R Soluciones Tecnológicas S.A.S. • NIT 901.834.855-2<br/>Bogotá D.C. • +57 311 538 9889 • contacto@crsoluciones.com", sub_style),
                Paragraph(f"#COT-{cot['id']:04d}<br/><font color='#64748b' size='8'>Emisión: {datos_contexto['fecha_emision']}</font>", badge_num),
            ],
        ],
        colWidths=[340, 200],
    )
    t_header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    elementos.append(t_header)
    elementos.append(Spacer(1, 10))
    elementos.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2563eb"), spaceAfter=14))

    # 2. Tarjeta de Cliente
    info_cliente = [
        [
            Paragraph("<b>CLIENTE / RAZÓN SOCIAL:</b>", sub_style),
            Paragraph("<b>DOCUMENTO / NIT:</b>", sub_style),
            Paragraph("<b>TELÉFONO:</b>", sub_style),
        ],
        [
            Paragraph(str(cli["nombre_completo"]), styles["Normal"]),
            Paragraph(str(cli["documento"]), styles["Normal"]),
            Paragraph(str(cli["telefono"] or "N/A"), styles["Normal"]),
        ],
    ]
    t_cli = Table(info_cliente, colWidths=[270, 140, 130])
    t_cli.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    elementos.append(t_cli)
    elementos.append(Spacer(1, 14))

    # 3. Tabla de Items
    tabla_items_data = [
        [
            Paragraph("<b>#</b>", styles["Normal"]),
            Paragraph("<b>CONCEPTO / SERVICIO</b>", styles["Normal"]),
            Paragraph("<b>CANT.</b>", styles["Normal"]),
            Paragraph("<b>V/R UNITARIO</b>", styles["Normal"]),
            Paragraph("<b>TOTAL (COP)</b>", styles["Normal"]),
        ]
    ]

    for idx, item in enumerate(datos_contexto["items"], start=1):
        tabla_items_data.append([
            str(idx),
            Paragraph(f"<b>{item['descripcion']}</b>", styles["Normal"]),
            str(item["cantidad"]),
            f"${item['precio_unitario']:,.2f}",
            f"${item['subtotal']:,.2f}",
        ])

    t_items = Table(tabla_items_data, colWidths=[30, 260, 45, 100, 105])
    t_items.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (2, 0), (2, -1), "CENTER"),
        ("ALIGN", (3, 0), (-1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ("PADDING", (0, 0), (-1, -1), 7),
    ]))
    elementos.append(t_items)
    elementos.append(Spacer(1, 16))

    # 4. Totales y Términos
    terminos_texto = (
        "<b>TÉRMINOS Y CONDICIONES COMERCIALES:</b><br/>"
        "• 50% anticipo al iniciar labores y 50% contra entrega a satisfacción.<br/>"
        "• Garantía: 12 meses en equipos y 6 meses sobre mano de obra.<br/>"
        "• Propuesta válida por 15 días calendario."
    )
    totales_data = [
        [
            Paragraph(terminos_texto, sub_style),
            Table([
                ["Subtotal:", f"${cot['subtotal']:,.2f}"],
                ["TOTAL:", f"${cot['total']:,.2f} COP"],
            ], colWidths=[70, 120], style=[
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("FONTNAME", (0, 1), (1, 1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 1), (1, 1), 12),
                ("TEXTCOLOR", (0, 1), (1, 1), colors.HexColor("#2563eb")),
                ("LINEABOVE", (0, 1), (1, 1), 1.5, colors.HexColor("#0f172a")),
                ("PADDING", (0, 0), (-1, -1), 4),
            ]),
        ]
    ]
    t_tot = Table(totales_data, colWidths=[330, 210])
    t_tot.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    elementos.append(t_tot)
    elementos.append(Spacer(1, 24))

    # 5. Footer
    elementos.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=8))
    elementos.append(Paragraph(
        "Documento emitido electrónicamente por C&R Soluciones Tecnológicas S.A.S. • PBX: +57 (601) 700 1122",
        ParagraphStyle("Foot", parent=styles["Normal"], fontSize=7.5, alignment=1, textColor=colors.HexColor("#94a3b8")),
    ))

    doc.build(elementos)


def generar_pdf_cotizacion(db: Session, cotizacion_id: int) -> tuple[Path, str]:
    """
    Ensambla la plantilla de la cotización y compila el archivo PDF.
    Usa WeasyPrint en producción Linux / OCI, y ReportLab en Windows como fallback nativo.
    Retorna (ruta_absoluta_pdf, url_descarga).
    """
    cotizacion = (
        db.query(Cotizacion)
        .options(
            joinedload(Cotizacion.items),
            joinedload(Cotizacion.cliente),
        )
        .filter(Cotizacion.id == cotizacion_id)
        .first()
    )
    if not cotizacion:
        raise ValueError(f"Cotización #{cotizacion_id} no existe")

    # Preparar datos de contexto
    cliente = cotizacion.cliente
    usuario = cliente.usuario if cliente else None

    nombre_cli = cliente.nombre_empresa if (cliente and cliente.nombre_empresa) else (usuario.nombre_completo if usuario else "Cliente")
    doc_cli = cliente.documento if cliente else "N/A"
    tel_cli = (cliente.telefono_alt or (usuario.telefono if usuario else None)) or "N/A"

    items_datos = []
    for it in cotizacion.items or []:
        items_datos.append({
            "descripcion": it.descripcion,
            "tipo": getattr(it, "tipo_item", "servicio"),
            "cantidad": int(it.cantidad),
            "precio_unitario": float(it.precio_unitario),
            "subtotal": float(it.subtotal),
        })

    if not items_datos:
        # Fallback si no tiene items detallados
        items_datos.append({
            "descripcion": "Servicios técnicos integrales y suministro según acuerdo comercial",
            "tipo": "servicio",
            "cantidad": 1,
            "precio_unitario": float(cotizacion.total or 0.0),
            "subtotal": float(cotizacion.total or 0.0),
        })

    hoy = date.today()
    fecha_emision = hoy.strftime("%d/%m/%Y")
    fecha_vencimiento = (hoy + timedelta(days=15)).strftime("%d/%m/%Y")

    datos_contexto = {
        "cotizacion": {
            "id": cotizacion.id,
            "subtotal": float(cotizacion.subtotal or 0.0),
            "total": float(cotizacion.total or 0.0),
        },
        "cliente": {
            "nombre_completo": nombre_cli,
            "nombre_empresa": cliente.nombre_empresa if cliente else None,
            "documento": doc_cli,
            "telefono": tel_cli,
        },
        "items": items_datos,
        "fecha_emision": fecha_emision,
        "fecha_vencimiento": fecha_vencimiento,
    }

    nombre_archivo = f"cotizacion_{cotizacion.id}.pdf"
    ruta_salida = DIRECTORIO_PDFS / nombre_archivo

    # Intentar renderizar con WeasyPrint si está disponible; sino, usar ReportLab
    renderizado = False
    try:
        from weasyprint import HTML
        env = Environment(loader=FileSystemLoader(str(DIRECTORIO_TEMPLATES)))
        template = env.get_template("cotizacion.html")
        html_out = template.render(**datos_contexto)
        HTML(string=html_out).write_pdf(str(ruta_salida))
        renderizado = True
    except Exception as e:
        logger.info(f"WeasyPrint no disponible ({e}). Renderizando con ReportLab...")

    if not renderizado:
        _renderizar_con_reportlab(datos_contexto, ruta_salida)

    # Actualizar la URL en la cotización
    url_descarga = f"/cotizaciones/{cotizacion.id}/pdf"
    cotizacion.url_pdf = url_descarga
    db.commit()

    return ruta_salida, url_descarga

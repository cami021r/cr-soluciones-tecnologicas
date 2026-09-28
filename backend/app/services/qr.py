"""Generación de los códigos QR que identifican físicamente cada equipo."""

from pathlib import Path

import qrcode

from app.core.almacenamiento import DIRECTORIO_QR, URL_PUBLICA, preparar_directorios


def contenido_qr(equipo_id: int) -> str:
    """URL de la ficha pública que se abre al escanear el QR pegado al equipo."""
    return f"{URL_PUBLICA}/inventario/publico/{equipo_id}"


def generar_qr(equipo_id: int) -> Path:
    preparar_directorios()
    archivo = DIRECTORIO_QR / f"equipo_{equipo_id}.png"
    imagen = qrcode.make(contenido_qr(equipo_id))
    imagen.save(archivo)
    return archivo

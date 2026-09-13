"""Rutas de almacenamiento local de archivos (QR y fotos del inventario).

En la Fase 14 estas rutas se reemplazan por un bucket de Object Storage; el resto
del código solo conoce la URL relativa que devuelven estas funciones.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

DIRECTORIO_MEDIA = Path(os.getenv("MEDIA_DIR", Path(__file__).resolve().parents[2] / "storage"))
DIRECTORIO_QR = DIRECTORIO_MEDIA / "qr"
DIRECTORIO_FOTOS = DIRECTORIO_MEDIA / "fotos"

# Base con la que se arma el contenido del QR (la ficha pública del equipo)
URL_PUBLICA = os.getenv("APP_PUBLIC_URL", "http://localhost:8000").rstrip("/")

RUTA_MEDIA = "/media"


def preparar_directorios() -> None:
    DIRECTORIO_QR.mkdir(parents=True, exist_ok=True)
    DIRECTORIO_FOTOS.mkdir(parents=True, exist_ok=True)


def url_publica_de(ruta: Path) -> str:
    return f"{RUTA_MEDIA}/{ruta.relative_to(DIRECTORIO_MEDIA).as_posix()}"

"""Compresión de las fotos del inventario a WebP para no llenar el almacenamiento."""

from pathlib import Path

from PIL import Image

ANCHO_MAXIMO = 1600
CALIDAD_WEBP = 80


def comprimir_a_webp(origen: Path, destino: Path) -> None:
    """Convierte la imagen a WebP redimensionándola si excede el ancho máximo."""
    with Image.open(origen) as imagen:
        imagen = imagen.convert("RGB")
        if imagen.width > ANCHO_MAXIMO:
            alto = round(imagen.height * ANCHO_MAXIMO / imagen.width)
            imagen = imagen.resize((ANCHO_MAXIMO, alto), Image.LANCZOS)
        imagen.save(destino, format="WEBP", quality=CALIDAD_WEBP, method=6)
    origen.unlink(missing_ok=True)

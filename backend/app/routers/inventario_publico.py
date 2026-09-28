"""Ficha que se abre al escanear el QR pegado en un equipo: sin login y sin datos sensibles."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventario import Equipo, FotoEquipo
from app.schemas.inventario import FichaPublica

router = APIRouter(prefix="/inventario/publico", tags=["Inventario público"])


@router.get("/{equipo_id}", response_model=FichaPublica)
def ficha_publica(equipo_id: int, db: Session = Depends(get_db)):
    equipo = (
        db.query(Equipo)
        .filter(Equipo.id == equipo_id, Equipo.eliminado_en.is_(None))
        .one_or_none()
    )
    if equipo is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Equipo no encontrado")

    foto = (
        db.query(FotoEquipo)
        .filter(FotoEquipo.equipo_id == equipo.id, FotoEquipo.es_principal.is_(True))
        .first()
    )

    return FichaPublica(
        id=equipo.id,
        marca=equipo.marca,
        modelo=equipo.modelo,
        categoria=equipo.categoria.nombre,
        estado=equipo.estado,
        garantia_hasta=equipo.garantia_hasta,
        garantia_vigente=bool(equipo.garantia_hasta and equipo.garantia_hasta >= date.today()),
        foto_principal=foto.url_foto if foto else None,
    )

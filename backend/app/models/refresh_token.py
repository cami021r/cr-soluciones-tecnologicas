from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # Nunca se guarda el token en texto plano, solo su hash SHA-256
    token_hash = Column(String(64), unique=True, nullable=False, index=True)

    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    expira_en = Column(DateTime(timezone=True), nullable=False)
    revocado = Column(Boolean, default=False, nullable=False)

    usuario = relationship("Usuario", back_populates="refresh_tokens")

    def esta_expirado(self) -> bool:
        # MySQL devuelve DATETIME sin zona horaria; las fechas se guardan en UTC.
        expira_en = self.expira_en
        if expira_en.tzinfo is None:
            expira_en = expira_en.replace(tzinfo=timezone.utc)
        return expira_en < datetime.now(timezone.utc)
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False)

    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    telefono = Column(String(20), nullable=True)

    activo = Column(Boolean, default=True)

    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    actualizado_en = Column(DateTime(timezone=True), onupdate=func.now())
    eliminado_en = Column(DateTime(timezone=True), nullable=True)  # Soft delete

    rol = relationship("Rol", back_populates="usuarios")
    refresh_tokens = relationship("RefreshToken", back_populates="usuario")

    @property
    def nombre_completo(self) -> str:
        return f"{self.nombre} {self.apellido}"

    def esta_activo(self) -> bool:
        return self.activo and self.eliminado_en is None
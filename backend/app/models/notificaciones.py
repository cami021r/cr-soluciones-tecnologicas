from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.database import Base


class LogNotificacion(Base):
    __tablename__ = "log_notificaciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    tipo_evento = Column(String(100), nullable=False)
    canal = Column(Enum("telegram", "email"), nullable=False)
    mensaje = Column(Text, nullable=False)
    estado = Column(Enum("enviado", "fallido", "reintentando"), nullable=False, default="enviado")
    intentos = Column(Integer, nullable=False, default=1)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    usuario = relationship("Usuario")

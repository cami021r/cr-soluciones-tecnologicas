from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Literal

TipoCliente = Literal["persona", "empresa"]

class ClienteActualizar(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    nombre_empresa: str | None = None
    tipo: TipoCliente | None = None
    documento: str | None = None
    telefono_alt: str | None = None

class ClienteItemResumen(BaseModel):
    id: int
    usuario_id: int
    nombre: str
    apellido: str
    nombre_completo: str
    email: str
    telefono: str | None = None
    telefono_alt: str | None = None
    nombre_empresa: str | None = None
    tipo: str
    documento: str
    creado_en: datetime
    total_cotizaciones: int = 0
    total_cotizaciones_aceptadas: int = 0
    total_comprado: float = 0.0
    total_equipos: int = 0
    total_tickets: int = 0
    tickets_abiertos: int = 0

class ClienteDetalleRespuesta(BaseModel):
    id: int
    usuario_id: int
    nombre: str
    apellido: str
    nombre_completo: str
    email: str
    telefono: str | None = None
    telefono_alt: str | None = None
    nombre_empresa: str | None = None
    tipo: str
    documento: str
    creado_en: datetime
    total_comprado: float = 0.0
    cotizaciones: list[dict] = []
    equipos: list[dict] = []
    tickets: list[dict] = []

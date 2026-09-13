import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password_plano: str, password_hash: str) -> bool:
    return pwd_context.verify(password_plano, password_hash)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


def crear_token_acceso(datos: dict) -> str:
    to_encode = datos.copy()
    expira = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expira})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

REFRESH_TOKEN_EXPIRE_DIAS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DIAS", 14))

# En local (http://localhost) el navegador descarta las cookies con Secure,
# por eso solo se activa fuera de desarrollo.
ENTORNO = os.getenv("ENVIRONMENT", "development")
COOKIE_SECURE = ENTORNO != "development"


def generar_token_refresco() -> str:
    """Token opaco y aleatorio (NO es JWT) que se envía al cliente una sola vez."""
    return secrets.token_urlsafe(64)


def hash_token(token_crudo: str) -> str:
    """Solo el hash se guarda en la base de datos, nunca el token crudo."""
    return hashlib.sha256(token_crudo.encode()).hexdigest()


def token_refresco_expira() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DIAS)
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.usuarios import Usuario
from app.models.refresh_token import RefreshToken
from app.schemas.usuarios import UsuarioCrear, UsuarioRespuesta, LoginRequest, TokenRespuesta
from app.core.security import (
    COOKIE_SECURE,
    hash_password,
    verify_password,
    crear_token_acceso,
    generar_token_refresco,
    hash_token,
    token_refresco_expira,
)

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

NOMBRE_COOKIE_REFRESH = "refresh_token"


def _emitir_tokens(usuario: Usuario, db: Session, response: Response) -> TokenRespuesta:
    """Crea un access token (JWT) + un refresh token nuevo, y guarda el hash en la BD."""
    access_token = crear_token_acceso({
        "sub": str(usuario.id),
        "email": usuario.email,
        "rol_id": usuario.rol_id,
    })

    token_crudo = generar_token_refresco()
    nuevo_refresh = RefreshToken(
        usuario_id=usuario.id,
        token_hash=hash_token(token_crudo),
        expira_en=token_refresco_expira(),
    )
    db.add(nuevo_refresh)
    db.commit()

    response.set_cookie(
        key=NOMBRE_COOKIE_REFRESH,
        value=token_crudo,
        httponly=True,       # JavaScript no puede leerla (mitiga XSS)
        secure=COOKIE_SECURE,  # solo viaja por HTTPS fuera de desarrollo
        samesite="lax",
        max_age=60 * 60 * 24 * 14,  # 14 días
        path="/usuarios",
    )

    return TokenRespuesta(access_token=access_token)


@router.post("/registro", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
def registrar_usuario(datos: UsuarioCrear, db: Session = Depends(get_db)):
    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        email=datos.email,
        password_hash=hash_password(datos.password),
        telefono=datos.telefono,
        rol_id=datos.rol_id,
    )

    db.add(nuevo_usuario)
    try:
        db.commit()
        db.refresh(nuevo_usuario)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ese email ya está registrado")

    return nuevo_usuario


@router.post("/login", response_model=TokenRespuesta)
def login(datos: LoginRequest, response: Response, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()

    if not usuario or not verify_password(datos.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )

    if not usuario.esta_activo():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este usuario está inactivo",
        )

    return _emitir_tokens(usuario, db, response)


@router.post("/refresh", response_model=TokenRespuesta)
def refrescar_token(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str | None = Cookie(default=None, alias=NOMBRE_COOKIE_REFRESH),
):
    if not refresh_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No hay sesión activa")

    token_hash_recibido = hash_token(refresh_token)
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash_recibido
    ).first()

    if not db_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido")

    if db_token.revocado:
        # Reuso de un token ya rotado -> posible robo: se revoca TODA la sesión del usuario
        db.query(RefreshToken).filter(
            RefreshToken.usuario_id == db_token.usuario_id,
            RefreshToken.revocado == False,  # noqa: E712
        ).update({"revocado": True})
        db.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesión comprometida, inicia sesión de nuevo")

    if db_token.esta_expirado():
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesión expirada")

    usuario = db.query(Usuario).get(db_token.usuario_id)
    if not usuario or not usuario.esta_activo():
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Usuario inactivo")

    # Rotación: se revoca el token usado y se emite uno nuevo
    db_token.revocado = True
    db.commit()

    return _emitir_tokens(usuario, db, response)


@router.post("/logout")
def logout(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str | None = Cookie(default=None, alias=NOMBRE_COOKIE_REFRESH),
):
    if refresh_token:
        token_hash_recibido = hash_token(refresh_token)
        db.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash_recibido
        ).update({"revocado": True})
        db.commit()

    response.delete_cookie(NOMBRE_COOKIE_REFRESH, path="/usuarios")
    return {"detail": "Sesión cerrada"}
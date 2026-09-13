from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuarios import Usuario
from app.core.security import SECRET_KEY, ALGORITHM

# Le dice a Swagger UI dónde está el endpoint de login (solo para el botón "Authorize")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="usuarios/login")


def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    """Lee el JWT del header Authorization, y devuelve el Usuario correspondiente."""
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la sesión",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id = payload.get("sub")
        if usuario_id is None:
            raise credenciales_invalidas
    except JWTError:
        raise credenciales_invalidas

    usuario = db.query(Usuario).get(int(usuario_id))
    if usuario is None or not usuario.esta_activo():
        raise credenciales_invalidas

    return usuario


def requiere_roles(*roles_permitidos: str):
    """
    Genera una dependencia que solo deja pasar a usuarios con uno de los roles indicados.
    Uso: Depends(requiere_roles("Administrador"))
         Depends(requiere_roles("Administrador", "Técnico"))
    """

    def verificar(usuario: Usuario = Depends(obtener_usuario_actual)) -> Usuario:
        if usuario.rol.nombre not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de estos roles: {', '.join(roles_permitidos)}",
            )
        return usuario

    return verificar
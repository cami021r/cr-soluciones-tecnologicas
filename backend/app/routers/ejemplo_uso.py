from fastapi import APIRouter, Depends

from app.core.dependencies import obtener_usuario_actual, requiere_roles
from app.models.usuarios import Usuario

router = APIRouter(prefix="/ejemplo", tags=["Ejemplo"])


# Cualquier usuario logueado (sin importar el rol) puede entrar aquí:
@router.get("/mi-perfil")
def mi_perfil(usuario: Usuario = Depends(obtener_usuario_actual)):
    return {"nombre": usuario.nombre_completo, "rol": usuario.rol.nombre}


# Solo Administrador puede entrar aquí:
@router.get("/panel-admin")
def panel_admin(usuario: Usuario = Depends(requiere_roles("Administrador"))):
    return {"mensaje": f"Bienvenido {usuario.nombre}, tienes acceso de administrador"}


# Administrador O Técnico pueden entrar aquí (pero no Cliente):
@router.get("/gestion-tickets")
def gestion_tickets(usuario: Usuario = Depends(requiere_roles("Administrador", "Técnico"))):
    return {"mensaje": "Acceso concedido a gestión de tickets"}
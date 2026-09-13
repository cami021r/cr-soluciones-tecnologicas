from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.core.almacenamiento import DIRECTORIO_MEDIA, RUTA_MEDIA, preparar_directorios
from app.routers import catalogo, ejemplo_uso, inventario, inventario_publico, usuarios

app = FastAPI(title="C&R Soluciones Tecnológicas API")

app.include_router(usuarios.router)
app.include_router(ejemplo_uso.router)
# El router público va primero: /inventario/publico/{id} no debe caer en /inventario/{equipo_id}
app.include_router(inventario_publico.router)
app.include_router(inventario.router)
app.include_router(catalogo.router)

preparar_directorios()
app.mount(RUTA_MEDIA, StaticFiles(directory=DIRECTORIO_MEDIA), name="media")


@app.get("/")
def raiz():
    return {"mensaje": "API de C&R Soluciones funcionando"}

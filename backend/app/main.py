from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware


from app.core.almacenamiento import DIRECTORIO_MEDIA, RUTA_MEDIA, preparar_directorios
from app.routers import (
    catalogo,
    cotizaciones,
    ejemplo_uso,
    finanzas,
    inventario,
    inventario_publico,
    notificaciones,
    tickets,
    usuarios,
)

app = FastAPI(title="C&R Soluciones Tecnológicas API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios.router)
app.include_router(ejemplo_uso.router)
# El router público va primero: /inventario/publico/{id} no debe caer en /inventario/{equipo_id}
app.include_router(inventario_publico.router)
app.include_router(inventario.router)
app.include_router(catalogo.router)
app.include_router(cotizaciones.router)
app.include_router(tickets.router)
app.include_router(finanzas.router)
app.include_router(notificaciones.router)

preparar_directorios()
app.mount(RUTA_MEDIA, StaticFiles(directory=DIRECTORIO_MEDIA), name="media")


@app.get("/")
def raiz():
    return {"mensaje": "API de C&R Soluciones funcionando"}

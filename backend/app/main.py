from fastapi import FastAPI
from app.routers import usuarios
from app.routers import ejemplo_uso

app = FastAPI(title="C&R Soluciones Tecnológicas API")

app.include_router(usuarios.router)
app.include_router(ejemplo_uso.router)


@app.get("/")
def raiz():
    return {"mensaje": "API de C&R Soluciones funcionando"}
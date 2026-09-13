from app.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        resultado = conn.execute(text("SELECT DATABASE();"))
        print("✅ Conectado correctamente a:", resultado.scalar())
except Exception as e:
    print("❌ Error de conexión:", e)
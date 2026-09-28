from app.database import SessionLocal
from app.models.roles import Rol
from app.models.usuarios import Usuario

db = SessionLocal()

try:
    roles = db.query(Rol).all()
    print(f"✅ Roles encontrados: {len(roles)}")
    for r in roles:
        print(f"   - {r.id}: {r.nombre}")

    usuarios = db.query(Usuario).all()
    print(f"✅ Usuarios encontrados: {len(usuarios)}")
    for u in usuarios:
        print(f"   - {u.id}: {u.nombre_completo} ({u.email}) - Rol: {u.rol.nombre}")

except Exception as e:
    print("❌ Error:", e)
finally:
    db.close()
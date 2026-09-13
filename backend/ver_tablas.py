from app.database import engine
from sqlalchemy import inspect

inspector = inspect(engine)
tablas = inspector.get_table_names()

print(f"✅ Total de tablas encontradas: {len(tablas)}")
print()
for t in sorted(tablas):
    print(f"   - {t}")
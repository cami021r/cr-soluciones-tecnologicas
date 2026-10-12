from app.database import engine
from sqlalchemy import text, inspect

insp = inspect(engine)
cols_tickets = [c['name'] for c in insp.get_columns('tickets')]
cols_equipos = [c['name'] for c in insp.get_columns('equipos')]

print("Current tickets columns:", cols_tickets)
print("Current equipos columns:", cols_equipos)

with engine.connect() as conn:
    if 'categoria' not in cols_tickets:
        conn.execute(text("ALTER TABLE tickets ADD COLUMN categoria VARCHAR(50) DEFAULT 'red'"))
        print("Added categoria to tickets")
    if 'modalidad' not in cols_tickets:
        conn.execute(text("ALTER TABLE tickets ADD COLUMN modalidad VARCHAR(50) DEFAULT 'remota'"))
        print("Added modalidad to tickets")
    if 'fecha_visita' not in cols_tickets:
        conn.execute(text("ALTER TABLE tickets ADD COLUMN fecha_visita DATETIME NULL"))
        print("Added fecha_visita to tickets")

    if 'cliente_id' not in cols_equipos:
        conn.execute(text("ALTER TABLE equipos ADD COLUMN cliente_id INT NULL"))
        print("Added cliente_id to equipos")
    if 'tipo_relacion' not in cols_equipos:
        conn.execute(text("ALTER TABLE equipos ADD COLUMN tipo_relacion VARCHAR(50) DEFAULT 'empresa'"))
        print("Added tipo_relacion to equipos")
    conn.commit()

print("MIGRATION COMPLETED SUCCESSFULLY!")

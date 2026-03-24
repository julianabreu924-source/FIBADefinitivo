import sqlite3
import os

db_path = '/home/julian/Documentos/FIBA/fiba-stats-system/backend/fiba_stats.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE partidos ADD COLUMN tiempo_restante INTEGER DEFAULT 600")
        print("Column tiempo_restante added.")
    except Exception as e:
        print(f"Skipping tiempo_restante: {e}")
        
    try:
        cursor.execute("ALTER TABLE partidos ADD COLUMN reloj_activo BOOLEAN DEFAULT 0")
        print("Column reloj_activo added.")
    except Exception as e:
        print(f"Skipping reloj_activo: {e}")
        
    conn.commit()
    conn.close()
else:
    print("DB file not found, will be created on start.")

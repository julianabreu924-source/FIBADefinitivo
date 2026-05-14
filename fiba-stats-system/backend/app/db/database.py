from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Render provides 'postgres://', but SQLAlchemy requires 'postgresql://'
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# SQLite uses 'check_same_thread: False', but it triggers errors in Postgres
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_size=20,           # Aumentamos el pool de conexiones
    max_overflow=10,        # Permitimos más desbordamiento
    pool_timeout=30,        # Tiempo de espera para obtener una conexión
    pool_recycle=1800,      # Reciclar conexiones cada 30 min para evitar desconexiones de Render/Postgres
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    from app.models import equipo, jugador, partido, stats_jugador, evento, parcial, user
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.routes import equipos, jugadores, partidos, stats, eventos, parciales
from app.websockets.manager import router as ws_router
from app.db.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the database
    init_db()
    yield
    # Shutdown: Add cleanup logic if needed

app = FastAPI(
    title="FIBA Stats API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(equipos.router,   prefix="/api/equipos",   tags=["Equipos"])
app.include_router(jugadores.router, prefix="/api/jugadores", tags=["Jugadores"])
app.include_router(partidos.router,  prefix="/api/partidos",  tags=["Partidos"])
app.include_router(stats.router,     prefix="/api/stats",     tags=["Stats"])
app.include_router(eventos.router,   prefix="/api/eventos",   tags=["Eventos"])
app.include_router(parciales.router, prefix="/api/parciales", tags=["Parciales"])
app.include_router(ws_router)

@app.get("/")
def root():
    return {"status": "ok", "app": "FIBA Stats System v1.0"}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.stats_jugador import StatsJugador
from app.schemas.stats import StatsJugadorRead

router = APIRouter()

@router.get("/partido/{partido_id}", response_model=List[StatsJugadorRead])
def stats_partido(partido_id: int, db: Session = Depends(get_db)):
    return db.query(StatsJugador).filter(
        StatsJugador.partido_id == partido_id
    ).all()

@router.get("/jugador/{jugador_id}", response_model=List[StatsJugadorRead])
def stats_jugador(jugador_id: int, db: Session = Depends(get_db)):
    return db.query(StatsJugador).filter(
        StatsJugador.jugador_id == jugador_id
    ).all()

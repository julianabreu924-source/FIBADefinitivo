from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.jugador import Jugador
from app.schemas.jugador import JugadorCreate, JugadorRead

router = APIRouter()

def get_jugador_or_404(db: Session, jugador_id: int) -> Jugador:
    jugador = db.query(Jugador).filter(Jugador.id == jugador_id).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    return jugador

@router.get("/equipo/{equipo_id}", response_model=List[JugadorRead])
def jugadores_por_equipo(equipo_id: int, db: Session = Depends(get_db)):
    return db.query(Jugador).filter(Jugador.equipo_id == equipo_id).all()

@router.post("", response_model=JugadorRead)
def crear_jugador(data: JugadorCreate, db: Session = Depends(get_db)):
    jugador = Jugador(**data.model_dump())
    db.add(jugador)
    db.commit()
    db.refresh(jugador)
    return jugador

@router.put("/{jugador_id}", response_model=JugadorRead)
def actualizar_jugador(jugador_id: int, data: JugadorCreate, db: Session = Depends(get_db)):
    jugador = get_jugador_or_404(db, jugador_id)
    for campo, valor in data.model_dump().items():
        setattr(jugador, campo, valor)
    db.commit()
    db.refresh(jugador)
    return jugador

@router.delete("/{jugador_id}")
def eliminar_jugador(jugador_id: int, db: Session = Depends(get_db)):
    jugador = get_jugador_or_404(db, jugador_id)
    db.delete(jugador)
    db.commit()
    return {"ok": True}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.parcial import Parcial
from app.schemas.parcial import ParcialUpdate, ParcialRead

router = APIRouter()

@router.get("/{partido_id}", response_model=List[ParcialRead])
def get_parciales(partido_id: int, db: Session = Depends(get_db)):
    return db.query(Parcial).filter(
        Parcial.partido_id == partido_id
    ).order_by(Parcial.cuarto, Parcial.intervalo).all()

@router.post("/{partido_id}", response_model=ParcialRead)
def guardar_parcial(partido_id: int, data: ParcialUpdate, db: Session = Depends(get_db)):
    parcial = db.query(Parcial).filter_by(
        partido_id=partido_id, cuarto=data.cuarto, intervalo=data.intervalo
    ).first()
    if not parcial:
        parcial = Parcial(partido_id=partido_id, cuarto=data.cuarto, intervalo=data.intervalo)
        db.add(parcial)
    parcial.pts_local = data.pts_local
    parcial.pts_visitante = data.pts_visitante
    db.commit()
    db.refresh(parcial)
    return parcial

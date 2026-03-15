from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.equipo import Equipo
from app.schemas.equipo import EquipoCreate, EquipoRead

router = APIRouter()

def get_equipo_or_404(db: Session, equipo_id: int) -> Equipo:
    equipo = db.query(Equipo).filter(Equipo.id == equipo_id).first()
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return equipo

@router.get("", response_model=List[EquipoRead])
def listar_equipos(db: Session = Depends(get_db)):
    return db.query(Equipo).all()

@router.post("", response_model=EquipoRead)
def crear_equipo(data: EquipoCreate, db: Session = Depends(get_db)):
    equipo = Equipo(**data.model_dump())
    db.add(equipo)
    db.commit()
    db.refresh(equipo)
    return equipo

@router.get("/{equipo_id}", response_model=EquipoRead)
def obtener_equipo(equipo_id: int, db: Session = Depends(get_db)):
    return get_equipo_or_404(db, equipo_id)

@router.put("/{equipo_id}", response_model=EquipoRead)
def actualizar_equipo(equipo_id: int, data: EquipoCreate, db: Session = Depends(get_db)):
    equipo = get_equipo_or_404(db, equipo_id)
    for campo, valor in data.model_dump().items():
        setattr(equipo, campo, valor)
    db.commit()
    db.refresh(equipo)
    return equipo

@router.delete("/{equipo_id}")
def eliminar_equipo(equipo_id: int, db: Session = Depends(get_db)):
    equipo = get_equipo_or_404(db, equipo_id)
    db.delete(equipo)
    db.commit()
    return {"ok": True}

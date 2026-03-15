from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.partido import Partido, EstadoPartido
from app.schemas.partido import PartidoCreate, PartidoRead
from app.services import partido_service

router = APIRouter()

@router.get("", response_model=List[PartidoRead])
def listar_partidos(db: Session = Depends(get_db)):
    return db.query(Partido).all()

@router.post("", response_model=PartidoRead)
def crear_partido(data: PartidoCreate, db: Session = Depends(get_db)):
    partido = Partido(**data.model_dump())
    db.add(partido)
    db.commit()
    db.refresh(partido)
    return partido

@router.get("/{partido_id}", response_model=PartidoRead)
def obtener_partido(partido_id: int, db: Session = Depends(get_db)):
    return partido_service.obtener_partido_por_id(db, partido_id)

@router.put("/{partido_id}/estado", response_model=PartidoRead)
def cambiar_estado(partido_id: int, estado: EstadoPartido, db: Session = Depends(get_db)):
    partido = partido_service.obtener_partido_por_id(db, partido_id)
    partido.estado = estado
    db.commit()
    db.refresh(partido)
    return partido

@router.put("/{partido_id}/cuarto", response_model=PartidoRead)
def avanzar_cuarto(partido_id: int, db: Session = Depends(get_db)):
    partido = partido_service.obtener_partido_por_id(db, partido_id)
    partido.cuarto_actual += 1
    db.commit()
    db.refresh(partido)
    return partido

@router.delete("/{partido_id}")
def eliminar_partido(partido_id: int, db: Session = Depends(get_db)):
    from app.models.stats_jugador import StatsJugador
    from app.models.evento import Evento
    from app.models.parcial import Parcial

    db.query(StatsJugador).filter_by(partido_id=partido_id).delete()
    db.query(Evento).filter_by(partido_id=partido_id).delete()
    db.query(Parcial).filter_by(partido_id=partido_id).delete()

    partido = partido_service.obtener_partido_por_id(db, partido_id)
    db.delete(partido)
    db.commit()
    return {"ok": True}

@router.put("/{partido_id}/finalizar", response_model=PartidoRead)
def finalizar_partido(partido_id: int, db: Session = Depends(get_db)):
    partido = partido_service.obtener_partido_por_id(db, partido_id)
    partido.estado = EstadoPartido.FINALIZADO
    db.commit()
    db.refresh(partido)
    return partido

@router.put("/{partido_id}/iniciar", response_model=PartidoRead)
def iniciar_partido(partido_id: int, db: Session = Depends(get_db)):
    partido = partido_service.obtener_partido_por_id(db, partido_id)
    partido.estado = EstadoPartido.EN_JUEGO
    db.commit()
    db.refresh(partido)
    return partido

@router.get("/{partido_id}/resumen")
def resumen_partido(partido_id: int, db: Session = Depends(get_db)):
    return partido_service.obtener_resumen_partido(db, partido_id)

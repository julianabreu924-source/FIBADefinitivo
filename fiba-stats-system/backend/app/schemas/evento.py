from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EventoBase(BaseModel):
    partido_id: int
    jugador_id: Optional[int] = None
    equipo_id: Optional[int] = None
    tipo: str
    cuarto: int
    tiempo: str

class EventoCreate(EventoBase):
    pass

class EventoRead(EventoBase):
    id: int
    timestamp: datetime
    deshecho: bool

    class Config:
        from_attributes = True

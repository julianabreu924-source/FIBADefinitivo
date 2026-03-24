from pydantic import BaseModel
from typing import Optional

class JugadorBase(BaseModel):
    equipo_id: int
    numero: int
    nombre: str
    posicion: Optional[str] = None
    es_titular: bool = False

class JugadorCreate(JugadorBase):
    pass

class JugadorRead(JugadorBase):
    id: int

    class Config:
        from_attributes = True

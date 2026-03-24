from pydantic import BaseModel
from typing import Optional

class EquipoBase(BaseModel):
    nombre: str
    ciudad: Optional[str] = None
    abrev: Optional[str] = None
    color_principal: Optional[str] = "#1A56A0"
    color_secundario: Optional[str] = "#FFFFFF"
    entrenador: Optional[str] = None
    asistente1: Optional[str] = None
    asistente2: Optional[str] = None

class EquipoCreate(EquipoBase):
    pass

class EquipoRead(EquipoBase):
    id: int

    class Config:
        from_attributes = True

from pydantic import BaseModel

class ParcialBase(BaseModel):
    cuarto: int
    intervalo: int = 1
    pts_local: int
    pts_visitante: int

class ParcialCreate(ParcialBase):
    pass

class ParcialUpdate(ParcialBase):
    pass

class ParcialRead(ParcialBase):
    id: int
    partido_id: int

    class Config:
        from_attributes = True

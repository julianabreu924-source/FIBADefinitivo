from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Jugador(Base):
    __tablename__ = "jugadores"

    id         = Column(Integer, primary_key=True, index=True)
    equipo_id  = Column(Integer, ForeignKey("equipos.id"))
    numero     = Column(Integer, nullable=False)
    nombre     = Column(String, nullable=False)
    posicion   = Column(String(5))
    activo     = Column(Boolean, default=True)
    es_titular = Column(Boolean, default=False)

    equipo = relationship("Equipo", back_populates="jugadores")

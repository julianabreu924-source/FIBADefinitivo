from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.database import Base

class Equipo(Base):
    __tablename__ = "equipos"

    id               = Column(Integer, primary_key=True, index=True)
    nombre           = Column(String, nullable=False)
    ciudad           = Column(String)
    abrev            = Column(String(5))
    color_principal  = Column(String(7), default="#1A56A0")
    color_secundario = Column(String(7), default="#FFFFFF")
    logo_path        = Column(String)
    entrenador       = Column(String)
    asistente1       = Column(String)
    asistente2       = Column(String)

    jugadores = relationship("Jugador", back_populates="equipo")

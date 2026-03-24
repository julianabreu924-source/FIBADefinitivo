from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.db.database import Base
from datetime import datetime

class Evento(Base):
    __tablename__ = "eventos"

    id         = Column(Integer, primary_key=True, index=True)
    partido_id = Column(Integer, ForeignKey("partidos.id"))
    jugador_id = Column(Integer, ForeignKey("jugadores.id"), nullable=True)
    equipo_id  = Column(Integer, nullable=True)
    tipo       = Column(String, nullable=False)
    cuarto     = Column(Integer)
    tiempo     = Column(String)
    timestamp  = Column(DateTime, default=datetime.utcnow)
    deshecho   = Column(Integer, default=0)

from sqlalchemy import Column, Integer, Float, ForeignKey
from app.db.database import Base

class StatsJugador(Base):
    __tablename__ = "stats_jugador"

    id          = Column(Integer, primary_key=True, index=True)
    partido_id  = Column(Integer, ForeignKey("partidos.id"))
    jugador_id  = Column(Integer, ForeignKey("jugadores.id"))
    minutos     = Column(Integer, default=0)
    nj          = Column(Integer, default=0)

    tc_intentados  = Column(Integer, default=0)
    tc_convertidos = Column(Integer, default=0)
    t2_intentados  = Column(Integer, default=0)
    t2_convertidos = Column(Integer, default=0)
    t3_intentados  = Column(Integer, default=0)
    t3_convertidos = Column(Integer, default=0)
    tl_intentados  = Column(Integer, default=0)
    tl_convertidos = Column(Integer, default=0)

    rebotes_ofensivos  = Column(Integer, default=0)
    rebotes_defensivos = Column(Integer, default=0)
    rebotes_totales    = Column(Integer, default=0)

    asistencias = Column(Integer, default=0)
    perdidas    = Column(Integer, default=0)
    recuperos   = Column(Integer, default=0)
    bloqueos    = Column(Integer, default=0)
    faltas             = Column(Integer, default=0)
    faltas_recibidas   = Column(Integer, default=0)
    mas_menos          = Column(Integer, default=0)
    puntos             = Column(Integer, default=0)
    eficiencia         = Column(Float,   default=0.0)
    bloqueos_recibidos = Column(Integer, default=0)

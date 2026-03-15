from sqlalchemy import Column, Integer, ForeignKey
from app.db.database import Base

class Parcial(Base):
    __tablename__ = "parciales"

    id            = Column(Integer, primary_key=True, index=True)
    partido_id    = Column(Integer, ForeignKey("partidos.id"))
    cuarto        = Column(Integer, nullable=False)
    intervalo     = Column(Integer, default=1)  # 1 = primer 5min, 2 = final del cuarto
    pts_local     = Column(Integer, default=0)
    pts_visitante = Column(Integer, default=0)

from pydantic import BaseModel
from typing import Optional, List

class GlobalStatsRead(BaseModel):
    total_matches: int
    total_punto_avg: float
    total_puntos: int
    total_asistencias: int
    total_rebotes: int
    total_tapones: int
    total_eficiencia_avg: float
    pnt_pintura: int
    pnt_triples: int
    pnt_libres: int
    tendencia_puntos: List[float]

    class Config:
        from_attributes = True

class StatsJugadorRead(BaseModel):
    id: int
    partido_id: int
    jugador_id: int
    minutos: int
    nj: int
    tc_intentados: int
    tc_convertidos: int
    t2_intentados: int
    t2_convertidos: int
    t3_intentados: int
    t3_convertidos: int
    tl_intentados: int
    tl_convertidos: int
    rebotes_ofensivos: int
    rebotes_defensivos: int
    rebotes_totales: int
    asistencias: int
    perdidas: int
    recuperos: int
    bloqueos: int
    faltas: int
    faltas_recibidas: int
    mas_menos: int
    puntos: int
    eficiencia: float
    bloqueos_recibidos: int

    class Config:
        from_attributes = True

from sqlalchemy.orm import Session
from app.models.evento import Evento
from app.models.stats_jugador import StatsJugador
from app.models.partido import Partido, EstadoPartido
from app.models.jugador import Jugador
from app.services.stats_service import recalcular_stats
from fastapi import HTTPException
from typing import Dict, Any

INCREMENTOS = {
    "T2_CONV":    {"t2_convertidos": 1, "t2_intentados": 1},
    "T2_FALL":    {"t2_intentados": 1},
    "T3_CONV":    {"t3_convertidos": 1, "t3_intentados": 1},
    "T3_FALL":    {"t3_intentados": 1},
    "TL_CONV":    {"tl_convertidos": 1, "tl_intentados": 1},
    "TL_FALL":    {"tl_intentados": 1},
    "REB_OF":     {"rebotes_ofensivos": 1},
    "REB_DEF":    {"rebotes_defensivos": 1},
    "ASISTENCIA": {"asistencias": 1},
    "PERDIDA":    {"perdidas": 1},
    "RECUPERO":   {"recuperos": 1},
    "BLOQUEO":    {"bloqueos": 1},
    "FALTA":      {"faltas": 1},
    "FALTA_REC":  {"faltas_recibidas": 1},
    "BLOQUEO_REC":{"bloqueos_recibidos": 1},
    "NO_JUGO":    {"nj": 1},
}

PUNTOS_EVENTO = {
    "T2_CONV": 2,
    "T3_CONV": 3,
    "TL_CONV": 1,
}

def registrar_evento(db: Session, partido_id: int, jugador_id: int,
                     equipo_id: int, tipo: str, cuarto: int, tiempo: str):
    evento = Evento(
        partido_id=partido_id, jugador_id=jugador_id,
        equipo_id=equipo_id, tipo=tipo,
        cuarto=cuarto, tiempo=tiempo
    )
    db.add(evento)

    # Actualizar stats del jugador
    if tipo in INCREMENTOS and jugador_id:
        stats = db.query(StatsJugador).filter_by(
            partido_id=partido_id, jugador_id=jugador_id
        ).first()

        if not stats:
            stats = StatsJugador(partido_id=partido_id, jugador_id=jugador_id)
            db.add(stats)
            db.flush()

        for campo, valor in INCREMENTOS[tipo].items():
            setattr(stats, campo, getattr(stats, campo) + valor)

        s = {c.name: getattr(stats, c.name) for c in stats.__table__.columns}
        s = recalcular_stats(s)
        for campo, valor in s.items():
            setattr(stats, campo, valor)

    # Actualizar marcador del partido
    if tipo in PUNTOS_EVENTO:
        partido = db.query(Partido).filter(Partido.id == partido_id).first()
        if partido and equipo_id:
            puntos = PUNTOS_EVENTO[tipo]
            if equipo_id == partido.local_id:
                partido.pts_local += puntos
            elif equipo_id == partido.visitante_id:
                partido.pts_visitante += puntos

    db.commit()
    return evento

def deshacer_ultimo_evento(db: Session, partido_id: int):
    ultimo = db.query(Evento).filter_by(
        partido_id=partido_id, deshecho=0
    ).order_by(Evento.timestamp.desc()).first()

    if not ultimo:
        return None

    # Revertir stats del jugador
    if ultimo.tipo in INCREMENTOS and ultimo.jugador_id:
        stats = db.query(StatsJugador).filter_by(
            partido_id=partido_id, jugador_id=ultimo.jugador_id
        ).first()
        if stats:
            for campo, valor in INCREMENTOS[ultimo.tipo].items():
                setattr(stats, campo, max(0, getattr(stats, campo) - valor))
            s = {c.name: getattr(stats, c.name) for c in stats.__table__.columns}
            s = recalcular_stats(s)
            for campo, valor in s.items():
                setattr(stats, campo, valor)

    # Revertir marcador
    if ultimo.tipo in PUNTOS_EVENTO:
        partido = db.query(Partido).filter(Partido.id == partido_id).first()
        if partido and ultimo.equipo_id:
            puntos = PUNTOS_EVENTO[ultimo.tipo]
            if ultimo.equipo_id == partido.local_id:
                partido.pts_local = max(0, partido.pts_local - puntos)
            elif ultimo.equipo_id == partido.visitante_id:
                partido.pts_visitante = max(0, partido.pts_visitante - puntos)

    ultimo.deshecho = 1
    db.commit()
    return ultimo

def rehacer_ultimo_evento(db: Session, partido_id: int):
    # Buscamos el último evento marcado como deshecho
    ultimo_deshecho = db.query(Evento).filter_by(
        partido_id=partido_id, deshecho=1
    ).order_by(Evento.timestamp.desc()).first()

    if not ultimo_deshecho:
        return None

    # Aplicar nuevamente los incrementos de stats
    if ultimo_deshecho.tipo in INCREMENTOS and ultimo_deshecho.jugador_id:
        stats = db.query(StatsJugador).filter_by(
            partido_id=partido_id, jugador_id=ultimo_deshecho.jugador_id
        ).first()
        if not stats:
            stats = StatsJugador(partido_id=partido_id, jugador_id=ultimo_deshecho.jugador_id)
            db.add(stats)
            db.flush()
        
        for campo, valor in INCREMENTOS[ultimo_deshecho.tipo].items():
            setattr(stats, campo, getattr(stats, campo) + valor)
        
        s = {c.name: getattr(stats, c.name) for c in stats.__table__.columns}
        s = recalcular_stats(s)
        for campo, valor in s.items():
            setattr(stats, campo, valor)

    # Re-aplicar marcador
    if ultimo_deshecho.tipo in PUNTOS_EVENTO:
        partido = db.query(Partido).filter(Partido.id == partido_id).first()
        if partido and ultimo_deshecho.equipo_id:
            puntos = PUNTOS_EVENTO[ultimo_deshecho.tipo]
            if ultimo_deshecho.equipo_id == partido.local_id:
                partido.pts_local += puntos
            elif ultimo_deshecho.equipo_id == partido.visitante_id:
                partido.pts_visitante += puntos

    ultimo_deshecho.deshecho = 0
    db.commit()
    return ultimo_deshecho

def obtener_partido_por_id(db: Session, partido_id: int) -> Partido:
    partido = db.query(Partido).filter(Partido.id == partido_id).first()
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    return partido

def obtener_resumen_partido(db: Session, partido_id: int) -> Dict[str, Any]:
    partido = obtener_partido_por_id(db, partido_id)

    eventos = db.query(Evento).filter_by(
        partido_id=partido_id, deshecho=0
    ).order_by(Evento.timestamp).all()

    jugadores_local     = db.query(Jugador).filter_by(equipo_id=partido.local_id).all()
    jugadores_visitante = db.query(Jugador).filter_by(equipo_id=partido.visitante_id).all()
    ids_local           = {j.id for j in jugadores_local}
    ids_visitante       = {j.id for j in jugadores_visitante}
    titulares_local     = {j.id for j in jugadores_local     if j.es_titular}
    titulares_visitante = {j.id for j in jugadores_visitante if j.es_titular}

    PUNTOS = {"T2_CONV": 2, "T3_CONV": 3, "TL_CONV": 1}

    # Reconstruir historial de marcador y estadísticas avanzadas
    pts_l = 0
    pts_v = 0
    max_ventaja_l = 0
    max_ventaja_v = 0
    empates = 0
    cambios_liderazgo = 0
    lider_actual = None
    
    tiempo_liderando_l = 0
    tiempo_liderando_v = 0
    last_ts = None

    pts_perdidas_l = 0
    pts_perdidas_v = 0
    ultima_perdida_eq = None

    pts_fastbreak_l = 0
    pts_fastbreak_v = 0
    ultimo_recupero_eq = None

    # Racahas
    racha_l = 0
    racha_v = 0
    max_racha_l = 0
    max_racha_v = 0

    # Puntos especiales
    puntos_banca_l = 0
    puntos_banca_v = 0
    pts_segunda_opp_l = 0
    pts_segunda_opp_v = 0
    ultimo_reb_of_equipo = None

    for ev in eventos:
        es_local = ev.equipo_id == partido.local_id
        es_visit = ev.equipo_id == partido.visitante_id
        
        # Tiempo liderando
        if last_ts:
            delta = (ev.timestamp - last_ts).total_seconds()
            if pts_l > pts_v: tiempo_liderando_l += delta
            elif pts_v > pts_l: tiempo_liderando_v += delta
        last_ts = ev.timestamp

        # Puntos de banca
        if ev.tipo in PUNTOS and ev.jugador_id:
            pts = PUNTOS[ev.tipo]
            if es_local and ev.jugador_id not in titulares_local:
                puntos_banca_l += pts
            if es_visit and ev.jugador_id not in titulares_visitante:
                puntos_banca_v += pts

        # Segunda oportunidad
        if ev.tipo == "REB_OF":
            ultimo_reb_of_equipo = ev.equipo_id
        elif ev.tipo in PUNTOS and ultimo_reb_of_equipo == ev.equipo_id:
            if es_local: pts_segunda_opp_l += PUNTOS[ev.tipo]
            else: pts_segunda_opp_v += PUNTOS[ev.tipo]
            ultimo_reb_of_equipo = None
        elif ev.tipo not in ["T2_FALL", "T3_FALL", "TL_FALL"]: # Si no es un tiro fallado, reseteamos
            ultimo_reb_of_equipo = None

        # Puntos tras pérdidas
        if ev.tipo == "PERDIDA":
            ultima_perdida_eq = ev.equipo_id
        elif ev.tipo in PUNTOS and ultima_perdida_eq and ultima_perdida_eq != ev.equipo_id:
            if es_local: pts_perdidas_l += PUNTOS[ev.tipo]
            else: pts_perdidas_v += PUNTOS[ev.tipo]
            ultima_perdida_eq = None
        elif ev.tipo not in ["T2_FALL", "T3_FALL", "TL_FALL"]: # Si no es un tiro fallado, reseteamos
            ultima_perdida_eq = None

        # Contraataque
        if ev.tipo == "RECUPERO":
            ultimo_recupero_eq = ev.equipo_id
        elif ev.tipo in PUNTOS and ultimo_recupero_eq == ev.equipo_id:
            if es_local: pts_fastbreak_l += PUNTOS[ev.tipo]
            else: pts_fastbreak_v += PUNTOS[ev.tipo]
            ultimo_recupero_eq = None
        elif ev.tipo not in ["T2_FALL", "T3_FALL", "TL_FALL"]:
            ultimo_recupero_eq = None

        # Actualizar marcador
        if ev.tipo in PUNTOS:
            pts = PUNTOS[ev.tipo]
            if es_local:
                pts_l += pts
                racha_l += pts
                racha_v = 0
                max_racha_l = max(max_racha_l, racha_l)
            elif es_visit:
                pts_v += pts
                racha_v += pts
                racha_l = 0
                max_racha_v = max(max_racha_v, racha_v)

            # Ventaja y cambios de lider
            diff = pts_l - pts_v
            if diff > 0:
                max_ventaja_l = max(max_ventaja_l, diff)
                if lider_actual == 'visitante': cambios_liderazgo += 1
                lider_actual = 'local'
            elif diff < 0:
                max_ventaja_v = max(max_ventaja_v, abs(diff))
                if lider_actual == 'local': cambios_liderazgo += 1
                lider_actual = 'visitante'
            else:
                empates += 1
                lider_actual = 'empate'

    # Stats detalladas de pintura
    stats_l = db.query(StatsJugador).filter_by(partido_id=partido_id).filter(StatsJugador.jugador_id.in_(ids_local)).all()
    stats_v = db.query(StatsJugador).filter_by(partido_id=partido_id).filter(StatsJugador.jugador_id.in_(ids_visitante)).all()

    pintura_conv_l = sum(s.t2_convertidos for s in stats_l)
    pintura_int_l  = sum(s.t2_intentados for s in stats_l)
    pintura_pct_l  = (pintura_conv_l / pintura_int_l * 100) if pintura_int_l > 0 else 0

    pintura_conv_v = sum(s.t2_convertidos for s in stats_v)
    pintura_int_v  = sum(s.t2_intentados for s in stats_v)
    pintura_pct_v  = (pintura_conv_v / pintura_int_v * 100) if pintura_int_v > 0 else 0

    def format_time(seconds):
        m = int(seconds // 60)
        s = int(seconds % 60)
        return f"{m:02d}:{s:02d}"

    # Preparar estadisticas detalladas para ambos equipos
    def map_stats_player(jugador, stats_obj):
        # Mapeamos los campos a lo que espera el frontend (PrintableReport.jsx)
        return {
            "id": jugador.id,
            "nombre": jugador.nombre,
            "numero": jugador.numero,
            "es_titular": jugador.es_titular,
            "minutos": stats_obj.minutos if stats_obj else 0,
            "t2_conv": stats_obj.t2_convertidos if stats_obj else 0,
            "t2_total": stats_obj.t2_intentados if stats_obj else 0,
            "t3_conv": stats_obj.t3_convertidos if stats_obj else 0,
            "t3_total": stats_obj.t3_intentados if stats_obj else 0,
            "tl_conv": stats_obj.tl_convertidos if stats_obj else 0,
            "tl_total": stats_obj.tl_intentados if stats_obj else 0,
            "rebotes_ofensivos": stats_obj.rebotes_ofensivos if stats_obj else 0,
            "rebotes_defensivos": stats_obj.rebotes_defensivos if stats_obj else 0,
            "rebotes_totales": stats_obj.rebotes_totales if stats_obj else 0,
            "asistencias": stats_obj.asistencias if stats_obj else 0,
            "perdidas": stats_obj.perdidas if stats_obj else 0,
            "recuperos": stats_obj.recuperos if stats_obj else 0,
            "bloqueos": stats_obj.bloqueos if stats_obj else 0,
            "bloqueos_recibidos": stats_obj.bloqueos_recibidos if stats_obj else 0,
            "faltas": stats_obj.faltas if stats_obj else 0,
            "faltas_recibidas": stats_obj.faltas_recibidas if stats_obj else 0,
            "mas_menos": stats_obj.mas_menos if stats_obj else 0,
            "puntos": stats_obj.puntos if stats_obj else 0,
            "eficiencia": stats_obj.eficiencia if stats_obj else 0,
            "nj": stats_obj.nj if stats_obj else 0
        }

    stats_dict = {s.jugador_id: s for s in db.query(StatsJugador).filter_by(partido_id=partido_id).all()}
    
    list_stats_local = [map_stats_player(j, stats_dict.get(j.id)) for j in jugadores_local]
    list_stats_visitante = [map_stats_player(j, stats_dict.get(j.id)) for j in jugadores_visitante]

    return {
        "partido_id": partido_id,
        "pts_local": partido.pts_local,
        "pts_visitante": partido.pts_visitante,
        "ganador": "local" if partido.pts_local > partido.pts_visitante else "visitante" if partido.pts_visitante > partido.pts_local else "empate",
        "cuadro_izquierdo": {
            "Puntos tras pérdidas":          [pts_perdidas_l,   pts_perdidas_v],
            "Puntos en la pintura":          [pintura_conv_l * 2, pintura_conv_v * 2],
            "Puntos de 2da oportunidad":     [pts_segunda_opp_l, pts_segunda_opp_v],
            "Puntos de contra-ataque":       [pts_fastbreak_l,   pts_fastbreak_v],
            "Puntos de la banca":            [puntos_banca_l,     puntos_banca_v],
        },
        "cuadro_derecho": {
            "Mayor ventaja":                 [max_ventaja_l,  max_ventaja_v],
            "Mayor racha consecutiva":       [max_racha_l,    max_racha_v],
            "Cambios de liderazgo":         [cambios_liderazgo, cambios_liderazgo], # Mostramos lo mismo en ambos si es total
            "Empates":                      [empates, empates],
            "Tiempo liderando":              [format_time(tiempo_liderando_l), format_time(tiempo_liderando_v)]
        },
        "estadisticas": {
            "local": list_stats_local,
            "visitante": list_stats_visitante
        }
    }

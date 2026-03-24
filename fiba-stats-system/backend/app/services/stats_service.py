def calcular_porcentaje(convertidos: int, intentados: int) -> float:
    if intentados == 0:
        return 0.0
    return round((convertidos / intentados) * 100, 1)

def calcular_puntos(t2_conv: int, t3_conv: int, tl_conv: int) -> int:
    return (t2_conv * 2) + (t3_conv * 3) + tl_conv

def calcular_eficiencia(s: dict) -> float:
    positivos = (
        s["puntos"] +
        s["rebotes_totales"] +
        s["asistencias"] +
        s["recuperos"] +
        s["bloqueos"]
    )
    negativos = (
        s["faltas"] +
        s["perdidas"] +
        (s["tc_intentados"] - s["tc_convertidos"]) +
        (s["tl_intentados"] - s["tl_convertidos"])
    )
    return float(positivos - negativos)

def recalcular_stats(s: dict) -> dict:
    s["tc_intentados"]  = s["t2_intentados"]  + s["t3_intentados"]
    s["tc_convertidos"] = s["t2_convertidos"] + s["t3_convertidos"]
    s["rebotes_totales"] = s["rebotes_ofensivos"] + s["rebotes_defensivos"]
    s["puntos"] = calcular_puntos(s["t2_convertidos"], s["t3_convertidos"], s["tl_convertidos"])
    s["eficiencia"] = calcular_eficiencia(s)
    return s

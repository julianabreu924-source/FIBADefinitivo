/**
 * Shared utility functions for FIBA statistics
 */

export const pct = (c, i) => (i > 0 ? ((c / i) * 100).toFixed(1) : '0.0')

export const formatMinutos = (val) => {
    if (!val || val === 0) return '0:00'
    if (typeof val === 'string' && val.includes(':')) return val
    const totalSec = typeof val === 'number' ? val : parseInt(val) || 0
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
}

export const getScoreToInterval = (partido, parciales, equipoId, q, i) => {
    let total = 0
    let hasData = false
    if (!parciales || !parciales.length) return ''
    parciales.forEach(p => {
        if (p.cuarto < q || (p.cuarto === q && p.intervalo <= i)) {
            total += (equipoId === (partido.local_id || partido.id_local) ? p.pts_local : p.pts_visitante)
            if (p.pts_local > 0 || p.pts_visitante > 0 || (p.cuarto === q && p.intervalo === i)) hasData = true
        }
    })
    return hasData ? total : ''
}

export const calculateTeamTotals = (jugadores, getStats) => {
    return jugadores.reduce((acc, j) => {
        const s = typeof getStats === 'function' ? getStats(j.id) : j
        if (s.nj === 1) return acc

        // Handle both full names and abbreviated names for stats
        const t2c = s.t2_convertidos ?? s.t2_conv ?? 0
        const t2i = s.t2_intentados ?? s.t2_total ?? 0
        const t3c = s.t3_convertidos ?? s.t3_conv ?? 0
        const t3i = s.t3_intentados ?? s.t3_total ?? 0
        const tlc = s.tl_convertidos ?? s.tl_conv ?? 0
        const tli = s.tl_intentados ?? s.tl_total ?? 0

        // Parse minutes
        let minsAsSec = 0
        if (typeof s.minutos === 'string' && s.minutos.includes(':')) {
            const [m, sec] = s.minutos.split(':').map(Number)
            minsAsSec = (m * 60) + (sec || 0)
        } else {
            minsAsSec = Number(s.minutos) || 0
        }

        return {
            t2_c: acc.t2_c + t2c, t2_i: acc.t2_i + t2i,
            t3_c: acc.t3_c + t3c, t3_i: acc.t3_i + t3i,
            tl_c: acc.tl_c + tlc, tl_i: acc.tl_i + tli,
            tc_c: acc.tc_c + t2c + t3c, tc_i: acc.tc_i + t2i + t3i,
            ro: acc.ro + (s.rebotes_ofensivos || 0),
            rd: acc.rd + (s.rebotes_defensivos || 0),
            rt: acc.rt + (s.rebotes_totales || 0),
            as: acc.as + (s.asistencias || 0),
            per: acc.per + (s.perdidas || 0),
            rec: acc.rec + (s.recuperos || 0),
            bs: acc.bs + (s.bloqueos || 0),
            ba: acc.ba + (s.bloqueos_recibidos || 0),
            fc: acc.fc + (s.faltas || 0),
            fr: acc.fr + (s.faltas_recibidas || 0),
            mm: acc.mm + (s.mas_menos || 0),
            ef: acc.ef + (s.eficiencia || 0),
            pts: acc.pts + (s.puntos || 0),
            minSec: acc.minSec + minsAsSec
        }
    }, {
        t2_c: 0, t2_i: 0, t3_c: 0, t3_i: 0, tl_c: 0, tl_i: 0, tc_c: 0, tc_i: 0,
        ro: 0, rd: 0, rt: 0, as: 0, per: 0, rec: 0, bs: 0, ba: 0, fc: 0, fr: 0, mm: 0, ef: 0, pts: 0, minSec: 0
    })
}

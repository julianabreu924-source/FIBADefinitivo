export default function PrintableReport({ partido, equipoLocal, equipoVisitante, resumen, parciales = [] }) {
    if (!partido || !resumen) return null

    const statsLocal = resumen.estadisticas?.local || []
    const statsVisitante = resumen.estadisticas?.visitante || []
    const izq = resumen.cuadro_izquierdo || {}
    const der = resumen.cuadro_derecho || {}

    const pct = (c, i) => i > 0 ? ((c / i) * 100).toFixed(1) : '0.0'

    const getScoreToInterval = (equipoId, q, i) => {
        let total = 0
        let hasData = false
        parciales.forEach(p => {
            if (p.cuarto < q || (p.cuarto === q && p.intervalo <= i)) {
                total += (equipoId === partido.local_id ? p.pts_local : p.pts_visitante)
                if (p.pts_local > 0 || p.pts_visitante > 0 || (p.cuarto === q && p.intervalo === i)) hasData = true
            }
        })
        return hasData ? total : ''
    }

    // Parciales por cuarto para mostrar (24-16, 17-12, ...)
    const parcialesPorCuarto = [1, 2, 3, 4].map(q => {
        const p = parciales.find(p => p.cuarto === q && p.intervalo === 2)
        return p ? `${p.pts_local}-${p.pts_visitante}` : null
    }).filter(Boolean)

    const renderStatsTable = (equipo, stats, esLocal) => {
        const t = stats.reduce((acc, j) => ({
            t2_c: acc.t2_c + (j.t2_conv || 0), t2_i: acc.t2_i + (j.t2_total || 0),
            t3_c: acc.t3_c + (j.t3_conv || 0), t3_i: acc.t3_i + (j.t3_total || 0),
            tl_c: acc.tl_c + (j.tl_conv || 0), tl_i: acc.tl_i + (j.tl_total || 0),
            ro: acc.ro + (j.rebotes_ofensivos || 0), rd: acc.rd + (j.rebotes_defensivos || 0), rt: acc.rt + (j.rebotes_totales || 0),
            as: acc.as + (j.asistencias || 0), per: acc.per + (j.perdidas || 0), rec: acc.rec + (j.recuperos || 0),
            tf: acc.tf + (j.bloqueos || 0), fc: acc.fc + (j.faltas || 0), fr: acc.fr + (j.faltas_recibidas || 0),
            mm: acc.mm + (j.mas_menos || 0), ef: acc.ef + (j.eficiencia || 0), pts: acc.pts + (j.puntos || 0)
        }), { t2_c:0,t2_i:0,t3_c:0,t3_i:0,tl_c:0,tl_i:0,ro:0,rd:0,rt:0,as:0,per:0,rec:0,tf:0,fc:0,fr:0,mm:0,ef:0,pts:0 })

        const tc_c = t.t2_c + t.t3_c
        const tc_i = t.t2_i + t.t3_i

        return (
            <div style={{ marginBottom: '6pt', pageBreakInside: 'avoid' }}>
                {/* Encabezado del equipo */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2pt', padding: '0 2pt' }}>
                    <span style={{ fontSize: '9pt', fontWeight: '900', textTransform: 'uppercase' }}>
                        {equipo?.nombre} ({equipo?.abrev})
                    </span>
                    <span style={{ fontSize: '7pt' }}>
                        Entrenador: <strong>{equipo?.entrenador || '_______________'}</strong>
                        &nbsp;&nbsp;Asistente(s): <strong>{equipo?.asistente1 || '_______________'}{equipo?.asistente2 ? `, ${equipo.asistente2}` : ''}</strong>
                    </span>
                </div>

                <table className="fiba-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th rowSpan={2} style={{ width: '16pt' }}>No</th>
                            <th rowSpan={2} style={{ width: '105pt', textAlign: 'left', paddingLeft: '3pt' }}>Nombre</th>
                            <th rowSpan={2} style={{ width: '20pt' }}>Min</th>
                            <th colSpan={2}>Tiros de campo</th>
                            <th colSpan={2}>2 puntos</th>
                            <th colSpan={2}>3 puntos</th>
                            <th colSpan={2}>Tiros 1 pt</th>
                            <th colSpan={3}>Rebotes</th>
                            <th rowSpan={2} style={{ width: '14pt' }}>AS</th>
                            <th rowSpan={2} style={{ width: '14pt' }}>Per</th>
                            <th rowSpan={2} style={{ width: '14pt' }}>Rec</th>
                            <th rowSpan={2} style={{ width: '14pt' }}>TF</th>
                            <th colSpan={2}>Faltas</th>
                            <th rowSpan={2} style={{ width: '16pt' }}>+/-</th>
                            <th rowSpan={2} style={{ width: '16pt' }}>Ef</th>
                            <th rowSpan={2} style={{ width: '18pt', backgroundColor: '#ddd' }}>Pts</th>
                        </tr>
                        <tr>
                            <th style={{ width: '22pt' }}>C/I</th><th style={{ width: '20pt' }}>%</th>
                            <th style={{ width: '22pt' }}>C/I</th><th style={{ width: '20pt' }}>%</th>
                            <th style={{ width: '22pt' }}>C/I</th><th style={{ width: '20pt' }}>%</th>
                            <th style={{ width: '22pt' }}>C/I</th><th style={{ width: '20pt' }}>%</th>
                            <th style={{ width: '13pt' }}>RO</th>
                            <th style={{ width: '13pt' }}>RD</th>
                            <th style={{ width: '13pt' }}>RT</th>
                            <th style={{ width: '13pt' }}>FC</th>
                            <th style={{ width: '13pt' }}>FR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((j, idx) => {
                            const esNJ = j.nj === 1 || (!j.minutos || j.minutos === '0:00') && j.puntos === 0 && j.rebotes_totales === 0
                            const tc_c = (j.t2_conv || 0) + (j.t3_conv || 0)
                            const tc_i = (j.t2_total || 0) + (j.t3_total || 0)
                            return (
                                <tr key={j.id || idx} style={{ height: '11pt', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                                    <td style={{ textAlign: 'center' }}>{j.numero}{j.es_titular ? ' *' : ''}</td>
                                    <td style={{ textAlign: 'left', paddingLeft: '3pt', textTransform: 'uppercase' }}>{j.nombre}</td>
                                    {esNJ ? (
                                        <>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>NJ</td>
                                            {Array(20).fill(null).map((_, i) => <td key={i} style={{ textAlign: 'center', color: '#ccc' }}>—</td>)}
                                        </>
                                    ) : (
                                        <>
                                            <td style={{ textAlign: 'center' }}>{j.minutos || '0:00'}</td>
                                            <td style={{ textAlign: 'center' }}>{tc_c}/{tc_i}</td>
                                            <td style={{ textAlign: 'center' }}>{pct(tc_c, tc_i)}</td>
                                            <td style={{ textAlign: 'center' }}>{j.t2_conv || 0}/{j.t2_total || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{pct(j.t2_conv, j.t2_total)}</td>
                                            <td style={{ textAlign: 'center' }}>{j.t3_conv || 0}/{j.t3_total || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{pct(j.t3_conv, j.t3_total)}</td>
                                            <td style={{ textAlign: 'center' }}>{j.tl_conv || 0}/{j.tl_total || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{pct(j.tl_conv, j.tl_total)}</td>
                                            <td style={{ textAlign: 'center' }}>{j.rebotes_ofensivos || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{j.rebotes_defensivos || 0}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{j.rebotes_totales || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{j.asistencias || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{j.perdidas || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{j.recuperos || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{j.bloqueos || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{j.faltas || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{j.faltas_recibidas || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{j.mas_menos || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{Math.round(j.eficiencia || 0)}</td>
                                            <td style={{ textAlign: 'center', fontWeight: '900', backgroundColor: '#e8e8e8' }}>{j.puntos || 0}</td>
                                        </>
                                    )}
                                </tr>
                            )
                        })}

                        {/* Fila Equipo/Entrenador */}
                        <tr style={{ height: '11pt' }}>
                            <td colSpan={2} style={{ paddingLeft: '3pt', fontStyle: 'italic' }}>Equipo/Entrenador</td>
                            <td style={{ textAlign: 'center' }}></td>
                            {Array(18).fill(null).map((_, i) => <td key={i} style={{ textAlign: 'center' }}>0</td>)}
                            <td style={{ textAlign: 'center' }}></td>
                            <td style={{ textAlign: 'center' }}></td>
                            <td style={{ textAlign: 'center', backgroundColor: '#e8e8e8', fontWeight: '900' }}>0</td>
                        </tr>

                        {/* Fila TOTALES */}
                        <tr style={{ height: '13pt', backgroundColor: '#e0e0e0' }}>
                            <td colSpan={2} style={{ paddingLeft: '3pt', fontWeight: '900', textTransform: 'uppercase' }}>Totales</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>200:00</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{tc_c}/{tc_i}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{pct(tc_c, tc_i)}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.t2_c}/{t.t2_i}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{pct(t.t2_c, t.t2_i)}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.t3_c}/{t.t3_i}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{pct(t.t3_c, t.t3_i)}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.tl_c}/{t.tl_i}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{pct(t.tl_c, t.tl_i)}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.ro}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.rd}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.rt}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.as}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.per}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.rec}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.tf}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.fc}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.fr}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{t.mm}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{Math.round(t.ef)}</td>
                            <td style={{ textAlign: 'center', fontWeight: '900', backgroundColor: '#ccc' }}>{t.pts}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <div
            id="fiba-printable-report"
            style={{
                backgroundColor: 'white', color: 'black', fontFamily: 'Arial, sans-serif',
                width: '100%', padding: '10pt', fontSize: '7.5pt', lineHeight: '1.2',
                display: 'flex', flexDirection: 'column', minHeight: '100vh'
            }}
        >
            {/* ── 1. HEADER ── */}
            <div style={{ borderBottom: '2px solid black', paddingBottom: '6pt', marginBottom: '6pt' }}>

                {/* Fila 1: Logo + Título + Info juego */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4pt' }}>
                    <div style={{ display: 'flex', gap: '10pt', alignItems: 'center' }}>
                        <div style={{ width: '50pt', height: '50pt', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6pt', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                            LOGO
                        </div>
                        <div>
                            <div style={{ fontSize: '11pt', fontWeight: '900', textTransform: 'uppercase', lineHeight: 1.1 }}>
                                {partido.competicion || 'Liga Nacional de Baloncesto'}
                            </div>
                            <div style={{ fontSize: '8pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#444' }}>
                                Planilla Estadística — FIBA
                            </div>
                            <div style={{ fontSize: '7pt', marginTop: '2pt', color: '#555' }}>
                                {partido.cancha || 'Estadio Oficial'} &nbsp;|&nbsp;
                                {new Date(partido.fecha).toLocaleDateString('es-DO', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} &nbsp;|&nbsp;
                                Juego No: {partido.id}
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '7pt' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2pt' }}>
                            Árbitro: <span style={{ fontWeight: '900' }}>{partido.arbitro_principal || '_______________'}</span>
                        </div>
                        <div>
                            Árbitro(s): <strong>{partido.arbitro_asistente1 || '_______________'}</strong>
                            {partido.arbitro_asistente2 && <>, <strong>{partido.arbitro_asistente2}</strong></>}
                        </div>
                        <div style={{ marginTop: '3pt', color: '#777', fontStyle: 'italic' }}>
                            Reporte generado: {new Date().toLocaleDateString('es-DO')} {new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                {/* Fila 2: Marcador final + parciales */}
                <div style={{ border: '1px solid black', padding: '4pt 8pt', backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Marcador */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12pt' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '9pt', fontWeight: '900', textTransform: 'uppercase' }}>{equipoVisitante?.nombre}</div>
                            <div style={{ fontSize: '22pt', fontWeight: '900', lineHeight: 1 }}>{partido.pts_visitante}</div>
                        </div>
                        <div style={{ fontSize: '9pt', color: '#aaa', fontWeight: 'bold' }}>VS</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '9pt', fontWeight: '900', textTransform: 'uppercase' }}>{equipoLocal?.nombre}</div>
                            <div style={{ fontSize: '22pt', fontWeight: '900', lineHeight: 1 }}>{partido.pts_local}</div>
                        </div>
                    </div>

                    {/* Parciales */}
                    <div style={{ textAlign: 'center' }}>
                        {parcialesPorCuarto.length > 0 && (
                            <div style={{ fontSize: '7pt', color: '#555', marginBottom: '3pt' }}>
                                ({parcialesPorCuarto.join(', ')})
                            </div>
                        )}
                        <div style={{ fontSize: '7pt', fontWeight: 'bold', marginBottom: '3pt', textTransform: 'uppercase' }}>
                            Resultado por 5 intervalos de minutos
                        </div>
                        <table className="fiba-table" style={{ fontSize: '7pt' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#e0e0e0' }}>
                                    <th style={{ width: '30pt' }}></th>
                                    <th colSpan={2}>C1</th>
                                    <th colSpan={2}>C2</th>
                                    <th colSpan={2}>C3</th>
                                    <th colSpan={2}>C4</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>{equipoLocal?.abrev}</td>
                                    {[1,2,3,4].map(q => [1,2].map(i => (
                                        <td key={`l-${q}-${i}`} style={{ textAlign: 'center', backgroundColor: i === 2 ? '#f0f0f0' : '#fff' }}>
                                            {getScoreToInterval(partido.local_id, q, i)}
                                        </td>
                                    )))}
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>{equipoVisitante?.abrev}</td>
                                    {[1,2,3,4].map(q => [1,2].map(i => (
                                        <td key={`v-${q}-${i}`} style={{ textAlign: 'center', backgroundColor: i === 2 ? '#f0f0f0' : '#fff' }}>
                                            {getScoreToInterval(partido.visitante_id, q, i)}
                                        </td>
                                    )))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── 2. TABLAS JUGADORES ── */}
            <div style={{ flexGrow: 1, marginBottom: '6pt' }}>
                {renderStatsTable(equipoLocal, statsLocal, true)}
                {renderStatsTable(equipoVisitante, statsVisitante, false)}
            </div>

            {/* ── 3. SECCIÓN INFERIOR ── */}
            <div style={{ borderTop: '2px solid black', paddingTop: '6pt', display: 'flex', gap: '10pt', alignItems: 'flex-start' }}>

                {/* Análisis de Puntos */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '900', fontSize: '7.5pt', textTransform: 'uppercase', borderBottom: '1px solid black', marginBottom: '2pt', paddingBottom: '1pt' }}>
                        Análisis de Puntos
                    </div>
                    <table className="fiba-table" style={{ width: '100%' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ textAlign: 'left', paddingLeft: '3pt' }}>Categoría</th>
                                <th style={{ width: '35pt' }}>{equipoLocal?.abrev}</th>
                                <th style={{ width: '35pt' }}>{equipoVisitante?.abrev}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style={{ paddingLeft: '3pt' }}>Pts de pérdidas</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{der.pts_tras_perdida?.local || 0}</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{der.pts_tras_perdida?.visitante || 0}</td></tr>
                            <tr><td style={{ paddingLeft: '3pt' }}>Pts en la pintura</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{der.pts_pintura?.local || 0}</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{der.pts_pintura?.visitante || 0}</td></tr>
                            <tr><td style={{ paddingLeft: '3pt' }}>Pts 2da oportunidad</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{der.pts_segunda_oportunidad?.local || 0}</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{der.pts_segunda_oportunidad?.visitante || 0}</td></tr>
                            <tr><td style={{ paddingLeft: '3pt' }}>Pts de contra ataque</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{der.pts_contraataque?.local || 0}</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{der.pts_contraataque?.visitante || 0}</td></tr>
                            <tr><td style={{ paddingLeft: '3pt' }}>Pts de la banca</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{der.pts_banquillo?.local || 0}</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{der.pts_banquillo?.visitante || 0}</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Hitos del Partido */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '900', fontSize: '7.5pt', textTransform: 'uppercase', borderBottom: '1px solid black', marginBottom: '2pt', paddingBottom: '1pt' }}>
                        Hitos del Partido
                    </div>
                    <table className="fiba-table" style={{ width: '100%' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ textAlign: 'left', paddingLeft: '3pt' }}></th>
                                <th style={{ width: '55pt' }}>{equipoLocal?.abrev}</th>
                                <th style={{ width: '55pt' }}>{equipoVisitante?.abrev}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style={{ paddingLeft: '3pt' }}>Mayor ventaja</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{izq.mayor_ventaja?.local || 0}</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{izq.mayor_ventaja?.visitante || 0}</td></tr>
                            <tr><td style={{ paddingLeft: '3pt' }}>Mayor racha anotación consecutiva</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{izq.mayor_racha?.local || 0}</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{izq.mayor_racha?.visitante || 0}</td></tr>
                            <tr><td style={{ paddingLeft: '3pt' }}>Cambios de liderazgo</td><td style={{ textAlign: 'center', fontWeight: 'bold' }} colSpan={2}>{izq.cambios_liderazgo || 0}</td></tr>
                            <tr><td style={{ paddingLeft: '3pt' }}>Empates</td><td style={{ textAlign: 'center', fontWeight: 'bold' }} colSpan={2}>{izq.empates || 0}</td></tr>
                            <tr><td style={{ paddingLeft: '3pt' }}>Tiempo liderando</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{izq.tiempo_con_ventaja?.local || '00:00'}</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{izq.tiempo_con_ventaja?.visitante || '00:00'}</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Leyenda */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '900', fontSize: '7.5pt', textTransform: 'uppercase', borderBottom: '1px solid black', marginBottom: '2pt', paddingBottom: '1pt' }}>
                        Leyenda
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1pt 8pt', fontSize: '6.5pt', backgroundColor: '#f8f8f8', padding: '3pt', border: '1px solid #ddd' }}>
                        {[
                            ['No','Número jugador'], ['Min','Minutos jugados'], ['C/I','Conv / Intentados'],
                            ['%','Porcentaje de tiro'], ['RO','Rebotes ofensivos'], ['RD','Rebotes defensivos'],
                            ['RT','Rebotes totales'], ['AS','Asistencias'], ['Per','Pérdidas'],
                            ['Rec','Recuperos'], ['TF','Bloqueos'], ['FC','Faltas cometidas'],
                            ['FR','Faltas recibidas'], ['+/-','Más/Menos'], ['Ef','Eficiencia'],
                            ['Pts','Puntos'], ['NJ','No Jugó'], ['*','Titular'],
                        ].map(([k, v]) => (
                            <div key={k}><span style={{ color: '#888', fontWeight: 'bold' }}>{k}</span> {v}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── 4. FIRMAS ── */}
            <div style={{ marginTop: '20pt', display: 'flex', justifyContent: 'space-around', gap: '20pt', fontSize: '7.5pt', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>
                {['Firma Árbitro Principal', 'Firma Oficial de Mesa', 'Firma Comisario FIBA'].map(f => (
                    <div key={f} style={{ flex: 1 }}>
                        <div style={{ borderTop: '1.5px solid black', paddingTop: '3pt' }}>{f}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

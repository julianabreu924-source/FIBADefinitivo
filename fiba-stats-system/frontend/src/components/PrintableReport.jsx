import { useRef } from 'react'

export default function PrintableReport({ partido, equipoLocal, equipoVisitante, resumen, parciales = [] }) {
    if (!partido || !resumen) return null

    const statsLocal = resumen.estadisticas?.local || []
    const statsVisitante = resumen.estadisticas?.visitante || []
    const izq = resumen.cuadro_izquierdo || {}
    const der = resumen.cuadro_derecho || {}

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

    const renderStatsTable = (equipo, stats) => {
        const t = stats.reduce((acc, j) => ({
            t2_c: acc.t2_c + (j.t2_conv || 0), t2_i: acc.t2_i + (j.t2_total || 0),
            t3_c: acc.t3_c + (j.t3_conv || 0), t3_i: acc.t3_i + (j.t3_total || 0),
            tl_c: acc.tl_c + (j.tl_conv || 0), tl_i: acc.tl_i + (j.tl_total || 0),
            ro: acc.ro + (j.rebotes_ofensivos || 0), rd: acc.rd + (j.rebotes_defensivos || 0), rt: acc.rt + (j.rebotes_totales || 0),
            as: acc.as + (j.asistencias || 0), per: acc.per + (j.perdidas || 0), rec: acc.rec + (j.recuperos || 0), tf: acc.tf + (j.bloqueos || 0),
            fc: acc.fc + (j.faltas || 0), fr: acc.fr + (j.faltas_recibidas || 0), mm: acc.mm + (j.mas_menos || 0),
            ef: acc.ef + (j.eficiencia || 0), pts: acc.pts + (j.puntos || 0)
        }), { t2_c: 0, t2_i: 0, t3_c: 0, t3_i: 0, tl_c: 0, tl_i: 0, ro: 0, rd: 0, rt: 0, as: 0, per: 0, rec: 0, tf: 0, fc: 0, fr: 0, mm: 0, ef: 0, pts: 0 })

        const tc_c = t.t2_c + t.t3_c
        const tc_i = t.t2_i + t.t3_i

        return (
            <div className="mb-4">
                <div className="text-[13px] font-bold uppercase mb-1">{equipo?.nombre} ({equipo?.abrev})</div>
                <table className="fiba-table w-full">
                    <thead>
                        <tr>
                            <th rowSpan={2} style={{ width: '25px' }}>No</th>
                            <th rowSpan={2} style={{ width: '140px', textAlign: 'left', paddingLeft: '4px' }}>Nombre</th>
                            <th rowSpan={2} style={{ width: '35px' }}>Min</th>
                            <th colSpan={2}>Tiros de campo</th>
                            <th colSpan={2}>2 puntos</th>
                            <th colSpan={2}>3 puntos</th>
                            <th colSpan={2}>Tiros 1 pt</th>
                            <th colSpan={3}>Rebotes</th>
                            <th rowSpan={2} style={{ width: '20px' }}>AS</th>
                            <th rowSpan={2} style={{ width: '25px' }}>Per</th>
                            <th rowSpan={2} style={{ width: '25px' }}>Rec</th>
                            <th rowSpan={2} style={{ width: '20px' }}>TF</th>
                            <th colSpan={2}>Faltas</th>
                            <th rowSpan={2} style={{ width: '25px' }}>+/-</th>
                            <th rowSpan={2} style={{ width: '25px' }}>Ef</th>
                            <th rowSpan={2} style={{ width: '25px' }}>Pts</th>
                        </tr>
                        <tr>
                            <th style={{ width: '35px' }}>C/I</th>
                            <th style={{ width: '30px' }}>%</th>
                            <th style={{ width: '35px' }}>C/I</th>
                            <th style={{ width: '30px' }}>%</th>
                            <th style={{ width: '35px' }}>C/I</th>
                            <th style={{ width: '30px' }}>%</th>
                            <th style={{ width: '35px' }}>C/I</th>
                            <th style={{ width: '30px' }}>%</th>
                            <th style={{ width: '20px' }}>RO</th>
                            <th style={{ width: '20px' }}>RD</th>
                            <th style={{ width: '20px' }}>RT</th>
                            <th style={{ width: '20px' }}>FC</th>
                            <th style={{ width: '20px' }}>FR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map(j => {
                            const j_tc_c = (j.t2_conv || 0) + (j.t3_conv || 0)
                            const j_tc_i = (j.t2_total || 0) + (j.t3_total || 0)
                            const j_tc_pct = j_tc_i > 0 ? ((j_tc_c / j_tc_i) * 100).toFixed(1) : '0.0'

                            return (
                                <tr key={j.id}>
                                    <td className="text-center">{j.numero}</td>
                                    <td className="uppercase pl-1">
                                        {j.es_titular ? `* ${j.nombre}` : j.nombre}
                                    </td>
                                    <td className="text-center">{(j.minutos && j.minutos !== '0:00' && j.minutos !== '00:00') ? j.minutos : 'NJ'}</td>
                                    <td className="text-center">{j_tc_c}/{j_tc_i}</td>
                                    <td className="text-center">{j_tc_pct}</td>
                                    <td className="text-center">{j.t2_conv || 0}/{j.t2_total || 0}</td>
                                    <td className="text-center">{j.t2_total > 0 ? ((j.t2_conv / j.t2_total) * 100).toFixed(1) : '0.0'}</td>
                                    <td className="text-center">{j.t3_conv || 0}/{j.t3_total || 0}</td>
                                    <td className="text-center">{j.t3_total > 0 ? ((j.t3_conv / j.t3_total) * 100).toFixed(1) : '0.0'}</td>
                                    <td className="text-center">{j.tl_conv || 0}/{j.tl_total || 0}</td>
                                    <td className="text-center">{j.tl_total > 0 ? ((j.tl_conv / j.tl_total) * 100).toFixed(1) : '0.0'}</td>
                                    <td className="text-center">{j.rebotes_ofensivos || 0}</td>
                                    <td className="text-center">{j.rebotes_defensivos || 0}</td>
                                    <td className="text-center font-bold">{j.rebotes_totales || 0}</td>
                                    <td className="text-center">{j.asistencias || 0}</td>
                                    <td className="text-center">{j.perdidas || 0}</td>
                                    <td className="text-center">{j.recuperos || 0}</td>
                                    <td className="text-center">{j.bloqueos || 0}</td>
                                    <td className="text-center">{j.faltas || 0}</td>
                                    <td className="text-center">{j.faltas_recibidas || 0}</td>
                                    <td className="text-center">{j.mas_menos || 0}</td>
                                    <td className="text-center">{j.eficiencia || 0}</td>
                                    <td className="text-center">{j.puntos || 0}</td>
                                </tr>
                            )
                        })}
                        <tr>
                            <td colSpan={2} className="pl-1">Equipo/Entrenador</td>
                            <td className="text-center"></td>
                            <td className="text-center">0/0</td><td className="text-center">0.0</td>
                            <td className="text-center">0/0</td><td className="text-center">0.0</td>
                            <td className="text-center">0/0</td><td className="text-center">0.0</td>
                            <td className="text-center">0/0</td><td className="text-center">0.0</td>
                            <td className="text-center">0</td><td className="text-center">0</td><td className="text-center">0</td>
                            <td className="text-center">0</td><td className="text-center">0</td><td className="text-center">0</td><td className="text-center">0</td>
                            <td className="text-center">0</td><td className="text-center">1</td>
                            <td className="text-center"></td><td className="text-center"></td><td className="text-center">0</td>
                        </tr>
                        <tr>
                            <td colSpan={2} className="pl-1 font-bold">Totales</td>
                            <td className="text-center">200.00</td>
                            <td className="text-center">{tc_c}/{tc_i}</td>
                            <td className="text-center">{tc_i > 0 ? ((tc_c / tc_i) * 100).toFixed(1) : '0.0'}</td>
                            <td className="text-center">{t.t2_c}/{t.t2_i}</td>
                            <td className="text-center">{t.t2_i > 0 ? ((t.t2_c / t.t2_i) * 100).toFixed(1) : '0.0'}</td>
                            <td className="text-center">{t.t3_c}/{t.t3_i}</td>
                            <td className="text-center">{t.t3_i > 0 ? ((t.t3_c / t.t3_i) * 100).toFixed(1) : '0.0'}</td>
                            <td className="text-center">{t.tl_c}/{t.tl_i}</td>
                            <td className="text-center">{t.tl_i > 0 ? ((t.tl_c / t.tl_i) * 100).toFixed(1) : '0.0'}</td>
                            <td className="text-center">{t.ro}</td>
                            <td className="text-center">{t.rd}</td>
                            <td className="text-center">{t.rt}</td>
                            <td className="text-center">{t.as}</td>
                            <td className="text-center">{t.per}</td>
                            <td className="text-center">{t.rec}</td>
                            <td className="text-center">{t.tf}</td>
                            <td className="text-center">{t.fc}</td>
                            <td className="text-center">{t.fr}</td>
                            <td className="text-center">{t.mm}</td>
                            <td className="text-center">{t.ef}</td>
                            <td className="text-center font-bold bg-[#eaeaea]">{t.pts}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="text-[10px] mt-2 mb-6 ml-2 leading-tight">
                    <div>Entrenador: {equipo?.entrenador || 'N/A'}</div>
                    <div>Entrenador(es) asistente(s): {equipo?.asistente || 'N/A'}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white text-black font-sans w-full" id="fiba-printable-report" style={{ fontSize: '10px' }}>

            <div className="flex justify-between items-start mb-6 align-top">
                <div className="w-[10%]">
                   <div className="text-2xl font-black italic border-2 border-black inline-block px-2 text-center">FIBA</div>
                </div>
                
                <div className="w-[45%] text-left pt-2">
                    <h1 className="text-[16px] font-medium leading-none mb-1">
                        {equipoLocal?.nombre} <span className="font-bold">{partido.pts_local} - {partido.pts_visitante}</span> {equipoVisitante?.nombre}
                    </h1>
                    <div className="text-[10px] text-gray-700">
                        ({getPuntajeAcumulado(partido.local_id,1)}-{getPuntajeAcumulado(partido.visitante_id,1)}, {getPuntajeAcumulado(partido.local_id,2)}-{getPuntajeAcumulado(partido.visitante_id,2)}, {getPuntajeAcumulado(partido.local_id,3)}-{getPuntajeAcumulado(partido.visitante_id,3)}, {partido.pts_local}-{partido.pts_visitante})
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 mt-4 text-[10px]">
                        <div>Juego No: {partido.id}</div>
                        <div>Fecha: {new Date(partido.fecha).toLocaleDateString()} Hora: 20:00</div>
                        <div>Sede: {partido.cancha || 'N/A'}</div>
                        <div>Duración del juego: 02:00</div>
                        <div>Árbitro: {partido.arbitro_principal || 'N/A'}</div>
                        <div>Árbitro(s): {[partido.arbitro_asistente1, partido.arbitro_asistente2].filter(Boolean).join(', ') || 'N/A'}</div>
                    </div>
                </div>

                <div className="w-[40%] flex justify-end">
                    <div className="flex">
                       <div className="vertical-text text-[9px] mt-2 mr-2 leading-tight flex items-center h-full">Resultado por 5 intervalo de minutos</div>
                       <table className="fiba-table w-[250px] ml-1">
                           <thead>
                               <tr>
                                   <th rowSpan={2} style={{border: 'none'}}></th>
                                   <th colSpan={2}>C1</th>
                                   <th colSpan={2}>C2</th>
                                   <th colSpan={2}>C3</th>
                                   <th colSpan={2}>C4</th>
                               </tr>
                           </thead>
                           <tbody>
                               <tr className="text-center h-6">
                                   <td className="font-bold border-none text-right pr-2 uppercase">{equipoLocal?.abrev}</td>
                                   <td>{getScoreToInterval(partido.local_id, 1, 1)}</td>
                                   <td>{getScoreToInterval(partido.local_id, 1, 2)}</td>
                                   <td>{getScoreToInterval(partido.local_id, 2, 1)}</td>
                                   <td>{getScoreToInterval(partido.local_id, 2, 2)}</td>
                                   <td>{getScoreToInterval(partido.local_id, 3, 1)}</td>
                                   <td>{getScoreToInterval(partido.local_id, 3, 2)}</td>
                                   <td>{getScoreToInterval(partido.local_id, 4, 1)}</td>
                                   <td>{getScoreToInterval(partido.local_id, 4, 2)}</td>
                               </tr>
                               <tr className="text-center h-6">
                                   <td className="font-bold border-none text-right pr-2 uppercase">{equipoVisitante?.abrev}</td>
                                   <td>{getScoreToInterval(partido.visitante_id, 1, 1)}</td>
                                   <td>{getScoreToInterval(partido.visitante_id, 1, 2)}</td>
                                   <td>{getScoreToInterval(partido.visitante_id, 2, 1)}</td>
                                   <td>{getScoreToInterval(partido.visitante_id, 2, 2)}</td>
                                   <td>{getScoreToInterval(partido.visitante_id, 3, 1)}</td>
                                   <td>{getScoreToInterval(partido.visitante_id, 3, 2)}</td>
                                   <td>{getScoreToInterval(partido.visitante_id, 4, 1)}</td>
                                   <td>{getScoreToInterval(partido.visitante_id, 4, 2)}</td>
                               </tr>
                           </tbody>
                       </table>
                    </div>
                </div>
            </div>

            {renderStatsTable(equipoLocal, statsLocal)}
            {renderStatsTable(equipoVisitante, statsVisitante)}

            <style dangerouslySetInnerHTML={{
                __html: `
        :root {
            --fiba-border: 1.5px solid #000;
        }

        .fiba-table {
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            font-size: 10px;
        }
        .fiba-table th, .fiba-table td {
            border: 1px solid #111;
            padding: 2px 0;
        }
        .fiba-table th {
            font-weight: normal;
            background-color: transparent;
            text-align: center;
        }

        .vertical-text {
            writing-mode: tb-rl;
            transform: rotate(180deg);
        }

        @media print {
          @page { margin: 10mm; size: A4 landscape; }
          
          body { 
            visibility: hidden !important; 
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color: black !important;
          }

          #print-container, #print-container *, #fiba-printable-report, #fiba-printable-report * {
            visibility: visible !important;
          }

          #print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .fiba-table th, .fiba-table td {
            border: 1px solid #000 !important;
          }
        }
      `}} />
        </div>
    )
}

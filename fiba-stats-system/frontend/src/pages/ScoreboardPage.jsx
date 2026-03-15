import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, Link } from 'react-router-dom'
import { Shield, Database, Server, Info, HelpCircle } from 'lucide-react'
import { getPartido } from '../services/api'
import { usePartido } from '../hooks/usePartido'
import AnimatedNumber from '../components/AnimatedNumber'

const calcPct = (c, i) => {
  if (!i || i === 0) return "0.0";
  return ((c / i) * 100).toFixed(1);
}

const StatCell = ({ main, sub, color, isBold = false, className = "" }) => (
  <td className={`text-center py-1 px-1 border-r border-white/5 ${className}`}>
    <div className="flex flex-col items-center">
      <span className={`text-[11px] tabular-nums ${isBold ? 'font-black' : 'font-bold'} ${color || 'text-white'}`}>
        {typeof main === 'number' ? <AnimatedNumber value={main} /> : main}
      </span>
      {sub !== undefined && <span className="text-[8px] text-[#444] font-black leading-none">{sub}%</span>}
    </div>
  </td>
)

const LegendItem = ({ abrev, desc }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] font-black text-[#0078D4] w-8">{abrev}</span>
    <span className="text-[9px] font-bold text-[#555] uppercase tracking-wider">{desc}</span>
  </div>
)

const PlayerRow = ({ player, stats, colorPrincipal, index }) => {
  const tc_conv = (stats.t2_convertidos || 0) + (stats.t3_convertidos || 0);
  const tc_total = (stats.t2_intentados || 0) + (stats.t3_intentados || 0);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.01 }}
      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors h-10 group"
    >
      <td className="w-8 border-r border-white/5 text-center font-oswald text-sm font-black italic" style={{ color: colorPrincipal }}>
        {player.numero}
      </td>
      <td className="px-3 border-r border-white/5 whitespace-nowrap overflow-hidden text-ellipsis min-w-[200px]">
        <span className="text-[11px] font-black uppercase tracking-tight text-[#ccc] group-hover:text-white transition-colors">
          {player.nombre}
        </span>
      </td>
      <td className="text-center text-[10px] font-mono font-bold text-[#555] border-r border-white/5">
        {stats.nj ? 'NJ' : (stats.minutos || '0:00')}
      </td>

      {/* FG TOTALS */}
      <StatCell main={`${tc_conv}/${tc_total}`} sub={calcPct(tc_conv, tc_total)} color="text-white/40" />

      {/* 2P */}
      <StatCell main={`${stats.t2_convertidos || 0}/${stats.t2_intentados || 0}`} sub={calcPct(stats.t2_convertidos, stats.t2_intentados)} color="text-[#0078D4]" />

      {/* 3P */}
      <StatCell main={`${stats.t3_convertidos || 0}/${stats.t3_intentados || 0}`} sub={calcPct(stats.t3_convertidos, stats.t3_intentados)} color="text-[#fbbf24]" />

      {/* FT */}
      <StatCell main={`${stats.tl_convertidos || 0}/${stats.tl_intentados || 0}`} sub={calcPct(stats.tl_convertidos, stats.tl_intentados)} color="text-[#a78bfa]" />

      {/* REBOUNDS */}
      <td className="px-2 border-r border-white/5">
        <div className="flex items-center justify-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#555] font-bold"><AnimatedNumber value={stats.rebotes_ofensivos || 0} /></span>
            <span className="text-[7px] text-[#333] font-black">OR</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#555] font-bold"><AnimatedNumber value={stats.rebotes_defensivos || 0} /></span>
            <span className="text-[7px] text-[#333] font-black">DR</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 px-1.5 rounded-sm border border-white/5 min-w-[24px]">
            <span className="text-[11px] text-white font-black"><AnimatedNumber value={stats.rebotes_totales || 0} /></span>
            <span className="text-[7px] text-[#0078D4] font-black">TOT</span>
          </div>
        </div>
      </td>

      <StatCell main={stats.asistencias || 0} color="text-green-500/80" />
      <StatCell main={stats.perdidas || 0} color="text-red-500/50" />
      <StatCell main={stats.recuperos || 0} color="text-cyan-500/80" />

      {/* BLOCKS (F/R) */}
      <td className="px-1 border-r border-white/5">
        <div className="flex flex-col items-center">
          <div className="flex gap-1.5 text-[10px] font-bold tabular-nums">
            <span className="text-[#818cf8]"><AnimatedNumber value={stats.bloqueos || 0} /></span>
            <span className="text-[#333]">/</span>
            <span className="text-[#333]"><AnimatedNumber value={stats.bloqueos_recibidos || 0} /></span>
          </div>
          <span className="text-[7px] text-[#222] font-black">BS/BA</span>
        </div>
      </td>

      {/* FOULS (C/R) */}
      <td className="px-1 border-r border-white/5">
        <div className="flex flex-col items-center">
          <div className="flex gap-1.5 text-[10px] font-bold tabular-nums">
            <span className="text-orange-500"><AnimatedNumber value={stats.faltas || 0} /></span>
            <span className="text-[#333]">/</span>
            <span className="text-orange-500/40"><AnimatedNumber value={stats.faltas_recibidas || 0} /></span>
          </div>
          <span className="text-[7px] text-[#222] font-black">PF/FD</span>
        </div>
      </td>

      <StatCell main={stats.mas_menos || 0} color={stats.mas_menos > 0 ? "text-green-400" : stats.mas_menos < 0 ? "text-red-400" : "text-[#444]"} />
      <StatCell main={stats.eficiencia || 0} color="text-[#fbbf24]" isBold={true} />

      <td className="text-center bg-white/[0.04] px-3 font-oswald italic">
        <span className="text-xl font-black text-white leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">
          <AnimatedNumber value={stats.puntos || 0} />
        </span>
      </td>
    </motion.tr>
  );
};

export default function ScoreboardPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const {
    partido, equipoLocal, equipoVisitante,
    jugadoresLocal, jugadoresVisitante,
    getStats, parciales
  } = usePartido(id, { pollInterval: 2000, withParciales: true });

  const getScoreToInterval = (equipoId, q, i) => {
    let total = 0;
    let hasData = false;
    if (!parciales) return '';
    parciales.forEach(p => {
      if (p.cuarto < q || (p.cuarto === q && p.intervalo <= i)) {
        total += (equipoId === partido.local_id ? p.pts_local : p.pts_visitante);
        if (p.pts_local > 0 || p.pts_visitante > 0 || (p.cuarto === q && p.intervalo === i)) hasData = true;
      }
    });
    return hasData ? total : '';
  };

  if (!partido) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center font-sans relative overflow-hidden">
        <div className="scanline" />
        <div className="text-center z-10 p-12 bg-[#111] border border-white/5 shadow-2xl max-w-sm w-full">
          <Server size={40} className="text-[#0078D4] animate-pulse mx-auto mb-8" />
          <h1 className="text-2xl font-black italic tracking-tighter text-white mb-2 uppercase">SESSION <span className="text-[#0078D4]">PENDING</span></h1>
          <p className="text-[#444] text-[9px] font-black tracking-[0.4em] mb-10 uppercase">Waiting for Data Stream</p>
          <Link to="/admin" className="text-[10px] font-black text-[#666] hover:text-[#0078D4] transition-colors tracking-widest uppercase border-b border-white/5 pb-1">BACK_TO_HOME</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#070707] flex flex-col font-sans text-white overflow-hidden relative">
      <div className="scanline" />

      {/* ── HEADER ── */}
      <header className="h-[9vh] bg-[#111111] border-b border-white/5 flex items-center px-8 justify-between z-30 shadow-2xl flex-shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-[#0078D4]" />
            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">FIBA <span className="text-[#0078D4]">STATS</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">PERIOD</span>
            <div className="bg-[#0078D4]/5 border border-[#0078D4]/20 text-[#0078D4] font-oswald font-black text-2xl w-16 h-8 flex items-center justify-center">P{partido.cuarto_actual}</div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">CLOCK</span>
            <div className="bg-black/40 border border-white/5 text-white font-oswald text-2xl min-w-[100px] h-8 flex items-center justify-center tabular-nums">
              {partido.estado === 'en_juego' ? '10:00' : 'FINAL'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-right flex flex-col items-end">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-1">LOCAL_ID</span>
            <span className="text-[12px] font-black text-[#333] tracking-widest font-mono">0x{partido.id.toString(16).toUpperCase()}</span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT (SCROLLABLE) ── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-12 pb-10">

        {/* INTERVAL SCORES TABLE */}
        <section className="max-w-[1600px] mx-auto mb-4 bg-[#111] p-4 border border-white/5 shadow-inner">
          <div className="flex flex-col lg:flex-row items-center gap-6 relative z-10">
            <div className="text-[12px] font-black uppercase tracking-wide border-l-4 border-l-[#0078D4] pl-3 py-1 flex-shrink-0">
              Resultado por 5<br />intervalo de minutos
            </div>

            <div className="flex gap-4 items-end text-[14px] font-mono font-bold text-center overflow-x-auto w-full pb-2">
              <div className="flex flex-col mb-1.5 text-right pr-2 uppercase pb-[1px]">
                <span className="h-6 flex items-center justify-end text-white/50">{equipoLocal?.abrev}</span>
                <span className="h-6 flex items-center justify-end text-white/50">{equipoVisitante?.abrev}</span>
              </div>
              {[1, 2, 3, 4].map(q => (
                <div key={q} className="flex flex-col items-center">
                  <span className="mb-1 text-[12px] text-white/60">C{q}</span>
                  <table className="border-collapse border border-white/20">
                    <tbody>
                      <tr className="h-6">
                        <td className="w-10 border border-white/20 bg-white/5 text-white">{getScoreToInterval(partido.local_id, q, 1)}</td>
                        <td className="w-10 border border-white/20 text-white font-black">{getScoreToInterval(partido.local_id, q, 2)}</td>
                      </tr>
                      <tr className="h-6">
                        <td className="w-10 border border-white/20 bg-white/5 text-white">{getScoreToInterval(partido.visitante_id, q, 1)}</td>
                        <td className="w-10 border border-white/20 text-white font-black">{getScoreToInterval(partido.visitante_id, q, 2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOCAL TEAM BOX SCORE */}
        <section className="max-w-[1600px] mx-auto space-y-4">
          <div className="flex items-center justify-between bg-[#121212] h-16 px-10 border-l-4 border-l-[#0078D4] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-[#0078D4] blur-[120px] opacity-[0.05]" />
            <h2 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter z-10">{equipoLocal?.nombre}</h2>
            <div className="text-5xl lg:text-6xl font-oswald font-black text-[#0078D4] italic z-10"><AnimatedNumber value={partido.pts_local} /></div>
          </div>

          <div className="bg-[#0f1011] border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[1300px]">
                <thead className="bg-[#141414] border-b border-white/10 uppercase font-black text-[#333] text-[8px] tracking-widest italic">
                  <tr>
                    <th className="py-2.5 w-8 text-center border-r border-white/5">#</th>
                    <th className="py-2.5 px-3 border-r border-white/5 min-w-[200px]">PLAYER</th>
                    <th className="py-2.5 text-center border-r border-white/5">MIN</th>
                    <th className="py-2.5 text-center border-r border-white/5 bg-white/[0.02] text-[#555]">FG (M/A %)</th>
                    <th className="py-2.5 text-center border-r border-white/5">2P (M/A %)</th>
                    <th className="py-2.5 text-center border-r border-white/5">3P (M/A %)</th>
                    <th className="py-2.5 text-center border-r border-white/5 text-[#555]">FT (M/A %)</th>
                    <th className="py-2.5 text-center border-r border-white/5 px-4 bg-white/[0.01]">REBOUNDS (OR DR TO)</th>
                    <th className="py-2.5 text-center border-r border-white/5">AS</th>
                    <th className="py-2.5 text-center border-r border-white/5">TO</th>
                    <th className="py-2.5 text-center border-r border-white/5">ST</th>
                    <th className="py-2.5 text-center border-r border-white/5">BS (F/A)</th>
                    <th className="py-2.5 text-center border-r border-white/5">PF (C/D)</th>
                    <th className="py-2.5 text-center border-r border-white/5">+/-</th>
                    <th className="py-2.5 text-center border-r border-white/5">EFF</th>
                    <th className="py-2.5 text-center bg-[#0078D4]/5 text-[#0078D4] text-[10px] w-16">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {jugadoresLocal.map((j, i) => <PlayerRow key={j.id} player={j} stats={getStats(j.id)} colorPrincipal={equipoLocal?.color_principal} index={i} />)}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* VISITANT TEAM BOX SCORE */}
        <section className="max-w-[1600px] mx-auto space-y-4">
          <div className="flex items-center justify-between bg-[#121212] h-16 px-10 border-r-4 border-r-[#0078D4] shadow-xl relative overflow-hidden flex-row-reverse">
            <div className="absolute top-0 left-0 w-64 h-full bg-[#0078D4] blur-[120px] opacity-[0.05]" />
            <h2 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter z-10 text-right">{equipoVisitante?.nombre}</h2>
            <div className="text-5xl lg:text-6xl font-oswald font-black text-[#0078D4] italic z-10"><AnimatedNumber value={partido.pts_visitante} /></div>
          </div>

          <div className="bg-[#0f1011] border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[1300px]">
                <thead className="bg-[#141414] border-b border-white/10 uppercase font-black text-[#333] text-[8px] tracking-widest italic">
                  <tr>
                    <th className="py-2.5 w-8 text-center border-r border-white/5">#</th>
                    <th className="py-2.5 px-3 border-r border-white/5 min-w-[200px]">PLAYER</th>
                    <th className="py-2.5 text-center border-r border-white/5">MIN</th>
                    <th className="py-2.5 text-center border-r border-white/5 bg-white/[0.02] text-[#555]">FG (M/A %)</th>
                    <th className="py-2.5 text-center border-r border-white/5">2P (M/A %)</th>
                    <th className="py-2.5 text-center border-r border-white/5">3P (M/A %)</th>
                    <th className="py-2.5 text-center border-r border-white/5 text-[#555]">FT (M/A %)</th>
                    <th className="py-2.5 text-center border-r border-white/5 px-4 bg-white/[0.01]">REBOUNDS (OR DR TO)</th>
                    <th className="py-2.5 text-center border-r border-white/5">AS</th>
                    <th className="py-2.5 text-center border-r border-white/5">TO</th>
                    <th className="py-2.5 text-center border-r border-white/5">ST</th>
                    <th className="py-2.5 text-center border-r border-white/5">BS (F/A)</th>
                    <th className="py-2.5 text-center border-r border-white/5">PF (C/D)</th>
                    <th className="py-2.5 text-center border-r border-white/5">+/-</th>
                    <th className="py-2.5 text-center border-r border-white/5">EFF</th>
                    <th className="py-2.5 text-center bg-[#0078D4]/5 text-[#0078D4] text-[10px] w-16">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {jugadoresVisitante.map((j, i) => <PlayerRow key={j.id} player={j} stats={getStats(j.id)} colorPrincipal={equipoVisitante?.color_principal} index={i} />)}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* TECHNICAL GLOSSARY / LEGEND (Matching official sheet) */}
        <section className="max-w-[1600px] mx-auto bg-[#111] p-6 border border-white/5 shadow-inner">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle size={14} className="text-[#0078D4]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#444]">TECHNICAL_LEGEND_DIRECTORY</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-12 gap-y-4">
            <div className="space-y-3">
              <LegendItem abrev="MIN" desc="Minutes Played" />
              <LegendItem abrev="FG" desc="Field Goals" />
              <LegendItem abrev="2P" desc="2-Point Shots" />
            </div>
            <div className="space-y-3">
              <LegendItem abrev="3P" desc="3-Point Shots" />
              <LegendItem abrev="FT" desc="Free Throws" />
              <LegendItem abrev="M/A" desc="Made / Attempted" />
            </div>
            <div className="space-y-3">
              <LegendItem abrev="OR" desc="Offensive Rebounds" />
              <LegendItem abrev="DR" desc="Defensive Rebounds" />
              <LegendItem abrev="TOT" desc="Total Rebounds" />
            </div>
            <div className="space-y-3">
              <LegendItem abrev="AS" desc="Assists" />
              <LegendItem abrev="TO" desc="Turnovers" />
              <LegendItem abrev="ST" desc="Steals" />
            </div>
            <div className="space-y-3">
              <LegendItem abrev="BS" desc="Blocked Shots" />
              <LegendItem abrev="BA" desc="Blocks Against" />
              <LegendItem abrev="PF" desc="Personal Fouls" />
            </div>
            <div className="space-y-3">
              <LegendItem abrev="FD" desc="Fouls Drawn" />
              <LegendItem abrev="EFF" desc="Efficiency" />
              <LegendItem abrev="PTS" desc="Total Points" />
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER STATUS ── */}
      <footer className="h-8 bg-[#111] border-t border-white/5 flex items-center px-8 justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[#444]">PROTO_STREAM: ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Info size={12} className="text-[#333]" />
          <span className="text-[9px] font-bold italic tracking-[0.2em] text-[#222] uppercase">OFFICIAL FIBA STATS INTERFACE</span>
        </div>
      </footer>
    </div>
  );
}

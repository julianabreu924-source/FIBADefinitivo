import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { usePartido } from '../hooks/usePartido'
import AnimatedNumber from '../components/AnimatedNumber'

const pad = (n) => String(n).padStart(2, '0')
const fmt = (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`

const TeamPanel = memo(({ nombre, puntos, color = '#0078D4', side = 'left' }) => {
  const isLeft = side === 'left'
  return (
    <div
      className="flex-1 flex flex-col justify-between h-full px-12 py-10 relative overflow-hidden"
      style={{ borderLeft: isLeft ? `6px solid ${color}` : 'none', borderRight: !isLeft ? `6px solid ${color}` : 'none' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at ${isLeft ? '0% 100%' : '100% 100%'}, ${color}18 0%, transparent 65%)` }}
      />
      <div className={`relative z-10 ${isLeft ? 'text-left' : 'text-right'}`}>
        <p className="text-[11px] font-black tracking-[0.5em] text-white/20 uppercase mb-2">
          {isLeft ? 'LOCAL' : 'VISITANTE'}
        </p>
        <h2 className="text-[3.8vw] font-black uppercase leading-none tracking-tight" style={{ color }}>
          {nombre}
        </h2>
      </div>
      <div className={`relative z-10 ${isLeft ? 'text-left' : 'text-right'}`}>
        <div
          className="font-black leading-none tabular-nums"
          style={{ fontSize: 'clamp(100px, 22vw, 280px)', color: 'white', textShadow: `0 0 120px ${color}55`, fontVariantNumeric: 'tabular-nums' }}
        >
          <AnimatedNumber value={puntos} />
        </div>
      </div>
    </div>
  )
})

const CenterHUD = memo(({ partido }) => {
  const isLive = partido.estado === 'en_juego'
  const isFinal = partido.estado === 'finalizado'
  return (
    <div className="flex flex-col items-center justify-between py-10 px-4 min-w-[220px] z-10 relative">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[9px] font-black tracking-[0.6em] text-white/15 uppercase">FIBA STATS</span>
        <div className="w-12 h-px bg-white/10" />
      </div>
      <div className="flex flex-col items-center gap-6">
        {isLive && (
          <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-4 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] text-emerald-400 uppercase">EN VIVO</span>
          </div>
        )}
        {isFinal && (
          <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 rounded-full">
            <span className="text-[10px] font-black tracking-[0.3em] text-amber-400 uppercase">FINAL</span>
          </div>
        )}
        {!isLive && !isFinal && (
          <div className="flex items-center gap-2 border border-white/10 px-4 py-1.5 rounded-full">
            <span className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">PENDIENTE</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black tracking-[0.5em] text-white/20 uppercase mb-1">PER.</span>
          <div className="font-black leading-none tabular-nums" style={{ fontSize: 'clamp(56px,8vw,96px)', color: '#FFB900' }}>
            {partido.cuarto_actual}
          </div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black tracking-[0.5em] text-white/20 uppercase mb-1">TIEMPO</span>
          <div className="font-black leading-none tabular-nums tracking-tighter" style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: 'white' }}>
            {fmt(partido.tiempo_restante)}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        {partido.competicion && (
          <span className="text-[9px] font-black tracking-widest text-white/20 uppercase text-center max-w-[180px] leading-relaxed">
            {partido.competicion}
          </span>
        )}
        <div className="w-12 h-px bg-white/10" />
      </div>
    </div>
  )
})

const ParcialesBar = memo(({ parciales, partido }) => {
  const quarters = useMemo(() => {
    return [1, 2, 3, 4].map(q => {
      const p = parciales?.find(p => p.cuarto === q && p.intervalo === 2)
      const isActive = partido.cuarto_actual === q
      const hasData = !!p
      return { q, local: p?.pts_local ?? null, visitor: p?.pts_visitante ?? null, isActive, hasData }
    })
  }, [parciales, partido.cuarto_actual])

  const totalLocal = quarters.reduce((s, q) => s + (q.local ?? 0), 0)
  const totalVisitor = quarters.reduce((s, q) => s + (q.visitor ?? 0), 0)

  return (
    <div className="w-full border-t border-white/[0.06] bg-white/[0.01]">
      <div className="max-w-5xl mx-auto flex items-stretch divide-x divide-white/[0.06]">
        <div className="flex flex-col justify-center px-8 py-4 min-w-[100px]">
          <span className="text-[8px] font-black tracking-[0.5em] text-white/20 uppercase">Parciales</span>
        </div>
        {quarters.map(({ q, local, visitor, isActive, hasData }) => (
          <div key={q} className={`flex flex-col items-center py-4 px-6 transition-colors min-w-[90px] ${isActive ? 'bg-white/[0.03]' : ''}`}>
            <span className={`text-[8px] font-black tracking-[0.5em] uppercase mb-3 ${isActive ? 'text-[#0078D4]' : 'text-white/15'}`}>
              C{q}
            </span>
            {hasData ? (
              <div className="flex gap-3 font-black tabular-nums" style={{ fontSize: '18px' }}>
                <span className={isActive ? 'text-white' : 'text-white/40'}>{local}</span>
                <span className="text-white/10">—</span>
                <span className={isActive ? 'text-white' : 'text-white/40'}>{visitor}</span>
              </div>
            ) : (
              <div className="flex gap-3 font-black" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.08)' }}>
                <span>—</span><span style={{ color: 'rgba(255,255,255,0.04)' }}>—</span><span>—</span>
              </div>
            )}
          </div>
        ))}
        <div className="flex flex-col items-center py-4 px-8 bg-white/[0.02] min-w-[110px]">
          <span className="text-[8px] font-black tracking-[0.5em] text-white/20 uppercase mb-3">TOTAL</span>
          <div className="flex gap-3 font-black tabular-nums text-white" style={{ fontSize: '18px' }}>
            <span>{totalLocal}</span>
            <span className="text-white/10">—</span>
            <span>{totalVisitor}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default function PublicScoreboardPage() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const { partido, equipoLocal, equipoVisitante, parciales } = usePartido(id, {
    pollInterval: 2500,
    withParciales: true,
  })

  if (!partido) {
    return (
      <div className="h-screen bg-[#080808] flex flex-col items-center justify-center gap-6 select-none">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        <span className="text-[10px] font-black tracking-[0.8em] text-white/20 uppercase">Conectando...</span>
      </div>
    )
  }

  const colorLocal = equipoLocal?.color_principal || '#0078D4'
  const colorVisitante = equipoVisitante?.color_principal || '#ef4444'

  return (
    <div className="h-screen w-screen bg-[#080808] flex flex-col font-sans text-white overflow-hidden select-none">
      <main className="flex-1 flex items-stretch overflow-hidden">
        <motion.div className="flex-1 flex" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
          <TeamPanel nombre={equipoLocal?.nombre || 'LOCAL'} puntos={partido.pts_local} color={colorLocal} side="left" />
        </motion.div>
        <div className="w-px bg-white/[0.05] self-stretch" />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <CenterHUD partido={partido} />
        </motion.div>
        <div className="w-px bg-white/[0.05] self-stretch" />
        <motion.div className="flex-1 flex flex-row-reverse" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
          <TeamPanel nombre={equipoVisitante?.nombre || 'VISITANTE'} puntos={partido.pts_visitante} color={colorVisitante} side="right" />
        </motion.div>
      </main>
      <ParcialesBar parciales={parciales} partido={partido} />
      <footer className="h-8 bg-black/40 border-t border-white/[0.04] flex items-center justify-between px-10">
        <span className="text-[8px] font-black tracking-[0.5em] text-white/10 uppercase">FIBA Stats System</span>
        {partido.cancha && <span className="text-[8px] font-black tracking-[0.4em] text-white/10 uppercase">{partido.cancha}</span>}
        <span className="text-[8px] font-black tracking-[0.5em] text-white/10 uppercase">
          {partido.estado === 'en_juego' ? '● En juego' : partido.estado === 'finalizado' ? 'Final' : 'Pendiente'}
        </span>
      </footer>
    </div>
  )
}

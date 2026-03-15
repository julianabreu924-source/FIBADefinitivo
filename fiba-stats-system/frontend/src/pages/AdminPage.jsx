import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Trophy, FileText, Settings, Plus, Trash2, Edit3, Save, X,
  ChevronRight, Database, Shield, Layout, Command, Search, Filter,
  Download, Printer, Info, Clock, Terminal, CheckCircle2, AlertCircle, Activity, Box
} from 'lucide-react'
import {
  getEquipos, crearEquipo, eliminarEquipo,
  getJugadores, crearJugador, eliminarJugador,
  getPartidos, crearPartido, eliminarPartido
} from '../services/api'
import ConfirmModal from '../components/ConfirmModal'
import ReportesSection from '../components/ReportesSection'
import HistoryControls from '../components/HistoryControls'
import PrintableReport from '../components/PrintableReport'
import { getResumenPartido, getParciales, getEquipo } from '../services/api'
import { Link } from 'react-router-dom'

// --- Componentes de Alta Densidad ---

const ControlLabel = ({ children }) => <label className="control-label uppercase tracking-[0.1em] text-[10px] mb-2">{children}</label>

const ToolHeader = ({ title, icon: Icon, actions }) => (
  <header className="h-10 px-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
    <div className="flex items-center gap-3">
      {Icon && <Icon size={14} className="text-[#0078D4]" />}
      <span className="text-[11px] font-bold uppercase tracking-widest text-[#888]">{title}</span>
    </div>
    <div className="flex items-center gap-1">
      {actions}
    </div>
  </header>
)

const PropertyField = ({ label, children }) => (
  <div className="flex flex-col gap-1.5 p-4 border-b border-white/[0.03]">
    <ControlLabel>{label}</ControlLabel>
    {children}
  </div>
)

export default function AdminPage() {
  const [vista, setVista] = useState('equipos')
  const [equipos, setEquipos] = useState([])
  const [jugadores, setJugadores] = useState([])
  const [partidos, setPartidos] = useState([])
  const [equipoSel, setEquipoSel] = useState(null)
  const [toast, setToast] = useState('')
  const [modal, setModal] = useState({ show: false, title: '', msg: '', onConfirm: null })

  // Formularios
  const [fE, setFE] = useState({ nombre: '', abrev: '', entrenador: '', color_principal: '#0078D4' })
  const [fJ, setFJ] = useState({ nombre: '', numero: '', posicion: 'PG', es_titular: false })
  const [fP, setFP] = useState({ local_id: '', visitante_id: '', competicion: '', cancha: '', arbitro_principal: '', arbitro_asistente1: '', arbitro_asistente2: '' })

  // Estado para impresión
  const [printData, setPrintData] = useState(null)
  const [isPrinting, setIsPrinting] = useState(false)

  const cargarEquipos = async () => { try { const r = await getEquipos(); setEquipos(r.data) } catch (err) { console.error(err) } }
  const cargarPartidos = async () => { try { const r = await getPartidos(); setPartidos(r.data) } catch (err) { console.error(err) } }
  const cargarJugadores = async (id) => { try { const r = await getJugadores(id); setJugadores(r.data) } catch (err) { console.error(err) } }

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault()
    document.addEventListener('contextmenu', handleContextMenu)
    cargarEquipos()
    cargarPartidos()
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  // Handlers
  const handleCrearEquipo = async (e) => {
    e.preventDefault()
    if (!fE.nombre || !fE.abrev) return flash('Faltan campos obligatorios.')
    try { await crearEquipo(fE); setFE({ nombre: '', abrev: '', entrenador: '', color_principal: '#0078D4' }); cargarEquipos(); flash('Equipo registrado con éxito.') }
    catch (e) { flash('Error al crear equipo.') }
  }

  const handleBorrarEquipo = (id) => setModal({
    show: true, title: 'Destruir Nodo de Datos', msg: 'Esto eliminará todos los registros de jugadores y el historial de partidos. ¿Continuar?',
    onConfirm: async () => { try { await eliminarEquipo(id); cargarEquipos(); flash('Nodo purgado.') } catch (e) { flash('Fallo en la purga.') } }
  })

  const handleCrearJugador = async (e) => {
    e.preventDefault()
    if (!equipoSel || !fJ.nombre || !fJ.numero) return flash('Selección/Entrada requerida.')
    try { await crearJugador({ ...fJ, equipo_id: equipoSel.id }); setFJ({ nombre: '', numero: '', posicion: 'PG', es_titular: false }); cargarJugadores(equipoSel.id); flash('Activo registrado.') }
    catch (e) { flash('Error de registro de activo.') }
  }

  const handleBorrarJugador = (jid) => setModal({
    show: true, title: 'Descomisionar Activo', msg: '¿Eliminar permanentemente al jugador de la nómina?',
    onConfirm: async () => { try { await eliminarJugador(jid); cargarJugadores(equipoSel.id); flash('Activo descomisionado.') } catch (e) { flash('Error.') } }
  })

  const handleCrearPartido = async (e) => {
    e.preventDefault()
    if (!fP.local_id || !fP.visitante_id) return flash('Faltan nodos de red.')
    try { await crearPartido(fP); setFP({ local_id: '', visitante_id: '', competicion: '', cancha: '', arbitro_principal: '', arbitro_asistente1: '', arbitro_asistente2: '' }); cargarPartidos(); flash('Servicio inicializado.') }
    catch (e) { flash('Error de enlace.') }
  }

  const handleBorrarPartido = (pid) => setModal({
    show: true, title: 'Terminar Sesión', msg: '¿Borrar registro de partido? Esta acción es irreversible.',
    onConfirm: async () => { try { await eliminarPartido(pid); cargarPartidos(); flash('Sesión terminada.') } catch (e) { flash('Error.') } }
  })

  const handleImprimirPartido = async (p) => {
    try {
      flash('Preparando documento maestro...')
      const [resumen, parciales, loc, vis] = await Promise.all([
        getResumenPartido(p.id),
        getParciales(p.id),
        getEquipo(p.local_id),
        getEquipo(p.visitante_id)
      ])

      setPrintData({
        partido: p,
        resumen: resumen.data,
        parciales: parciales.data,
        equipoLocal: loc.data,
        equipoVisitante: vis.data
      })

      setIsPrinting(true)

      // Pequeño delay para dejar que el DOM de impresión se renderice
      setTimeout(() => {
        window.print()
        setIsPrinting(false)
        setPrintData(null)
      }, 500)
    } catch (e) {
      console.error(e)
      flash('Error al generar reporte.')
    }
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      {/* 1. Navegación Top (Estilo Fluent) */}
      <header className="region-top-nav px-6">
        {/* Brand/Logo */}
        <div className="flex items-center gap-4 mr-10">
          <div className="w-8 h-8 rounded-sm bg-[#0078D4] flex items-center justify-center shadow-[0_0_15px_rgba(0,120,212,0.4)] flex-shrink-0">
            <Box size={18} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] italic leading-none">FIBA <span className="text-[#0078D4]">OS</span></h2>
            <p className="text-[8px] font-black text-[#444] tracking-[0.2em] mt-1">v3.0.5 MODO_EXPAND</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2">
          <button onClick={() => setVista('equipos')} className={`nav-item ${vista === 'equipos' ? 'active' : ''}`}>
            <Layout size={14} /> Equipos y Nóminas
          </button>
          <button onClick={() => setVista('partidos')} className={`nav-item ${vista === 'partidos' ? 'active' : ''}`}>
            <Terminal size={14} /> Sockets en Vivo
          </button>
          <button onClick={() => setVista('reportes')} className={`nav-item ${vista === 'reportes' ? 'active' : ''}`}>
            <FileText size={14} /> Centro de Analíticas
          </button>
        </nav>

        <div className="h-6 w-px bg-white/5 mx-8" />

        {/* Global Status Area */}
        <div className="flex-1 flex items-center gap-6 overflow-hidden">
          <div className="flex items-center gap-2 opacity-40">
            <Shield size={12} className="text-[#0078D4]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] hidden xl:inline">PROD_ACTIVE</span>
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-[#0078D4]/10 border border-[#0078D4]/30 px-4 py-1.5 rounded-sm shadow-[0_0_20px_rgba(0,120,212,0.05)]"
              >
                <div className="w-1 h-1 rounded-full bg-[#0078D4] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#0078D4] whitespace-nowrap">{toast}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile / System Info */}
        <div className="flex items-center gap-5 pl-8 border-l border-white/5">
          <div className="text-right hidden lg:block">
            <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Admin_01</p>
            <p className="text-[7px] text-[#444] font-black tracking-[0.3em]">RELÉ_SEGURO</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[11px] font-black italic shadow-xl group cursor-pointer hover:border-[#0078D4]/50 transition-colors">
            <div className="w-7 h-7 rounded-full bg-[#0078D4]/20 flex items-center justify-center text-[#0078D4]">A</div>
          </div>
        </div>
      </header>

      {/* 2. Región Principal (Expandida) */}
      <main className="region-main">
        {/* Barra de Contexto (Opcional/Dinámica) */}
        <div className="h-1 bg-white/[0.02] w-full" />

        {/* Viewport de Canvas */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">

            {/* SECCIÓN: EQUIPOS */}
            {vista === 'equipos' && (
              <motion.div key="eq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-12 h-full">
                {/* Panel de Propiedades Lateral (Scroll Independiente) */}
                <div className="col-span-12 lg:col-span-4 xl:col-span-3 border-r border-white/5 p-6 space-y-6 bg-white/[0.01] overflow-y-auto custom-scrollbar">
                  <ToolHeader title="Controlador de Activos" icon={Layout} />

                  <form onSubmit={handleCrearEquipo} className="grid-panel bg-[#121212]">
                    <div className="grid-panel-header italic border-b-[#0078D4]/20">REGISTRAR_ENTIDAD</div>
                    <div className="divide-y divide-white/[0.03]">
                      <PropertyField label="Designación Formal">
                        <input className="control-input w-full" value={fE.nombre} onChange={e => setFE({ ...fE, nombre: e.target.value })} placeholder="Nombre de la Institución..." />
                      </PropertyField>
                      <PropertyField label="ID Técnico / Tag">
                        <input className="control-input w-full font-mono text-center" maxLength={3} value={fE.abrev} onChange={e => setFE({ ...fE, abrev: e.target.value })} placeholder="000" />
                      </PropertyField>
                      <PropertyField label="Entrenador al Mando">
                        <input className="control-input w-full" value={fE.entrenador} onChange={e => setFE({ ...fE, entrenador: e.target.value })} placeholder="Nombre Oficial..." />
                      </PropertyField>
                      <PropertyField label="Identidad Visual (Hex)">
                        <div className="flex items-center gap-4">
                          <input type="color" className="w-12 h-10 bg-transparent border-0 cursor-pointer rounded-sm" value={fE.color_principal} onChange={e => setFE({ ...fE, color_principal: e.target.value })} />
                          <span className="text-[11px] font-mono text-[#444] font-black">{fE.color_principal}</span>
                        </div>
                      </PropertyField>
                    </div>
                    <div className="p-4 bg-white/[0.03] border-t border-white/5">
                      <button type="submit" className="control-button control-button-accent w-full h-11 text-[11px] font-black tracking-[0.2em]">INICIALIZAR_NODO</button>
                    </div>
                  </form>

                  {equipoSel && (
                    <motion.form initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onSubmit={handleCrearJugador} className="grid-panel bg-[#121212] border-t-2 border-t-[#0078D4]">
                      <div className="grid-panel-header bg-[#0078D4]/10 flex justify-between gap-4">
                        <span className="text-[#0078D4] truncate text-[10px]">CARGAR_ACTIVO: {equipoSel.abrev}</span>
                        <button onClick={() => setEquipoSel(null)} type="button" className="flex-shrink-0"><X size={14} className="hover:text-white transition-colors" /></button>
                      </div>
                      <div className="divide-y divide-white/[0.03]">
                        <PropertyField label="Nombre Completo del Activo">
                          <input className="control-input w-full" value={fJ.nombre} onChange={e => setFJ({ ...fJ, nombre: e.target.value })} />
                        </PropertyField>
                        <div className="grid grid-cols-2">
                          <div className="border-r border-white/[0.03]">
                            <PropertyField label="Nodo #">
                              <input className="control-input w-full text-center" type="number" value={fJ.numero} onChange={e => setFJ({ ...fJ, numero: e.target.value })} />
                            </PropertyField>
                          </div>
                          <PropertyField label="Clase">
                            <select className="control-input w-full" value={fJ.posicion} onChange={e => setFJ({ ...fJ, posicion: e.target.value })}>
                              {['PG', 'SG', 'SF', 'PF', 'C'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </PropertyField>
                        </div>
                        <div className="flex items-center justify-between p-4 px-6 bg-white/[0.02]">
                          <span className="text-[10px] font-black text-[#555] uppercase tracking-[0.3em]">UNIDAD_PRIMARIA</span>
                          <input type="checkbox" checked={fJ.es_titular} onChange={e => setFJ({ ...fJ, es_titular: e.target.checked })} className="w-4 h-4 accent-[#0078D4]" />
                        </div>
                      </div>
                      <div className="p-4 bg-white/[0.03]">
                        <button type="submit" className="control-button control-button-accent w-full h-11 text-[11px] font-black tracking-widest shadow-[0_4px_20px_rgba(0,120,212,0.2)]">DESPLEGAR_UNIDAD</button>
                      </div>
                    </motion.form>
                  )}
                </div>

                {/* Explorador de Datos (Estructura de Header Fijo) */}
                <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col h-full overflow-hidden">
                  <div className="px-8 lg:px-12 pt-12 pb-8 flex-shrink-0">
                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between underline decoration-white/5 underline-offset-[20px] gap-8">
                      <div>
                        <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-none">Base de Datos <span className="text-[#0078D4]">de Entidades</span></h2>
                        <p className="text-[11px] text-[#444] font-black tracking-[0.5em] uppercase mt-4">Registro Multi-Nodo / Aceleración de Hardware v2</p>
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex flex-col items-end mr-6 whitespace-nowrap">
                          <span className="text-[9px] font-black text-[#333] uppercase mb-1">Total de Activos</span>
                          <span className="text-3xl font-oswald font-black text-[#0078D4] leading-none">{equipos.length}</span>
                        </div>
                        <button className="control-button h-10 px-6 opacity-40 hover:opacity-100 whitespace-nowrap"><Search size={14} /> ESCRUTAR_DATOS</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar px-8 lg:px-12 pb-12">

                    <div className={equipoSel ? "flex flex-col gap-6" : "grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6"}>
                      {equipos
                        .filter(eq => !equipoSel || eq.id === equipoSel.id)
                        .map(eq => (
                          <div key={eq.id} className={`grid-panel group transition-all duration-500 ${equipoSel ? 'border-[#0078D4] bg-[#0c0c0c]' : 'hover:bg-[#1a1a1a]'}`}>
                            <div className="p-8 flex items-center justify-between bg-white/[0.005]">
                              <div className="flex items-center gap-6 overflow-hidden">
                                <div className="w-16 h-16 flex items-center justify-center font-oswald font-bold text-4xl border border-white/5 bg-black/40 rounded-sm group-hover:border-[#0078D4]/40 transition-colors shadow-inner flex-shrink-0" style={{ color: eq.color_principal }}>
                                  {eq.abrev}
                                </div>
                                <div className="flex flex-col gap-1 overflow-hidden">
                                  <h4 className="text-[16px] font-black uppercase tracking-widest text-[#ccc] group-hover:text-white transition-colors">{eq.nombre}</h4>
                                  <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold text-[#444] uppercase tracking-[0.2em] font-mono whitespace-nowrap">NODO_{eq.id.toString(36).toUpperCase()}</span>
                                    <div className="flex items-center gap-1.5 bg-[#0078D4]/10 px-2 py-0.5 rounded-sm flex-shrink-0">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#0078D4] animate-pulse" />
                                      <span className="text-[9px] font-black text-[#0078D4] uppercase">SYNC_OK</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className={`flex items-center gap-4 transition-all ${equipoSel ? '' : 'opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0'}`}>
                                {equipoSel ? (
                                  <button onClick={() => setEquipoSel(null)} className="control-button px-6 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black italic tracking-widest text-[10px]">
                                    <ChevronRight size={14} className="rotate-180" /> REGRESAR_AL_LISTADO
                                  </button>
                                ) : (
                                  <>
                                    <button onClick={() => { setEquipoSel(eq); cargarJugadores(eq.id) }} className="control-button w-14 h-14 p-0 border-[#0078D4]/30 hover:bg-[#0078D4] shadow-lg" title="Ver Nómina de Jugadores">
                                      <Users size={24} />
                                    </button>
                                    <button onClick={() => handleBorrarEquipo(eq.id)} className="control-button w-14 h-14 p-0 border-red-500/20 hover:border-red-500/50 hover:bg-red-500/20 text-red-500 shadow-lg" title="Eliminar Registro de Equipo">
                                      <Trash2 size={24} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {equipoSel?.id === eq.id && (
                              <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="bg-black/60 border-t border-white/5 p-8 overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left min-w-[600px]">
                                  <thead>
                                    <tr className="text-[11px] font-black text-[#444] uppercase tracking-[0.4em] border-b border-white/5">
                                      <th className="pb-6">TAG</th>
                                      <th className="pb-6">IDENT_ACTIVO</th>
                                      <th className="pb-6 text-center">POS</th>
                                      <th className="pb-6 text-center">ESTADO_UNIDAD</th>
                                      <th className="pb-6 text-right">ACCIÓN</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/[0.03]">
                                    {jugadores.map(j => (
                                      <tr key={j.id} className="text-[13px] font-bold hover:bg-[#0078D4]/5 transition-colors group/row">
                                        <td className="py-4 text-[#0078D4] font-oswald text-2xl italic">#{j.numero}</td>
                                        <td className="py-4 uppercase tracking-widest text-[#999] group-hover/row:text-white transition-colors">{j.nombre}</td>
                                        <td className="py-4 text-center text-[#555] font-mono">{j.posicion}</td>
                                        <td className="py-4 text-center">
                                          {j.es_titular ?
                                            <span className="text-[10px] font-black text-white bg-[#0078D4]/20 px-3 py-1 rounded-sm border border-[#0078D4]/40 uppercase italic">Op_Campo</span> :
                                            <span className="text-[10px] font-black text-[#333] uppercase">Standby</span>
                                          }
                                        </td>
                                        <td className="py-4 text-right"><button onClick={() => handleBorrarJugador(j.id)} className="text-red-500/20 hover:text-red-500 transition-colors p-2"><Trash2 size={18} /></button></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </motion.div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* VISTAS: CONTROL DE PARTIDOS */}
            {vista === 'partidos' && (
              <motion.div key="pt" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-12 h-full">
                <div className="col-span-12 lg:col-span-4 border-r border-white/5 p-8 bg-white/[0.005] overflow-y-auto custom-scrollbar">
                  <ToolHeader title="Inicializador de Hilos" icon={Terminal} />
                  <form onSubmit={handleCrearPartido} className="grid-panel mt-12 bg-[#121212] overflow-visible">
                    <div className="grid-panel-header italic tracking-[0.2em] border-b-[#0078D4]/40">ESTABLECER_ENLACE_SOCKET</div>
                    <div className="p-8 space-y-8">
                      <PropertyField label="Nodo Primario (Local)">
                        <select className="control-input w-full uppercase font-black tracking-widest" value={fP.local_id} onChange={e => setFP({ ...fP, local_id: e.target.value })}>
                          <option value="">Entidad Local Objetivo...</option>
                          {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>
                      </PropertyField>
                      <div className="flex justify-center -my-4 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-[#0078D4] flex items-center justify-center border-4 border-[#0a0a0a] shadow-2xl">
                          <Activity size={16} className="text-white animate-pulse" />
                        </div>
                      </div>
                      <PropertyField label="Nodo Secundario (Visitante)">
                        <select className="control-input w-full uppercase font-black tracking-widest" value={fP.visitante_id} onChange={e => setFP({ ...fP, visitante_id: e.target.value })}>
                          <option value="">Entidad Visitante Objetivo...</option>
                          {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>
                      </PropertyField>
                      <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">
                        <PropertyField label="Resolución de Competición">
                          <input className="control-input w-full" value={fP.competicion} onChange={e => setFP({ ...fP, competicion: e.target.value })} placeholder="Ej: Semifinal LNB..." />
                        </PropertyField>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <PropertyField label="Instancia de Servidor">
                          <input className="control-input w-full" value={fP.cancha} onChange={e => setFP({ ...fP, cancha: e.target.value })} placeholder="Estadio Principal..." />
                        </PropertyField>
                        <PropertyField label="Árbitro Principal">
                          <input className="control-input w-full" value={fP.arbitro_principal} onChange={e => setFP({ ...fP, arbitro_principal: e.target.value })} placeholder="Árbitro Principal..." />
                        </PropertyField>
                        <PropertyField label="Árbitro Asistente 1">
                          <input className="control-input w-full" value={fP.arbitro_asistente1} onChange={e => setFP({ ...fP, arbitro_asistente1: e.target.value })} placeholder="Primer Asistente..." />
                        </PropertyField>
                        <PropertyField label="Árbitro Asistente 2">
                          <input className="control-input w-full" value={fP.arbitro_asistente2} onChange={e => setFP({ ...fP, arbitro_asistente2: e.target.value })} placeholder="Segundo Asistente..." />
                        </PropertyField>
                      </div>
                    </div>
                    <div className="p-6 bg-white/[0.03]">
                      <button type="submit" className="control-button control-button-accent w-full h-16 text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_10px_40px_rgba(0,120,212,0.3)]"><Save size={18} /> INICIALIZAR_HANDSHAKE</button>
                    </div>
                  </form>
                </div>

                <div className="col-span-12 lg:col-span-8 p-16 overflow-y-auto custom-scrollbar">
                  <div className="mb-20">
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Archivos <span className="text-[#0078D4]">de Socket</span></h2>
                    <p className="text-[11px] text-[#444] font-black tracking-[0.5em] uppercase mt-6">Buffers Activos / Persistencia Histórica de Datos</p>
                  </div>

                  <div className="space-y-6">
                    {partidos.map(p => (
                      <div key={p.id} className="group relative bg-[#111] border border-white/5 hover:border-[#0078D4]/40 transition-all duration-500 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#0078D4] opacity-40 group-hover:opacity-100 transition-opacity" />

                        <div className="p-7 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 relative z-10">
                          {/* INFO BLOCK */}
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-4">
                              <span className={`text-[8px] font-black px-3 py-1 border rounded-sm tracking-[0.2em] uppercase
                                ${p.estado === 'en_juego' ? 'bg-[#0078D4]/10 border-[#0078D4]/40 text-[#0078D4] animate-pulse' : 'bg-[#1a1a1a] border-white/5 text-[#666]'}
                              `}>
                                {p.estado === 'en_juego' ? '● PROTOCOLO_VIVO' : 'ESTADO_ARCHIVADO'}
                              </span>
                              <span className="text-[9px] font-mono text-[#333] tracking-widest uppercase">ID: 0x{p.id.toString(16).toUpperCase()}</span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-xl font-black italic uppercase tracking-tight text-white group-hover:text-[#0078D4] transition-colors">
                                {p.local_nombre} <span className="text-[#222] italic mx-1">vs</span> {p.visitante_nombre}
                              </h4>
                              <div className="flex items-center gap-8">
                                <div className="flex flex-col">
                                  <span className="text-[7px] font-black text-[#222] uppercase mb-0.5">STATION_NODE</span>
                                  <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider">{p.cancha || 'ARENA_DEFAULT'}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[7px] font-black text-[#222] uppercase mb-0.5">DATE_REF</span>
                                  <span className="text-[10px] font-mono text-[#555] uppercase">{new Date(p.fecha).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ACTION BLOCK */}
                          <div className="flex items-center gap-2 w-full xl:w-auto">
                            <Link to={`/operacion/${p.id}`} className="flex-1 xl:flex-none h-11 px-8 bg-[#0078D4]/5 border border-[#0078D4]/20 hover:bg-[#0078D4] hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 group/btn shadow-lg">
                              <Shield size={14} className="group-hover/btn:rotate-12 transition-transform" /> CONSOLA
                            </Link>
                            <Link to={`/scoreboard?id=${p.id}`} className="w-11 h-11 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-[#444] hover:text-white group/mon shadow-lg" target="_blank">
                              <Layout size={16} className="group-hover/mon:scale-110 transition-transform" />
                            </Link>
                            <button onClick={() => handleImprimirPartido(p)} className="w-11 h-11 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0078D4]/20 hover:text-[#0078D4] transition-all text-[#444] group/print shadow-lg" title="Imprimir Hoja de Anotación Oficial">
                              <Printer size={16} className="group-hover/print:scale-110 transition-transform" />
                            </button>
                            <button onClick={() => handleBorrarPartido(p.id)} className="w-11 h-11 flex items-center justify-center text-[#222] hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 group/del shadow-lg">
                              <Trash2 size={16} className="group-hover/del:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>

                        {/* BACKGROUND EFFECT */}
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#0078D4] blur-[150px] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {vista === 'reportes' && (
              <motion.div
                key="rep"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col justify-center items-center p-8 lg:p-12 overflow-hidden"
              >
                <ReportesSection equipos={equipos} partidos={partidos} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Capa de Estado Global */}
        <footer className="status-bar px-10 h-8 flex items-center overflow-hidden">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
              <span className="text-[10px] uppercase font-black tracking-widest whitespace-nowrap">KERNEL_SISTEMA: LISTO</span>
            </div>
            <span className="text-white/10">|</span>
            <div className="flex items-center gap-2 text-[#777]">
              <span className="text-[10px] uppercase font-black tracking-widest whitespace-nowrap">CAPA_CIFRADO: TRUE</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-10 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-3 text-white/40">
              <Terminal size={12} />
              <span className="font-mono text-[10px]">FREQ_RE_LOOP: 60Hz</span>
            </div>
            <div className="flex items-center gap-3 text-white/40">
              <Clock size={12} />
              <span className="font-mono text-[10px] uppercase">{new Date().toLocaleTimeString()} UTC</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-[#0078D4] font-black italic tracking-widest text-[10px] whitespace-nowrap">MOTOR_FIBA_CORE_v3.0.4</span>
          </div>
        </footer>
      </main>

      {/* Overlays de Lógica */}
      <ConfirmModal
        show={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        onConfirm={() => { modal.onConfirm(); setModal({ ...modal, show: false }) }}
        title={modal.title}
        msg={modal.msg}
      />

      {/* CONTENEDOR DE IMPRESIÓN (OCULTO EN PANTALLA, VISIBLE EN PRINT) */}
      {isPrinting && printData && (
        <div id="print-container" className="hidden print:block fixed inset-0 bg-white z-[99999]">
          <PrintableReport
            partido={printData.partido}
            resumen={printData.resumen}
            parciales={printData.parciales}
            equipoLocal={printData.equipoLocal}
            equipoVisitante={printData.equipoVisitante}
          />
        </div>
      )}
    </div>
  )
}

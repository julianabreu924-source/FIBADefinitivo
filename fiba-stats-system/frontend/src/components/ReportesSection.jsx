import { motion } from 'framer-motion'
import { BarChart3, PieChart, TrendingUp, Download, Printer, FileText, Database, ShieldCheck, Activity, Terminal } from 'lucide-react'

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
    <div className="pro-tool-window p-8 bg-[#121212] flex flex-col gap-6 group hover:border-[#0078D4]/30 transition-all border-white/5 overflow-hidden">
        <div className="flex justify-between items-start gap-4">
            <div className="w-10 h-10 bg-black/40 border border-white/5 flex items-center justify-center rounded-sm shadow-inner group-hover:border-[#0078D4]/20 transition-colors flex-shrink-0">
                <Icon size={18} className={color || 'text-[#0078D4]'} />
            </div>
            <div className="text-right overflow-hidden">
                <p className="text-[10px] font-black text-[#444] uppercase tracking-[0.4em] mb-1 truncate">{label}</p>
                <span className="text-3xl font-oswald font-black text-white italic tabular-nums truncate block">{value}</span>
            </div>
        </div>
        <div className="flex items-center gap-3 mt-auto">
            <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#0078D4] w-2/3" />
            </div>
            <span className="text-[9px] font-black text-[#0078D4] uppercase tracking-widest whitespace-nowrap">{sub}</span>
        </div>
    </div>
)

export default function ReportesSection({ equipos, partidos }) {
    return (
        <div className="flex flex-col gap-8 max-w-[1500px] mx-auto w-full">

            {/* Analytics Module Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between border-b border-white/5 pb-12 gap-8">
                <div className="overflow-hidden">
                    <div className="flex items-center gap-4 mb-4">
                        <Terminal size={18} className="text-[#0078D4]" />
                        <span className="text-[10px] font-black text-[#555] uppercase tracking-[0.5em] italic truncate">Métricas_Motor_v3.0.4</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black italic tracking-tighter uppercase leading-none truncate">Consola de <span className="text-[#0078D4]">Inteligencia</span></h1>
                    <p className="text-[#444] text-[11px] font-black tracking-[0.6em] uppercase mt-6 max-w-2xl leading-relaxed">Persistencia de Datos Agregada y Proyección de Rendimiento</p>
                </div>

                <div className="flex gap-4 flex-shrink-0 w-full lg:w-auto">
                    <button className="control-button h-12 px-8 border-white/10 text-[#555] opacity-40 hover:opacity-100 flex-1 lg:flex-none"><Download size={16} /> EXPORTAR_DATOS_RAW</button>
                    <button className="control-button control-button-accent h-12 px-8 shadow-2xl flex-1 lg:flex-none"><Printer size={16} /> IMPRIMIR_EXPEDIENTE</button>
                </div>
            </div>

            {/* Grid Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard label="Total_Nodos" value={equipos.length} sub="+2 ENTIDADES_LOCALES" icon={Database} />
                <StatCard label="Sesiones_Red" value={partidos.length} sub="99.9% PERSISTENCIA" icon={Activity} color="text-green-500" />
                <StatCard label="Trafico_Promedio" value="1.2 GB" sub="REALTIME_ESTABLE" icon={BarChart3} color="text-purple-500" />
                <StatCard label="Handshakes_Seguridad" value="14.2k" sub="AES_256_ACTIVO" icon={ShieldCheck} color="text-amber-500" />
            </div>

            {/* Detailed Analytics Spline Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 pro-tool-window bg-white/[0.01] p-10 min-h-[400px] flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-12 gap-4">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <TrendingUp size={16} className="text-[#0078D4] flex-shrink-0" />
                            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#666] truncate">Historial_Carga_Rendimiento_Sistema</h4>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0078D4]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                        </div>
                    </div>

                    <div className="flex-1 flex items-end gap-1 px-4 min-h-[200px]">
                        {[40, 60, 45, 90, 65, 30, 85, 40, 50, 60, 75, 55, 95, 40, 60, 80, 45, 50].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.02, duration: 1 }}
                                className="flex-1 bg-gradient-to-t from-[#0078D4]/10 to-[#0078D4]/40 hover:to-[#0078D4] transition-all relative group"
                            >
                                <div className="absolute -top-10 left-1/2 -ms-4 bg-black/80 text-[#0078D4] text-[8px] font-bold px-2 py-1 border border-[#0078D4]/30 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    {h}%
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 pt-6 border-t border-white/5 text-[9px] font-black text-[#222] uppercase tracking-widest overflow-hidden gap-4">
                        <span className="truncate">BUFFER_TIEMPO_INIT: 00:00:00</span>
                        <span className="truncate">SYNC_TIMESTAMP_ACTUAL</span>
                    </div>
                </div>

                <div className="pro-tool-window bg-[#121212] p-10 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-4 mb-10 overflow-hidden">
                        <PieChart size={16} className="text-[#0078D4] flex-shrink-0" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#666] truncate">Ratio_Asignación_Nodos</h4>
                    </div>

                    <div className="flex-1 flex flex-col gap-6 justify-center">
                        {[
                            { label: 'Entidad_Local', val: '58%', color: 'bg-[#0078D4]' },
                            { label: 'Entidad_Remota', val: '32%', color: 'bg-white/20' },
                            { label: 'Caché_Bufferizada', val: '10%', color: 'bg-white/5' }
                        ].map((item, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic overflow-hidden">
                                    <span className="text-[#555] truncate pr-4">{item.label}</span>
                                    <span className="text-white flex-shrink-0">{item.val}</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/40 border border-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: item.val }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`h-full ${item.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/5">
                        <button className="control-button w-full h-12 text-[10px]"><FileText size={14} /> GENERAR_INFORME_PDF</button>
                    </div>
                </div>
            </div>

        </div>
    )
}

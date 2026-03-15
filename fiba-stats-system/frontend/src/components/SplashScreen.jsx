import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Cpu, Activity, Database, Server, Terminal, Lock, CheckCircle2, Box } from 'lucide-react'

const STEPS = [
    { id: 'SYS_BOOT', log: 'Inicializando secuencia de arranque...', progress: 10, icon: Box },
    { id: 'MEM_ALLOC', log: 'Asignando clústeres de memoria...', progress: 25, icon: Cpu },
    { id: 'FS_MOUNT', log: 'Montando volúmenes encriptados...', progress: 40, icon: Database },
    { id: 'NET_STACK', log: 'Estableciendo relé de sockets...', progress: 55, icon: Server },
    { id: 'SEC_AUDIT', log: 'Ejecutando protocolo de seguridad...', progress: 75, icon: Lock },
    { id: 'GPU_RENDER_INIT', log: 'Inicializando motor de renderizado Mica...', progress: 90, icon: Activity },
    { id: 'READY', log: 'Sistema operacional. Entorno: PRODUCCIÓN', progress: 100, icon: CheckCircle2 }
]

export default function SplashScreen({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [logs, setLogs] = useState([])
    const [isFinishing, setIsFinishing] = useState(false)

    useEffect(() => {
        if (currentStep < STEPS.length) {
            const step = STEPS[currentStep]
            const timer = setTimeout(() => {
                setLogs(prev => [...prev.slice(-12), {
                    time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    content: step.log,
                    id: step.id
                }])

                if (currentStep === STEPS.length - 1) {
                    setTimeout(() => {
                        setIsFinishing(true)
                        setTimeout(onComplete, 1200)
                    }, 800)
                } else {
                    setCurrentStep(prev => prev + 1)
                }
            }, currentStep === 0 ? 500 : Math.random() * 400 + 300)
            return () => clearTimeout(timer)
        }
    }, [currentStep, onComplete])

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isFinishing ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[10000] bg-[#0a0a0a] flex flex-col font-sans select-none overflow-hidden"
        >
            {/* Visual Infrastructure */}
            <div className="scanline" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,120,212,0.08)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />

            {/* Top Telemetry */}
            <header className="h-10 px-8 border-b border-white/5 flex items-center justify-between text-[10px] font-black text-[#444] tracking-[0.4em] uppercase">
                <div className="flex items-center gap-4">
                    <span>NÚCLEO_FIBA_v3.0.4</span>
                    <span className="text-white/10">|</span>
                    <span className="text-[#0078D4]">ESTADO: INICIALIZANDO</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>MEM_USO: {(Math.random() * 100 + 400).toFixed(1)} MB</span>
                    <span>FREQ: 3.80GHz</span>
                </div>
            </header>

            {/* Central Core */}
            <div className="flex-1 flex flex-col items-center justify-center relative px-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative mb-16"
                >
                    {/* Pulsing Aura */}
                    <div className="absolute inset-0 bg-[#0078D4] blur-[100px] opacity-20 animate-pulse rounded-full scale-150" />

                    <div className="relative z-10 w-24 h-24 bg-[#121212] border border-white/5 rounded-sm flex items-center justify-center shadow-2xl">
                        <Box size={48} className="text-[#0078D4] drop-shadow-[0_0_15px_rgba(0,120,212,0.6)]" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#0078D4] animate-ping rounded-full opacity-40" />
                    </div>
                </motion.div>

                <div className="w-full max-w-lg space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2">FIBA <span className="text-[#0078D4]">STATS</span> SYSTEM</h1>
                        <p className="text-[10px] text-[#555] font-black tracking-[0.5em] uppercase">Analíticas de Rendimiento de Grado Empresarial</p>
                    </div>

                    {/* Precision Progress Bar */}
                    <div className="relative">
                        <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#0078D4] shadow-[0_0_10px_#0078D4]"
                                initial={{ width: 0 }}
                                animate={{ width: `${STEPS[currentStep].progress}%` }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                        </div>
                        <div className="flex justify-between mt-3">
                            <span className="text-[9px] font-black text-[#444] uppercase tracking-widest italic">Progreso: {STEPS[currentStep].progress}%</span>
                            <span className="text-[9px] font-black text-[#0078D4] uppercase tracking-widest flex items-center gap-2">
                                <Activity size={10} className="animate-pulse" /> CARGA_DE_SISTEMA_ACTIVA
                            </span>
                        </div>
                    </div>

                    {/* Technical Console View */}
                    <div className="bg-black/40 border border-white/5 rounded-sm p-6 font-mono text-[11px] h-48 overflow-hidden shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
                        <div className="space-y-1.5 opacity-80">
                            {logs.map((log, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-4"
                                >
                                    <span className="text-[#444] font-black">[{log.time}]</span>
                                    <span className="text-[#666] uppercase tracking-wider"> &gt; </span>
                                    <span className={idx === logs.length - 1 ? "text-[#0078D4] font-bold" : "text-[#888]"}>
                                        {log.content}
                                    </span>
                                </motion.div>
                            ))}
                            <div className="w-2 h-4 bg-[#0078D4] animate-pulse inline-block align-middle ml-2" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Status Footer */}
            <footer className="h-12 px-8 border-t border-white/5 flex items-center justify-between text-[10px] font-black text-[#333] tracking-[0.4em] uppercase bg-black/20">
                <div className="flex items-center gap-10">
                    <div className="flex flex-col">
                        <span className="text-[8px] mb-1">ID_Estación</span>
                        <span className="text-white/20">OPERADOR_X1</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] mb-1">Arquitectura</span>
                        <span className="text-white/20">X64_HARD_MOD</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Lock size={12} className="text-[#1a1a1a]" />
                    <span>Integridad de Datos: 100.0% Verificado</span>
                </div>
            </footer>
        </motion.div>
    )
}

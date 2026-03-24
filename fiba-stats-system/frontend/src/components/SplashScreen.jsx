import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Cpu, Activity, Database, Server, Terminal,
    CheckCircle2, Box, Radio, Zap, Globe, Gauge, Layers, Activity as ActivityIcon
} from 'lucide-react';

const STEPS = [
    { id: 'BOOT', log: 'FIBA_NET_PROTOCOL_INIT...', progress: 10, color: '#0078D4' },
    { id: 'AUTH', log: 'AUTENTICANDO_CREDENCIALES_LNB...', progress: 25, color: '#0078D4' },
    { id: 'MEM', log: 'RESERVANDO_MEMORIA_ESTADÍSTICA...', progress: 40, color: '#00BCF2' },
    { id: 'DB', log: 'SINCRONIZANDO_RECO_HISTÓRICO...', progress: 55, color: '#107C10' },
    { id: 'SOCKET', log: 'ABRIENDO_PUERTO_SOCKET_LIVE...', progress: 70, color: '#FFB900' },
    { id: 'MDL', log: 'CARGANDO_MODELOS_DE_PREDICCIÓN...', progress: 85, color: '#D83B01' },
    { id: 'READY', log: 'SISTEMA_OPERACIONAL_LNB_ACTIVO', progress: 100, color: '#107C10' }
];

const BasketballIcon = ({ progress, color }) => (
    <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Aura dinámica según el color del paso actual */}
        <motion.div
            animate={{ backgroundColor: color }}
            className="absolute inset-0 blur-[100px] opacity-20"
        />

        <motion.div
            animate={{ rotate: 360, borderColor: color }}
            transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" } }}
            className="absolute inset-0 border-2 border-dashed rounded-full opacity-40 transition-colors duration-1000"
        />

        {/* Pelota de basket central */}
        <div className="relative w-28 h-28 bg-[#121212] rounded-full border border-white/10 overflow-hidden shadow-2xl">
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
                <path d="M0 50 H100 M50 0 V100 M15 15 Q50 50 85 85 M15 85 Q50 50 85 15" stroke="white" strokeWidth="1" fill="none" />
            </svg>

            {/* Llenado de progreso con color dinámico */}
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${progress}%`, backgroundColor: color }}
                className="absolute bottom-0 left-0 right-0 opacity-40 transition-colors duration-1000"
            />

            {/* Resplandor central */}
            <div className="absolute inset-0 bg-radial-gradient from-white/20 to-transparent pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center">
                <ActivityIcon size={32} className="text-white/20 animate-pulse" />
            </div>
        </div>

        <motion.div
            animate={{ scale: [1, 1.4], opacity: [0.3, 0], borderColor: color }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-28 h-28 border rounded-full pointer-events-none"
        />
    </div>
);

export default function SplashScreen({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [logs, setLogs] = useState([]);
    const [isFinishing, setIsFinishing] = useState(false);
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        if (currentStep < STEPS.length) {
            const step = STEPS[currentStep];
            const timer = setTimeout(() => {
                setLogs(prev => [...prev.slice(-10), {
                    time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    content: step.log,
                    color: step.color
                }]);

                const targetPerc = step.progress;
                let currentP = percentage;
                const pInterval = setInterval(() => {
                    if (currentP < targetPerc) {
                        currentP += 1;
                        setPercentage(currentP);
                    } else {
                        clearInterval(pInterval);
                    }
                }, 10);

                if (currentStep === STEPS.length - 1) {
                    setTimeout(() => {
                        setIsFinishing(true);
                        setTimeout(onComplete, 1200);
                    }, 800);
                } else {
                    setCurrentStep(prev => prev + 1);
                }
            }, currentStep === 0 ? 500 : Math.random() * 500 + 300);
            return () => clearTimeout(timer);
        }
    }, [currentStep, onComplete]);

    const activeColor = STEPS[currentStep]?.color || '#0078D4';

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isFinishing ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[99999] bg-[#0a0a0a] flex flex-col font-sans select-none overflow-hidden"
        >
            {/* EFECTOS DE FONDO COHERENTES */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.02)_0%,transparent_60%)]" />

            {/* HEADER HUD */}
            <header className="h-16 px-12 border-b border-white/5 flex items-center justify-between text-[10px] font-black text-[#555] tracking-[0.4em] uppercase">
                <div className="flex items-center gap-6">
                    <span className="text-white/20">SISTEMA_LNB_CORE</span>
                    <div className="w-1 h-1 rounded-full bg-[#107C10] animate-pulse" />
                    <span style={{ color: activeColor }} className="transition-colors duration-1000">STATE: {STEPS[currentStep].id}</span>
                </div>
                <div className="flex items-center gap-8">
                    <span>PWR_LOAD: 88%</span>
                    <div className="flex items-center gap-3">
                        <Radio size={12} className="animate-pulse text-[#0078D4]" />
                        <span className="text-white/40">CLOUD_SYNC_ACTIVE</span>
                    </div>
                </div>
            </header>

            {/* CENTRO OPERATIVO */}
            <div className="flex-1 flex flex-col items-center justify-center relative px-6">

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative mb-20"
                >
                    <BasketballIcon progress={percentage} color={activeColor} />
                </motion.div>

                {/* Identidad Visual FIBA STATS */}
                <div className="w-full max-w-2xl space-y-16">
                    <div className="text-center">
                        <motion.h1
                            className="text-7xl font-oswald font-black italic uppercase text-white mb-4 tracking-tighter"
                        >
                            FIBA<span style={{ color: activeColor }} className="transition-colors duration-1000">STATS</span>
                        </motion.h1>
                        <p className="text-[12px] text-[#444] font-black tracking-[1em] uppercase">
                            SISTEMA DE ANALÍTICAS AVANZADAS
                        </p>
                    </div>

                    {/* Barra de Progreso Maestra */}
                    <div className="relative">
                        <div className="h-[2px] bg-white/5 w-full rounded-full overflow-hidden">
                            <motion.div
                                className="h-full shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                style={{ backgroundColor: activeColor }}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.1, ease: "linear" }}
                            />
                        </div>
                        <div className="flex justify-between mt-6">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-oswald font-black text-white italic">{percentage}%</span>
                                <div className="h-6 w-px bg-white/10" />
                                <span className="text-[10px] font-black text-[#555] uppercase tracking-widest italic">{STEPS[currentStep].log}</span>
                            </div>
                            <div className="flex gap-1.5 items-center">
                                {[1, 2, 3].map(v => (
                                    <div key={v} className="w-1.5 h-3 opacity-20" style={{ backgroundColor: activeColor }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Terminal Fluorescente */}
                    <div className="bg-[#0c0c0c] border border-white/5 p-8 font-mono text-[11px] h-48 overflow-hidden relative shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent pointer-events-none z-10" />
                        <div className="space-y-2 opacity-80">
                            {logs.map((log, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-6"
                                >
                                    <span className="text-[#333]">[{log.time}]</span>
                                    <span style={{ color: log.color }} className="font-black uppercase tracking-widest">{log.content}</span>
                                </motion.div>
                            ))}
                            <div className="w-2 h-4 animate-pulse inline-block align-middle ml-2" style={{ backgroundColor: activeColor }} />
                        </div>
                        <div className="absolute top-6 right-8 opacity-[0.03]">
                            <Terminal size={80} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER MULTICOLOR */}
            <footer className="h-20 px-12 border-t border-white/5 flex items-center justify-between text-[11px] font-black text-[#333] tracking-[0.6em] uppercase transition-colors duration-1000" style={{ backgroundColor: isFinishing ? '#107C10' : '#080808' }}>
                <div className="flex items-center gap-16">
                    <div className="flex flex-col">
                        <span className="text-[8px] mb-1 font-black text-white/10 uppercase">Security_Enc</span>
                        <span className="text-white/30">SSL_V3_ACTIVE</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] mb-1 font-black text-white/10 uppercase">Operational_Mode</span>
                        <span className="text-white/30">PRIMARY_NODE</span>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className={`flex items-center gap-3 transition-colors duration-700 ${percentage === 100 ? 'text-[#107C10]' : 'text-white/10'}`}>
                        <CheckCircle2 size={16} />
                        <span className="tracking-widest">SISTEMA_OK</span>
                    </div>
                </div>
            </footer>
        </motion.div>
    );
}

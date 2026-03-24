import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, TrendingUp, Target, Zap, BarChart3, PieChart,
    Shield, Database, Dribbble, Radio, RefreshCw, Crosshair, Hexagon
} from 'lucide-react';
import { getGlobalStats } from '../services/api';

// --- DISEÑO ---
const Scanlines = () => (
    <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
);

const Card = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`relative bg-[#0d0d0d] border border-white/5 rounded-sm overflow-hidden group hover:border-[#0078D4]/40 transition-all duration-700 ${className}`}>
        <Scanlines />
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#0078D4]/5 border border-[#0078D4]/20 flex items-center justify-center group-hover:bg-[#0078D4]/20 transition-all text-[#0078D4]">
                    {Icon && <Icon size={18} />}
                </div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-white/90">{title}</h3>
            </div>
        </div>
        <div className="p-8 relative z-10">{children}</div>
    </div>
);

// --- COMPONENTES VISUALES ---
const DonutChart = ({ stats }) => {
    if (!stats) return null;
    const segments = [
        { p: stats.pnt_pintura, c: "#0078D4", n: "PINTURA" },
        { p: stats.pnt_triples, c: "#00BCF2", n: "TRIPLES" },
        { p: stats.pnt_libres, c: "#E1F5FE", n: "LIBRES" }
    ];
    const total = segments.reduce((a, b) => a + b.p, 0) || 1;
    let cumulative = 0;
    return (
        <div className="flex items-center gap-10">
            <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="rotate-[-90deg]">
                    {segments.map((s, i) => {
                        const perc = (s.p / total) * 100;
                        const dashArray = `${perc} ${100 - perc}`;
                        const dashOffset = -cumulative;
                        cumulative += perc;
                        return (
                            <circle key={i} cx="50" cy="50" r="40" fill="transparent" stroke={s.c} strokeWidth="12" strokeDasharray={dashArray} strokeDashoffset={dashOffset} pathLength="100" className="transition-all duration-1000" />
                        );
                    })}
                    <circle cx="50" cy="50" r="30" fill="#0d0d0d" />
                </svg>
            </div>
            <div className="space-y-4">
                {segments.map((s, i) => (
                    <div key={i} className="flex flex-col">
                        <span className="text-[8px] font-black text-[#444] tracking-widest uppercase">{s.n}</span>
                        <span className="text-[14px] font-oswald font-black text-white">{s.p} PTS</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BarChartEvolution = ({ data = [] }) => (
    <div className="h-40 flex items-end gap-4 px-2">
        {data.map((v, i) => (
            <div key={i} className="flex-1 bg-black/40 relative group/bar" style={{ height: '100%' }}>
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / 200) * 100}%` }}
                    className="absolute bottom-0 inset-x-0 bg-[#0078D4] opacity-50 group-hover/bar:opacity-100 transition-all"
                >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#00BCF2] shadow-[0_0_10px_#00BCF2]" />
                </motion.div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#444]">G{i + 1}</span>
            </div>
        ))}
    </div>
);

const GlobalPerformanceChart = ({ data = [] }) => {
    if (data.length === 0) return (
        <div className="h-48 w-full flex items-center justify-center text-[#222]">NO_HISTORY_SYNCED</div>
    );

    const max = Math.max(...data, 100);
    const pathData = data.map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 80 - (v / max) * 60;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const areaData = `${pathData} L 100 100 L 0 100 Z`;

    return (
        <div className="h-48 w-full relative overflow-hidden bg-black/40 rounded-sm border border-white/5 shadow-inner">
            <Scanlines />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,188,242,0.6)]">
                <defs>
                    <linearGradient id="real-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00BCF2" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0078D4" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {[20, 40, 60, 80].map(v => (
                    <line key={v} x1="0" y1={v} x2="100" y2={v} stroke="white" strokeOpacity="0.03" strokeWidth="0.2" />
                ))}

                {/* Fill */}
                <motion.path
                    initial={{ d: "M 0 100 L 20 100 L 40 100 L 60 100 L 80 100 L 100 100 L 100 100 L 0 100 Z" }}
                    animate={{ d: areaData }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    fill="url(#real-grad)"
                />

                {/* Line */}
                <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, d: pathData }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    fill="none"
                    stroke="#00BCF2"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                />

                {/* Data Points */}
                {data.map((v, i) => (
                    <motion.circle
                        key={i}
                        cx={(i / (data.length - 1)) * 100}
                        cy={80 - (v / max) * 60}
                        r="1.5"
                        fill="#fff"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="shadow-[0_0_10px_#fff]"
                    />
                ))}
            </svg>

            {/* Indicador lateral de valor */}
            <div className="absolute top-4 left-6 flex flex-col gap-1">
                <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">PUNTOS_POR_PARTIDO</span>
                <span className="text-[7px] text-[#00BCF2] font-mono tracking-widest font-black uppercase">ULTIMOS_REGISTROS_LNB</span>
            </div>
        </div>
    );
};

export default function AnaliticasSection() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await getGlobalStats();
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    if (loading) return (
        <div className="h-[500px] flex flex-col items-center justify-center gap-6">
            <RefreshCw size={48} className="text-[#0078D4] animate-spin" />
            <span className="text-[10px] font-black text-[#222] tracking-[1em] uppercase">SINCRONIZANDO_NÚCLEO...</span>
        </div>
    );

    if (!stats) return (
        <div className="h-[500px] flex flex-col items-center justify-center gap-6">
            <Database size={48} className="text-red-500/30 mb-4" />
            <span className="text-[10px] font-black text-red-500/40 tracking-[0.5em] uppercase">ERR_404: NÚCLEO_NO_RESPONDE</span>
            <p className="text-[8px] text-[#333] font-black uppercase tracking-[0.2em] max-w-xs text-center leading-relaxed">
                Es necesario reconstruir el contenedor del backend para aplicar las nuevas rutas.
                Por favor revisa el terminal.
            </p>
            <button onClick={fetchStats} className="mt-8 px-8 py-3 bg-white/5 border border-white/10 hover:bg-[#0078D4] hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                REINTENTAR_SINC
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-full w-full bg-[#050505] relative overflow-hidden">
            <div className="p-16 pb-12 flex-shrink-0 relative z-20">
                <div className="flex items-center justify-between mb-16 underline underline-offset-[24px] decoration-white/5">
                    <div className="flex items-center gap-8 group">
                        <div className="w-16 h-16 bg-[#0078D4] flex items-center justify-center shadow-[0_0_30px_rgba(0,120,212,0.4)]">
                            <Dribbble size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-white">WARROOM <span className="text-[#0078D4]">ESTADÍSTICO</span></h2>
                            <p className="text-[11px] text-[#444] font-black tracking-[0.8em] uppercase mt-4">SISTEMA_DENTADO_REAL_v5.1</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-16 pb-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { l: "PARTIDOS_PLAY", v: stats.total_matches, i: Database, c: "#0078D4" },
                        { l: "PROM_PUNTOS", v: stats.total_punto_avg ? stats.total_punto_avg.toFixed(1) : "0.0", i: TrendingUp, c: "#00BCF2" },
                        { l: "EFIC_GLOBAL", v: stats.total_eficiencia_avg ? stats.total_eficiencia_avg.toFixed(1) : "0.0", i: Activity, c: "#107C10" },
                        { l: "TAPONES_TOTAL", v: stats.total_tapones, i: Target, c: "#D83B01" }
                    ].map((k, i) => (
                        <div key={i} className="bg-[#0d0d0d] border border-white/5 p-8 flex flex-col items-center group hover:border-[#0078D4]/40 transition-all shadow-2xl">
                            <k.i size={20} className="mb-4 opacity-40 group-hover:opacity-100 transition-all" style={{ color: k.c }} />
                            <span className="text-[9px] font-black text-[#444] uppercase tracking-[0.3em] mb-1">{k.l}</span>
                            <span className="text-4xl font-oswald font-black text-white">{k.v}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <Card title="Distribución de Goleo" icon={PieChart} className="col-span-12 xl:col-span-5 text-[#0078D4]">
                        <DonutChart stats={stats} />
                    </Card>
                    <Card title="Evolución Últimos Partidos" icon={BarChart3} className="col-span-12 xl:col-span-7">
                        <div className="pt-4">
                            <BarChartEvolution data={stats.tendencia_puntos || []} />
                        </div>
                    </Card>
                    <Card title="Monitor de Rendimiento Real" icon={Zap} className="col-span-12">
                        <GlobalPerformanceChart data={stats.tendencia_puntos || []} />
                    </Card>
                </div>
            </div>
        </div>
    );
}

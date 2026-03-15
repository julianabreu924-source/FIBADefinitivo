import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, ShieldAlert } from 'lucide-react'

export default function ConfirmModal({ show, onClose, onConfirm, title, msg }) {
    if (!show) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                {/* Backdrop Mica */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Dialog Window */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    {/* Header */}
                    <header className="h-12 px-6 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <ShieldAlert size={14} className="text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#666] italic">Interrupción_Seguridad</span>
                        </div>
                        <button onClick={onClose} className="text-[#444] hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </header>

                    {/* Body */}
                    <div className="p-10 text-center">
                        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-sm flex items-center justify-center mx-auto mb-8 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2 text-white">{title}</h3>
                        <p className="text-[#777] text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                            {msg}
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <footer className="p-6 bg-black/40 border-t border-white/5 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-colors text-[#666]"
                        >
                            Abortar_Operación
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/20 transition-all active:scale-95"
                        >
                            Confirmar_Ejecución
                        </button>
                    </footer>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

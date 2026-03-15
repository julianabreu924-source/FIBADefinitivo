import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HistoryControls() {
    const navigate = useNavigate()

    return (
        <div className="flex items-center gap-1.5 mr-4 border-r border-white/10 pr-4">
            <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#444] hover:text-white hover:bg-[#0078D4]/20 hover:border-[#0078D4]/30 transition-all active:scale-90 group"
                title="Regresar"
            >
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
                onClick={() => navigate(1)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#444] hover:text-white hover:bg-[#0078D4]/20 hover:border-[#0078D4]/30 transition-all active:scale-90 group"
                title="Avanzar"
            >
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
        </div>
    )
}

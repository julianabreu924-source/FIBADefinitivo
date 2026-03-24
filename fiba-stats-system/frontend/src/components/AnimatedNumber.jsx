import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AnimatedNumber - El corazón de la dopamina visual.
 * Ahora con transiciones "Épicas":
 * - Flash de Neón (Verde al subir, Rojo al bajar).
 * - Expansión cinemática.
 * - Sombra proyectada dinámica.
 */
export default function AnimatedNumber({ value, className = "" }) {
    const [displayValue, setDisplayValue] = useState(value);
    const [flash, setFlash] = useState(null); // 'up', 'down', or null

    useEffect(() => {
        if (value !== displayValue) {
            const dir = value > displayValue ? 'up' : 'down';
            setFlash(dir);
            setDisplayValue(value);

            // Apagar el flash después de la animación
            const timer = setTimeout(() => setFlash(null), 800);
            return () => clearTimeout(timer);
        }
    }, [value, displayValue]);

    return (
        <div className={`relative inline-flex flex-col items-center overflow-visible h-[1.12em] ${className}`}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={value}
                    initial={{
                        y: flash === 'up' ? '50%' : '-50%',
                        opacity: 0,
                        scale: 1.5,
                        filter: 'blur(4px)'
                    }}
                    animate={{
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        filter: 'blur(0px)',
                        color: flash === 'up' ? '#10b981' : flash === 'down' ? '#ef4444' : undefined,
                        textShadow: flash ? `0 0 20px ${flash === 'up' ? '#10b981' : '#ef4444'}` : 'none'
                    }}
                    exit={{
                        y: flash === 'up' ? '-50%' : '50%',
                        opacity: 0,
                        scale: 0.8,
                        filter: 'blur(2px)'
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                        mass: 0.5
                    }}
                    className="inline-block relative z-10 font-bold"
                >
                    {value}
                </motion.span>
            </AnimatePresence>

            {/* Aura de impacto de cambio */}
            <AnimatePresence>
                {flash && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className={`absolute inset-0 rounded-full blur-xl pointer-events-none ${flash === 'up' ? 'bg-emerald-500/40' : 'bg-red-500/40'}`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'

/**
 * AnimatedNumber - Componente de alta precisión para transiciones numéricas.
 * Utiliza resortes (springs) para un movimiento fluido y profesional,
 * similar a los tableros de control de alta gama.
 */
export default function AnimatedNumber({ value }) {
    const [displayValue, setDisplayValue] = useState(value)
    const [direction, setDirection] = useState(0) // 1 para arriba, -1 para abajo

    useEffect(() => {
        if (value !== displayValue) {
            setDirection(value > displayValue ? 1 : -1)
            setDisplayValue(value)
        }
    }, [value, displayValue])

    return (
        <div className="relative inline-flex flex-col items-center overflow-hidden h-[1em]">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={value}
                    initial={{ y: direction > 0 ? '100%' : '-100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: direction > 0 ? '-100%' : '100%', opacity: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        mass: 0.8
                    }}
                    className="inline-block"
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </div>
    )
}

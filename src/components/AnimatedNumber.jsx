import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

/**
 * Smoothly counts up/down to `value` with a spring, instead of snapping.
 * Always renders Western/Latin digits. Optionally zero-pads to `pad` width.
 */
export default function AnimatedNumber({ value, pad = 0, className }) {
  const spring = useSpring(0, { stiffness: 90, damping: 18, mass: 0.6 })
  const text = useTransform(spring, (v) => {
    const n = Math.round(v)
    return pad > 0 ? String(n).padStart(pad, '0') : String(n)
  })

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return <motion.span className={className}>{text}</motion.span>
}

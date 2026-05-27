import { useMemo } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#8b5cf6', '#ffb3d6', '#a87bff', '#fbbf24', '#34d399', '#60a5fa']

/**
 * A lightweight confetti burst, rendered with Framer Motion (no extra deps).
 * Pieces shoot upward/outward from the center, then fall with gravity + spin.
 * `count` controls density; `run` keys a fresh burst when toggled.
 */
export default function Confetti({ count = 40, run = true }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320, // horizontal spread (px)
        y: 260 + Math.random() * 260, // fall distance
        rotate: Math.random() * 720 - 360,
        delay: Math.random() * 0.25,
        duration: 1.4 + Math.random() * 1.1,
        color: COLORS[i % COLORS.length],
        size: 7 + Math.random() * 8,
        round: Math.random() > 0.5,
      })),
    [count, run] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-start justify-center overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-24"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.round ? '9999px' : '2px',
          }}
          initial={{ x: 0, y: -20, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

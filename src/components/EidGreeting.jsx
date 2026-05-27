import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { EID_NAME } from '../lib/eid.js'

/**
 * The festive Eid pop-up modal. Purely presentational — whether and when it may
 * appear (the exact-date + once-only rules) and its sequencing relative to other
 * pop-ups are owned by <OnboardingModals>. Here we just render a centered modal
 * with a darkened backdrop when `open`, and call `onClose` on any dismissal.
 */
export default function EidGreeting({ open, onClose }) {
  const { studentName } = useApp()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 z-[60] flex items-center justify-center bg-night-900/50 p-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xs overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-500 to-brand-600 p-6 text-center text-white shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="داخستن"
              className="absolute left-3 top-3 rounded-full p-1.5 text-white/70 transition hover:bg-white/15 hover:text-white active:scale-90"
            >
              <X size={18} />
            </button>

            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 14 }}
              className="text-6xl"
            >
              🌸
            </motion.div>

            <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
              {EID_NAME}
            </span>

            <h2 className="mt-3 text-2xl font-extrabold leading-snug">
              جەژنت پیرۆز بێت {studentName}!
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-white/90">
              خۆشترین ڕۆژت بۆ دەخوازم🌷
              <br />
              خۆشی و شادیاکانی ژیانت بە نسیب بێت إنشاءلله، بیرت لە هەرچیەک کردەوە پێی
              ئەگەیت تەنها (بەردەوامبە)، سەرکەوتووبیت❣️
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-2xl bg-white px-4 py-3 font-bold text-brand-600 transition hover:bg-white/90 active:scale-95"
            >
              سوپاس 🌸
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

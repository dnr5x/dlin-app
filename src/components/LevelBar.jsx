import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { levelInfo } from '../data/levels.js'

/** Compact level & points card: current title, level badge, and progress to next. */
export default function LevelBar() {
  const { xp } = useApp()
  const { level, title, isMax, progress, xpToNext } = levelInfo(xp)

  return (
    <section className="card p-4">
      <div className="flex items-center gap-3">
        {/* Level badge */}
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-soft">
          {isMax ? <Trophy size={22} /> : <span className="text-lg font-extrabold">{level}</span>}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate font-bold text-night-900 dark:text-brand-50">{title}</p>
            <span dir="rtl" className="shrink-0 text-xs font-semibold text-brand-500 dark:text-brand-300">
              {xp} خاڵ ⭐️
            </span>
          </div>

          {/* Progress track */}
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-brand-100 dark:bg-night-700">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <p className="mt-1 text-[11px] text-night-700/60 dark:text-brand-100/60">
            {isMax ? 'گەیشتیتە بەرزترین ئاست! 🏆' : `${xpToNext} خاڵ بۆ ئاستی ${level + 1}`}
          </p>
        </div>
      </div>
    </section>
  )
}

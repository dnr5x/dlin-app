import { Flame } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

/**
 * "ڕیکۆردی ئەمڕۆ" (Today's Record) — a small motivational card showing how many
 * focus (study) sessions the student has completed today. Driven by
 * `completedSessions`, which the Focus timer increments each time a study
 * session counts down to 00:00.
 */
export default function StudyTracker() {
  const { completedSessions } = useApp()

  return (
    <section className="card flex items-center gap-4 p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-soft">
        <Flame size={24} />
      </span>
      <div>
        <h2 className="text-xs font-semibold uppercase text-brand-500 dark:text-brand-300">
          ڕیکۆردی ئەمڕۆ
        </h2>
        <p className="mt-1 font-bold text-night-900 dark:text-brand-50">
          {completedSessions === 0
            ? 'ئەمڕۆ هێشتا دەستت پێنەکردووە، با دەست پێبکەین! 💪'
            : `دەستخۆش شێرەکەم! ئەمڕۆ ${completedSessions} جار سەعیت کرد 🔥`}
        </p>
      </div>
    </section>
  )
}

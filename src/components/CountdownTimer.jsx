import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarClock } from 'lucide-react'

// Kurdish labels for the countdown units.
const UNITS = [
  { key: 'days', label: 'ڕۆژ' },
  { key: 'hours', label: 'کاتژمێر' },
  { key: 'minutes', label: 'خولەک' },
  { key: 'seconds', label: 'چرکە' },
]

function diff(target) {
  const total = Math.max(0, new Date(target).getTime() - Date.now())
  return {
    total,
    days: Math.floor(total / 86400000),
    hours: Math.floor((total / 3600000) % 24),
    minutes: Math.floor((total / 60000) % 60),
    seconds: Math.floor((total / 1000) % 60),
  }
}

/** Live countdown to the 12th-grade ministry exams (تاقیکردنەوەکانی وەزاری). */
export default function CountdownTimer({ target }) {
  const [time, setTime] = useState(() => diff(target))

  useEffect(() => {
    setTime(diff(target))
    const id = setInterval(() => setTime(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const finished = time.total === 0

  return (
    <section className="card overflow-hidden p-5">
      <div className="mb-4 flex items-center gap-2 text-brand-700 dark:text-brand-200">
        <CalendarClock size={20} />
        <h2 className="font-bold">تاقیکردنەوەی وزاری</h2>
      </div>

      {finished ? (
        <p className="py-4 text-center text-lg font-semibold text-brand-700 dark:text-brand-200">
          🎉 کاتی تاقیکردنەوەکان هاتووە — بەهیوای سەرکەوتن!
        </p>
      ) : (
        // dir="ltr" so units read ڕۆژ → کاتژمێر → خولەک → چرکە (days first)
        <div dir="ltr" className="grid grid-cols-4 gap-2">
          {UNITS.map(({ key, label }) => (
            <div
              key={key}
              className="flex flex-col items-center rounded-2xl bg-gradient-to-b from-brand-50 to-brand-100 py-3
                         dark:from-night-700 dark:to-night-800"
            >
              {/* Rolling-counter effect: each value slides up as it changes. */}
              <div className="relative h-8 overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={time[key]}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="block text-2xl font-extrabold tabular-nums text-brand-700 dark:text-brand-200"
                  >
                    {String(time[key]).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="mt-1 text-[11px] text-night-700/70 dark:text-brand-100/60">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-center text-sm text-night-700/70 dark:text-brand-100/60">
        مەرحەلە وەحشەکە ئەوەنەی ماوە ئامادەبە 💪
      </p>
    </section>
  )
}

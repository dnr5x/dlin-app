import { Link } from 'react-router-dom'
import { CalendarClock, ChevronLeft } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { daysUntil, urgencyClass, daysLabel } from './ExamPlanner.jsx'

/**
 * Home dashboard summary: shows ONLY the single next upcoming exam (soonest date
 * that is today or later), plus a "View all" link to the dedicated /exams page
 * where the full schedule + add/edit logic live. Keeps the Home screen a clean
 * "today summary" instead of dumping the whole exam list.
 */
export default function NextExamCard() {
  const [exams] = useLocalStorage('dlin:exams', [])

  // Soonest exam that hasn't passed yet.
  const next = [...exams]
    .filter((ex) => daysUntil(ex.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0]

  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-brand-700 dark:text-brand-200">
          <CalendarClock size={20} />
          <h2 className="font-bold">تاقیکردنەوەی داهاتوو</h2>
        </div>
        <Link
          to="/exams"
          className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-brand-500 transition active:scale-95 dark:text-brand-300"
        >
          بینینی هەمووی <ChevronLeft size={14} />
        </Link>
      </div>

      {next ? (
        <Link
          to="/exams"
          className="flex items-center gap-3 rounded-2xl bg-brand-50/70 p-3 transition active:scale-[0.99] dark:bg-night-700/40"
        >
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${urgencyClass(daysUntil(next.date))}`}>
            {daysLabel(daysUntil(next.date))}
          </span>
          <span className="min-w-0 flex-1 truncate font-bold text-night-900 dark:text-brand-50">
            {next.subject}
          </span>
          <span dir="ltr" className="shrink-0 text-xs tabular-nums text-night-700/60 dark:text-brand-100/50">
            {next.date}
          </span>
        </Link>
      ) : (
        <Link
          to="/exams"
          className="block rounded-2xl bg-brand-50/70 p-4 text-center text-sm text-night-700/60 transition active:scale-[0.99] dark:bg-night-700/40 dark:text-brand-100/50"
        >
          هیچ تاقیکردنەوەیەکی داهاتوو نییە — زیادی بکە 🗓️
        </Link>
      )}
    </section>
  )
}

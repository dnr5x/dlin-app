import { Play } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useFocusLauncher } from '../context/FocusContext.jsx'
import { daysUntil, daysLabel } from './ExamPlanner.jsx'

/**
 * "پێشنیاری ئێستا" — the quiet assistant's single answer to "what should I study
 * right now?". Picks the most urgent upcoming exam that still has unfinished
 * sub-topics, names the next topic, and launches Focus pre-loaded with that
 * context in one tap. Derived entirely from existing exam data — no new model.
 *
 * Renders nothing when there's no upcoming exam, so it never clutters Home.
 */
export default function NowSuggestion() {
  const [exams] = useLocalStorage('dlin:exams', [])
  const { requestFocus } = useFocusLauncher()

  const upcoming = exams
    .filter((ex) => daysUntil(ex.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  if (upcoming.length === 0) return null

  // Prefer the soonest exam that still has unfinished topics; else the soonest.
  const target = upcoming.find((ex) => (ex.topics ?? []).some((t) => !t.done)) ?? upcoming[0]
  const nextTopic = (target.topics ?? []).find((t) => !t.done)?.text || ''
  const days = daysUntil(target.date)

  // What we'll focus on: a specific sub-topic when available, else the subject.
  const contextTitle = nextTopic
    ? `${target.subject} — ${nextTopic}`
    : `سەعی بۆ تاقیکردنەوەی ${target.subject}`

  return (
    <button
      type="button"
      onClick={() => requestFocus({ contextTitle })}
      className="block w-full rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 p-5 text-right text-white shadow-card transition active:scale-[0.98]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-white/85">هەنگاوی داهاتوو</span>
        <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">
          {daysLabel(days)}
        </span>
      </div>

      <p className="mt-2 text-lg font-extrabold leading-snug">
        {target.subject}
        {nextTopic && <span className="font-bold text-white/90"> — {nextTopic}</span>}
      </p>

      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-bold backdrop-blur-sm">
        <Play size={16} /> دەست بکە بە تەرکیز
      </span>
    </button>
  )
}

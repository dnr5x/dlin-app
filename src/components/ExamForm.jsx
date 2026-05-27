import { useState } from 'react'
import { Plus } from 'lucide-react'
import SubjectSelect from './SubjectSelect.jsx'

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

// Clean integer percentage: digits only, no leading zeros, empty → 0, 0–100.
const clampScore = (v) =>
  Math.max(0, Math.min(100, Math.floor(Number(String(v).replace(/[^\d]/g, '')) || 0)))

// Build a fresh exam record from the form's { subject, date, target }.
export const makeExam = ({ subject, date, target = 90 }) => ({
  id: newId(),
  subject: subject.trim(),
  date,
  target: clampScore(target),
  topics: [],
})

/**
 * The add-an-exam form (subject + date + target score). Presentational: it
 * validates and calls `onSubmit({ subject, date, target })`, then clears itself.
 * Sub-topics are intentionally NOT here — they're added from the expanded exam
 * card to keep creation fast and low-friction.
 */
export default function ExamForm({ onSubmit, submitLabel = 'زیادکردنی تاقیکردنەوە' }) {
  const [subject, setSubject] = useState('')
  const [date, setDate] = useState('')
  const [target, setTarget] = useState('90') // motivating default

  const submit = (e) => {
    e.preventDefault()
    if (!subject.trim() || !date) return
    onSubmit({ subject: subject.trim(), date, target: clampScore(target) })
    setSubject('')
    setDate('')
    setTarget('90')
  }

  return (
    <form onSubmit={submit} className="flex w-full min-w-0 box-border flex-col gap-3">
      <SubjectSelect value={subject} onChange={setSubject} />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        dir="ltr"
        className="field block h-12 w-full min-w-0 max-w-full box-border appearance-none text-left text-night-900 dark:text-brand-50"
      />

      {/* Target score — clamped 0–100 with a % indicator. */}
      <label className="flex items-center justify-between gap-3 px-1">
        <span className="text-sm font-semibold text-night-700 dark:text-brand-100/80">🎯 ئامانجی نمرە</span>
        <span className="flex items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            value={String(target)}
            onChange={(e) => setTarget(clampScore(e.target.value))}
            dir="ltr"
            aria-label="ئامانجی نمرە"
            className="w-16 rounded-xl border border-brand-200 bg-white px-2 py-2 text-center text-base font-bold tabular-nums text-night-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:border-night-600 dark:bg-night-700 dark:text-brand-50"
          />
          <span className="text-sm font-semibold text-night-700/70 dark:text-brand-100/60">٪</span>
        </span>
      </label>

      <button
        type="submit"
        disabled={!subject || !date}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
      >
        <Plus size={18} /> {submitLabel}
      </button>
    </form>
  )
}

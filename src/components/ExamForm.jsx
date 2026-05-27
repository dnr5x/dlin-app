import { useState } from 'react'
import { Plus } from 'lucide-react'
import SubjectSelect from './SubjectSelect.jsx'

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

// Build a fresh exam record from the form's { subject, date }.
export const makeExam = ({ subject, date }) => ({
  id: newId(),
  subject: subject.trim(),
  date,
  target: 90,
  topics: [],
})

/**
 * The add-an-exam form (subject + date). Presentational: it validates and calls
 * `onSubmit({ subject, date })`, then clears itself. Reused by the /exams page
 * and the global Creation Hub so the exam-adding logic lives in one place.
 */
export default function ExamForm({ onSubmit, submitLabel = 'زیادکردنی تاقیکردنەوە' }) {
  const [subject, setSubject] = useState('')
  const [date, setDate] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!subject.trim() || !date) return
    onSubmit({ subject: subject.trim(), date })
    setSubject('')
    setDate('')
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

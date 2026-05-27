import { useState } from 'react'
import { CalendarDays, Repeat } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { KURDISH_DAYS, makeTask } from '../lib/tasks.js'
import TaskSubjectSelect from './TaskSubjectSelect.jsx'

/**
 * Self-contained task-creation flow used by the global Creation Hub. Two inline
 * steps: compose (text + subject) → choose recurrence. Writes to `dlin:todos`
 * (which now syncs in-window), so the Home list updates instantly. Calls
 * `onDone()` after a task is saved so the hub can close.
 */
export default function TaskCreator({ onDone }) {
  const { subjects, weeklySchedule } = useApp()
  const [, setTodos] = useLocalStorage('dlin:todos', [])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pickedId, setPickedId] = useState('')
  const [step, setStep] = useState('compose') // 'compose' | 'repeat'

  const today = new Date().getDay()
  const todayName = KURDISH_DAYS[today]
  const todayIds = weeklySchedule[today] ?? []
  const todaySubjects = subjects.filter((s) => todayIds.includes(s.id))
  const otherSubjects = subjects.filter((s) => !todayIds.includes(s.id))
  const hasSubjects = subjects.length > 0
  const activeId = pickedId || todaySubjects[0]?.id || otherSubjects[0]?.id || ''

  const next = (e) => {
    e.preventDefault()
    if (title.trim()) setStep('repeat')
  }

  const save = (isRecurring) => {
    if (!title.trim()) return
    setTodos((prev) => [...prev, makeTask({ title, description, subjectId: activeId, isRecurring })])
    onDone?.()
  }

  // Step 2: how should it repeat?
  if (step === 'repeat') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-night-700/70 dark:text-brand-100/60">
          «{title.trim()}» کەی بیخەینەوە؟
        </p>
        <RepeatChoice
          Icon={CalendarDays}
          title="تەنها بۆ ئەمڕۆ"
          desc="یەک جارە — تەنها ئەمڕۆ دەردەکەوێت."
          onClick={() => save(false)}
        />
        <RepeatChoice
          Icon={Repeat}
          title={`هەموو ${todayName}یەک`}
          desc="هەموو هەفتە لەم ڕۆژەدا دێتەوە."
          onClick={() => save(true)}
        />
        <button type="button" onClick={() => setStep('compose')} className="btn-ghost w-full">
          گەڕانەوە
        </button>
      </div>
    )
  }

  // Step 1: compose the task — a prominent title + an optional details textarea.
  return (
    <form onSubmit={next} className="space-y-3">
      {/* Title (required) + subject picker. */}
      <div className="flex items-stretch rounded-2xl border border-brand-200 bg-white transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200 dark:border-night-600 dark:bg-night-700">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          dir="rtl"
          autoFocus
          placeholder="ئیشەکەت چییە؟"
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-right text-sm font-semibold text-night-900 outline-none placeholder:font-normal placeholder:text-night-700/40 dark:text-brand-50 dark:placeholder:text-brand-100/30"
        />
        {hasSubjects && (
          <TaskSubjectSelect
            todaySubjects={todaySubjects}
            otherSubjects={otherSubjects}
            value={activeId}
            onChange={setPickedId}
          />
        )}
      </div>

      {/* Details (optional). */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        dir="rtl"
        rows={3}
        placeholder="وردەکاری زیاتر (ئارەزوومەندانە)…"
        className="field min-h-[80px] resize-y text-right text-sm leading-relaxed"
      />

      <button
        type="submit"
        disabled={!title.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
      >
        دواتر
      </button>
    </form>
  )
}

/** A large, tappable recurrence choice row (icon + title + description). */
function RepeatChoice({ Icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border-2 border-brand-200 bg-white p-4 text-right transition hover:border-brand-400 hover:bg-brand-50 active:scale-[0.98] dark:border-night-600 dark:bg-night-700 dark:hover:border-brand-400 dark:hover:bg-night-600"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-night-600 dark:text-brand-300">
        <Icon size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-night-900 dark:text-brand-50">{title}</span>
        <span className="block text-xs text-night-700/60 dark:text-brand-100/60">{desc}</span>
      </span>
    </button>
  )
}

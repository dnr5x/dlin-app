import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { SUBJECT_ICONS } from '../data/subjects.js'

/**
 * Global note creator for the Creation Hub. Notes are tied to a subject, so the
 * flow is: pick a subject → write the note. Saves through AppContext.addNote
 * (the shared notes store), then calls `onDone()`.
 */
export default function NoteCreator({ onDone }) {
  const { subjects, addNote } = useApp()
  const [subjectId, setSubjectId] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  if (subjects.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-night-700/60 dark:text-brand-100/50">
        پێویستە سەرەتا بابەتێک زیاد بکەیت.
      </p>
    )
  }

  // Step 1: choose the subject.
  if (!subjectId) {
    return (
      <div>
        <p className="mb-3 text-sm font-semibold text-night-700/70 dark:text-brand-100/60">
          ئەم تێبینییە بۆ کام بابەتە؟
        </p>
        <div className="grid grid-cols-2 gap-2">
          {subjects.map((s) => {
            const Icon = SUBJECT_ICONS[s.id]
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSubjectId(s.id)}
                className="flex items-center gap-2 rounded-2xl border-2 border-brand-200 bg-white p-3 text-right transition hover:border-brand-400 hover:bg-brand-50 active:scale-[0.98] dark:border-night-600 dark:bg-night-700 dark:hover:border-brand-400 dark:hover:bg-night-600"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${s.gradient} text-white`}
                >
                  {Icon ? <Icon size={16} /> : <span className="text-sm">{s.emoji}</span>}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold text-night-900 dark:text-brand-50">
                  {s.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Step 2: write the note (title + description) for the chosen subject.
  const subject = subjects.find((s) => s.id === subjectId)
  const canSave = title.trim().length > 0
  const save = () => {
    if (!canSave) return
    addNote(subjectId, { title, description })
    onDone?.()
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setSubjectId(null)}
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300"
      >
        <ChevronRight size={16} /> {subject?.name}
      </button>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        dir="rtl"
        autoFocus
        placeholder="سەردێڕی تێبینی (نموونە: یاساکانی وزە)..."
        className="field text-right font-semibold"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        dir="rtl"
        placeholder="وردەکاری و تێبینییە گرنگەکان..."
        className="field min-h-[120px] resize-y text-right leading-relaxed"
      />
      <button
        type="button"
        onClick={save}
        disabled={!canSave}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
      >
        سەیڤی بکە
      </button>
    </div>
  )
}

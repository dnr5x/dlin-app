import { useState } from 'react'
import { SUBJECT_COLORS, SUBJECT_EMOJIS } from '../data/subjects.js'

/**
 * Create / edit form for a subject. Lets Dlin choose a name, an emoji, and a
 * color. `initial` is provided when editing; otherwise a blank form is shown.
 * Calls `onSubmit({ name, emoji, gradient, soft })`.
 */
export default function SubjectForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [emoji, setEmoji] = useState(initial?.emoji || '📚')
  // Match the existing color preset when editing; default to the first.
  const [colorId, setColorId] = useState(
    () => SUBJECT_COLORS.find((c) => c.gradient === initial?.gradient)?.id || SUBJECT_COLORS[0].id
  )
  const [error, setError] = useState('')

  const color = SUBJECT_COLORS.find((c) => c.id === colorId) || SUBJECT_COLORS[0]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('تکایە ناوی بابەتەکە بنووسە.')
    onSubmit({
      name: name.trim(),
      emoji: emoji || '📚',
      gradient: color.gradient,
      soft: color.soft,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Live preview */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color.gradient} text-3xl text-white shadow-soft`}
        >
          {emoji}
        </div>
        <span className="text-lg font-bold text-night-900 dark:text-brand-50">
          {name.trim() || 'بابەتی نوێ'}
        </span>
      </div>

      {/* Name */}
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-night-700 dark:text-brand-100/80">ناوی بابەت</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          dir="rtl"
          placeholder="بۆ نموونە: ئەندازە، مێژوو، ئابووری…"
          className="field text-right"
          autoFocus
        />
      </label>

      {/* Emoji picker */}
      <div className="space-y-1.5">
        <span className="text-sm font-semibold text-night-700 dark:text-brand-100/80">ئایکۆن</span>
        <div className="grid grid-cols-10 gap-1.5">
          {SUBJECT_EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => setEmoji(em)}
              className={`flex h-9 items-center justify-center rounded-xl text-xl transition active:scale-90 ${
                emoji === em
                  ? 'bg-brand-100 ring-2 ring-brand-400 dark:bg-night-700'
                  : 'bg-brand-50 dark:bg-night-700/50'
              }`}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div className="space-y-1.5">
        <span className="text-sm font-semibold text-night-700 dark:text-brand-100/80">ڕەنگ</span>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setColorId(c.id)}
              aria-label={c.id}
              className={`touch-target flex h-11 w-11 items-center justify-center rounded-full ring-2 transition active:scale-90 ${
                colorId === c.id ? 'ring-brand-500' : 'ring-transparent'
              }`}
            >
              <span
                className={`h-8 w-8 rounded-full bg-gradient-to-br ${c.gradient}`}
              />
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">
          لێگەڕێ
        </button>
        <button type="submit" className="btn-primary flex-1">
          سەیڤی بکە
        </button>
      </div>
    </form>
  )
}

import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'

/**
 * Create / edit form for a multiple-choice quiz question.
 * `initial` is provided when editing; otherwise a blank form is shown.
 * Calls `onSubmit(item)` with a validated, fully-localized item.
 */
export default function QuizForm({ initial, onSubmit, onCancel }) {
  const [question, setQuestion] = useState(initial?.question || '')
  const [options, setOptions] = useState(
    initial?.options?.length ? [...initial.options] : ['', '']
  )
  const [correctIndex, setCorrectIndex] = useState(initial?.correctIndex ?? 0)

  const [error, setError] = useState('')

  const updateOption = (i, val) =>
    setOptions((opts) => opts.map((o, idx) => (idx === i ? val : o)))

  const addOption = () => {
    if (options.length >= 5) return
    setOptions((opts) => [...opts, ''])
  }

  const removeOption = (i) => {
    if (options.length <= 2) return
    setOptions((opts) => opts.filter((_, idx) => idx !== i))
    // Keep the correct answer pointing at the right option.
    setCorrectIndex((ci) => (ci === i ? 0 : ci > i ? ci - 1 : ci))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleaned = options.map((o) => o.trim())
    if (!question.trim()) return setError('تکایە پرسیارەکە بنووسە.')
    if (cleaned.filter(Boolean).length < 2)
      return setError('پێویستە بەلایەنی کەمەوە دوو وەڵام دابنێیت.')
    if (!cleaned[correctIndex])
      return setError('تکایە وەڵامی ڕاست دیاری بکە.')
    onSubmit({ type: 'mcq', question: question.trim(), options: cleaned, correctIndex })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Labeled label="پرسیار">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          dir="rtl"
          placeholder="پرسیارەکە لێرە بنووسە…"
          className="field min-h-[80px] resize-y text-right"
        />
      </Labeled>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-night-700 dark:text-brand-100/80">
          وەڵامەکان — وەڵامی ڕاست دیاری بکە
        </p>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCorrectIndex(i)}
              aria-label="دیاریکردنی وەڵامی ڕاست"
              className="touch-target flex items-center justify-center text-brand-500"
            >
              {correctIndex === i ? (
                <CheckCircle2 size={24} className="text-emerald-500" />
              ) : (
                <Circle size={24} className="text-brand-300" />
              )}
            </button>
            <input
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              dir="rtl"
              placeholder={`وەڵامی ${i + 1}`}
              className="field flex-1 text-right"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(i)}
                aria-label="سڕینەوەی وەڵام"
                className="touch-target flex items-center justify-center text-rose-400"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
        {options.length < 5 && (
          <button
            type="button"
            onClick={addOption}
            className="btn-ghost w-full text-sm"
          >
            <Plus size={18} /> زیادکردنی وەڵام
          </button>
        )}
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

function Labeled({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-night-700 dark:text-brand-100/80">{label}</span>
      {children}
    </label>
  )
}

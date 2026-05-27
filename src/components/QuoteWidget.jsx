import { useState } from 'react'
import { Quote, Pencil } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

/**
 * "Quote of the day" — fully customizable by Dlin and persisted in localStorage.
 * Default state shows the saved quote (or a soft placeholder when empty); a
 * pencil / tapping it opens the editor. Saving stores the quote; either cancel
 * button just exits the editor back to the default state without saving.
 */
export default function QuoteWidget() {
  const [quote, setQuote] = useLocalStorage('dlin:quote', '')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(quote)

  // The editor is shown only while actively editing. Otherwise we show the
  // default state: the saved quote, or a placeholder invitation when empty.
  const showEditor = editing

  const save = (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return // don't save an empty quote
    setQuote(text)
    setEditing(false)
  }

  const startEdit = () => {
    setDraft(quote)
    setEditing(true)
  }

  // Cancel: discard whatever was typed and return to the default reading view.
  const cancel = () => {
    setDraft(quote)
    setEditing(false)
  }

  // Erase: delete the saved quote (clears it from localStorage), reset the draft
  // and exit edit mode — leaving the default empty state with the add prompt.
  const clearQuote = () => {
    setQuote('')
    setDraft('')
    setEditing(false)
  }

  return (
    <section className="card relative overflow-hidden p-5">
      <Quote
        className="absolute -left-2 -top-2 text-brand-100 dark:text-night-700"
        size={64}
        strokeWidth={1}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase text-brand-500 dark:text-brand-300">
            وتەی ئەمڕۆ
          </p>
          {!showEditor && (
            <button
              type="button"
              onClick={startEdit}
              aria-label="دەستکاری وتە"
              className="-m-2 flex items-center justify-center rounded-xl p-2 text-brand-400 transition active:scale-90 dark:text-brand-300"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>

        {showEditor ? (
          <form onSubmit={save}>
            <p className="mt-2 text-sm text-night-700/80 dark:text-brand-100/70">
              {quote ? 'وتەکەت دەستکاری بکە' : 'حەزت لێیە هیچ وتەیەک زیاد بکەیت بۆ ئەمڕۆ؟'}
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              dir="rtl"
              placeholder="وتەکەت لێرە بنووسە…"
              rows={2}
              autoFocus={editing}
              className="field mt-3 resize-none text-right"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                className="rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-95"
              >
                سەیڤی بکە
              </button>
              {/* Cancel is always available — just closes the editor, no changes. */}
              <button
                type="button"
                onClick={cancel}
                className="rounded-2xl bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 transition active:scale-95 dark:bg-night-700 dark:text-brand-200"
              >
                لێگەڕێ
              </button>
              {/* Delete only appears when there's an existing saved quote to erase. */}
              {quote && (
                <button
                  type="button"
                  onClick={clearQuote}
                  className="ms-auto px-2 py-2 text-sm font-semibold text-rose-500/70 transition hover:text-rose-600 active:scale-95 dark:text-rose-300/60 dark:hover:text-rose-300"
                >
                  ڕەشکردنەوە
                </button>
              )}
            </div>
          </form>
        ) : (
          // Default state — the saved quote in its large quoted style, or a soft
          // placeholder when empty. Either is clickable to (re)open the editor.
          <button type="button" onClick={startEdit} className="mt-2 block w-full text-right">
            {quote ? (
              <p className="text-lg font-medium leading-relaxed text-night-900 dark:text-brand-50">
                «{quote}»
              </p>
            ) : (
              <p className="leading-relaxed text-night-700/50 dark:text-brand-100/40">
                حەزت لێیە هیچ وتەیەک زیاد بکەیت بۆ ئەمڕۆ؟
              </p>
            )}
          </button>
        )}
      </div>
    </section>
  )
}

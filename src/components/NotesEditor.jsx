import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Save, FileText, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

// Format a note's timestamp as a compact, LTR-friendly date + time.
function formatWhen(ts) {
  const d = new Date(ts)
  const date = d.toLocaleDateString('en-GB') // dd/mm/yyyy
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${date} • ${time}`
}

/**
 * Notes editor for a single subject. The textarea at the top adds a new note to
 * the subject's list on "سەیڤی بکە" and then clears, ready for the next one.
 * Saved notes are shown below as dated cards, newest first, each deletable.
 */
export default function NotesEditor({ subjectId }) {
  const { getNotes, addNote, deleteNote } = useApp()
  const [text, setText] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  // Newest first; legacy notes (createdAt 0) naturally sort to the bottom.
  const notes = [...getNotes(subjectId)].sort((a, b) => b.createdAt - a.createdAt)
  const canSave = text.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    addNote(subjectId, text)
    setText('') // clear, ready for the next note
    setJustSaved(true)
  }

  const onChange = (e) => {
    setText(e.target.value)
    if (justSaved) setJustSaved(false)
  }

  // Auto-dismiss the green "saved" confirmation after 2 seconds.
  useEffect(() => {
    if (!justSaved) return
    const id = setTimeout(() => setJustSaved(false), 2000)
    return () => clearTimeout(id)
  }, [justSaved])

  const stateClass = justSaved
    ? 'bg-emerald-500 text-white'
    : canSave
      ? 'bg-brand-500 text-white hover:bg-brand-600'
      : 'cursor-not-allowed bg-brand-200 text-brand-500/50 shadow-none dark:bg-night-700 dark:text-brand-100/30'

  return (
    <div className="space-y-4">
      {/* Input area */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-night-700 dark:text-brand-100/80">
          <FileText size={18} />
          <span className="text-sm font-semibold">فۆرمول، پوختە و تێبینییە گرنگەکان</span>
        </div>

        <textarea
          value={text}
          onChange={onChange}
          dir="rtl"
          spellCheck={false}
          placeholder="لێرە تێبینییەکت بنووسە… بۆ نموونە فۆرمولێک، پوختەی وانەیەک، یان خاڵێکی گرنگ."
          className="field min-h-[140px] resize-y text-right leading-relaxed"
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={`btn w-full shadow-soft ${stateClass}`}
        >
          {justSaved ? (
            <>
              <Check size={20} /> سەیڤ کرا ✔️
            </>
          ) : (
            <>
              <Save size={20} /> سەیڤی بکە
            </>
          )}
        </button>
      </div>

      {/* Saved notes list */}
      {notes.length === 0 ? (
        <p className="py-6 text-center text-sm text-night-700/50 dark:text-brand-100/40">
          هیچ تێبینییەک نییە.
        </p>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {notes.map((note) => (
              <motion.li
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl bg-brand-50/70 p-4 dark:bg-night-700/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    dir="auto"
                    className="min-w-0 flex-1 whitespace-pre-wrap break-words leading-relaxed text-night-900 dark:text-brand-50"
                  >
                    {note.text}
                  </p>
                  <button
                    type="button"
                    onClick={() => deleteNote(subjectId, note.id)}
                    aria-label="سڕینەوەی تێبینی"
                    className="touch-target -mr-1 -mt-1 flex shrink-0 items-center justify-center rounded-xl text-rose-400 transition hover:bg-rose-100 active:scale-90 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {note.createdAt > 0 && (
                  <p
                    dir="ltr"
                    className="mt-2 text-left text-[11px] tabular-nums text-night-700/50 dark:text-brand-100/40"
                  >
                    {formatWhen(note.createdAt)}
                  </p>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}

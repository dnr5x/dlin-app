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
 * Notes editor for a single subject. Mirrors the Tasks structure: a single-line
 * Title field plus a Description textarea. "سەیڤی بکە" adds a new note to the
 * subject's list and clears the fields, ready for the next one. Saved notes are
 * shown below as cards (title bold, description softer beneath), newest first.
 */
export default function NotesEditor({ subjectId }) {
  const { getNotes, addNote, deleteNote } = useApp()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  // Newest first; legacy notes (timestamp 0) naturally sort to the bottom.
  const notes = [...getNotes(subjectId)].sort((a, b) => b.timestamp - a.timestamp)
  const canSave = title.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    addNote(subjectId, { title, description })
    setTitle('')
    setDescription('') // clear both, ready for the next note
    setJustSaved(true)
  }

  // Any edit cancels the lingering "saved" confirmation.
  const touch = () => justSaved && setJustSaved(false)

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
      {/* Input area: a Title field + a Description textarea, like Tasks. */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-night-700 dark:text-brand-100/80">
          <FileText size={18} />
          <span className="text-sm font-semibold">فۆرمول، پوختە و تێبینییە گرنگەکان</span>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            touch()
          }}
          dir="rtl"
          spellCheck={false}
          placeholder="سەردێڕی تێبینی (نموونە: یاساکانی وزە)..."
          className="field text-right font-semibold"
        />

        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            touch()
          }}
          dir="rtl"
          spellCheck={false}
          placeholder="وردەکاری و تێبینییە گرنگەکان..."
          className="field min-h-[120px] resize-y text-right leading-relaxed"
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
                  <div className="min-w-0 flex-1">
                    {/* Title — prominent. */}
                    <p
                      dir="auto"
                      className="break-words font-bold leading-snug text-night-900 dark:text-brand-50"
                    >
                      {note.title}
                    </p>
                    {/* Description — softer, slightly smaller, beneath the title. */}
                    {note.description && (
                      <p
                        dir="auto"
                        className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-night-700/60 dark:text-brand-100/50"
                      >
                        {note.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteNote(subjectId, note.id)}
                    aria-label="سڕینەوەی تێبینی"
                    className="touch-target -mr-1 -mt-1 flex shrink-0 items-center justify-center rounded-xl text-rose-400 transition hover:bg-rose-100 active:scale-90 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {note.timestamp > 0 && (
                  <p
                    dir="ltr"
                    className="mt-2 text-left text-[11px] tabular-nums text-night-700/50 dark:text-brand-100/40"
                  >
                    {formatWhen(note.timestamp)}
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

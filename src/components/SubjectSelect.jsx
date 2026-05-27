import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { SUBJECT_ICONS } from '../data/subjects.js'
import { useApp } from '../context/AppContext.jsx'

// Small gradient icon badge — mirrors the look used on the Subjects cards.
function SubjectBadge({ subject }) {
  const Icon = SUBJECT_ICONS[subject.id]
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${subject.gradient} text-white`}
    >
      {Icon ? <Icon size={16} /> : <span className="text-sm">{subject.emoji}</span>}
    </span>
  )
}

/**
 * Custom subject dropdown. Reads `subjects` straight from the shared AppContext
 * (the same store the Subjects page writes to), so adding/deleting a subject
 * there re-renders this list instantly — no local copy, no manual re-reads.
 */
export default function SubjectSelect({ value, onChange }) {
  const { subjects } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  const selected = subjects.find((s) => s.name === value)
  const empty = subjects.length === 0

  // Close when clicking outside the dropdown.
  useEffect(() => {
    if (!isOpen) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [isOpen])

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !empty && setIsOpen((o) => !o)}
        disabled={empty}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="field flex w-full items-center gap-2 text-right disabled:cursor-not-allowed disabled:opacity-60"
      >
        {empty ? (
          <span className="flex-1 text-night-700/50 dark:text-brand-100/40">پێویستە بابەت زیاد بکەیت</span>
        ) : selected ? (
          <>
            <SubjectBadge subject={selected} />
            <span className="flex-1 font-semibold text-night-900 dark:text-brand-50">
              {selected.name}
            </span>
          </>
        ) : (
          <span className="flex-1 text-night-700/50 dark:text-brand-100/40">بابەت هەڵبژێرە</span>
        )}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-brand-400"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && !empty && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="no-scrollbar absolute z-[60] mt-2 max-h-48 w-full overflow-y-auto overscroll-contain rounded-2xl border border-brand-200 bg-white p-1 shadow-card dark:border-night-600 dark:bg-night-800"
          >
            {subjects.map((s) => {
              const isSel = s.name === value
              return (
                <li key={s.id} role="option" aria-selected={isSel}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(s.name)
                      setIsOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right transition hover:bg-brand-50 active:scale-[0.99] dark:hover:bg-night-700 ${
                      isSel ? 'bg-brand-50 dark:bg-night-700' : ''
                    }`}
                  >
                    <SubjectBadge subject={s} />
                    <span className="flex-1 font-semibold text-night-900 dark:text-brand-50">
                      {s.name}
                    </span>
                    {isSel && <Check size={16} className="shrink-0 text-brand-500 dark:text-brand-300" />}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

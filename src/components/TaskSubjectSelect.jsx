import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { SUBJECT_ICONS } from '../data/subjects.js'

const MENU_WIDTH = 224 // px (≈ w-56)
const MENU_EST_HEIGHT = 240 // px, used only to decide flip direction

// Small gradient icon badge for a subject.
function Badge({ subject }) {
  const Icon = SUBJECT_ICONS[subject.id]
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${subject.gradient} text-white`}
    >
      {Icon ? <Icon size={12} /> : <span className="text-[9px]">{subject.emoji}</span>}
    </span>
  )
}

function Option({ subject, selected, onClick }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-right text-sm font-semibold transition hover:bg-brand-50 active:scale-[0.99] dark:hover:bg-night-700 ${
        selected ? 'bg-brand-50 dark:bg-night-700' : ''
      }`}
    >
      <Badge subject={subject} />
      <span className="flex-1 truncate text-night-900 dark:text-brand-50">{subject.name}</span>
      {selected && <Check size={14} className="shrink-0 text-brand-500 dark:text-brand-300" />}
    </button>
  )
}

/**
 * Custom dark-styled subject dropdown for the task input bar. The menu is
 * rendered in a portal (fixed position) so it escapes the card's stacking
 * context / overflow and always layers above the widgets below it. Grouped into
 * "وانەکانی ئەمڕۆ" and "بابەتەکانی تر".
 */
export default function TaskSubjectSelect({ todaySubjects, otherSubjects, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null) // { top, left }
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const selected = [...todaySubjects, ...otherSubjects].find((s) => s.id === value)

  // Compute the menu position from the trigger's viewport rect (flip up if
  // there isn't room below; clamp horizontally to the viewport).
  const updatePos = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const below = r.bottom + 8
    const top =
      below + MENU_EST_HEIGHT <= window.innerHeight
        ? below
        : Math.max(8, r.top - 8 - MENU_EST_HEIGHT)
    const left = Math.min(Math.max(8, r.left), window.innerWidth - MENU_WIDTH - 8)
    setPos({ top, left })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    updatePos()
    const onMove = () => updatePos()
    window.addEventListener('scroll', onMove, true) // capture inner scroll containers too
    window.addEventListener('resize', onMove)
    return () => {
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [open, updatePos])

  // Close on outside click (trigger + portaled menu are both "inside").
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const pick = (id) => {
    onChange(id)
    setOpen(false)
  }

  return (
    <div className="flex shrink-0">
      {/* Trigger — the left segment of the input bar */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-28 items-center gap-1 border-r border-brand-200 px-2 text-sm font-semibold text-brand-600 transition dark:border-night-600 dark:text-brand-200"
      >
        {selected ? (
          <>
            <Badge subject={selected} />
            <span className="flex-1 truncate text-right">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 truncate text-right text-night-700/50 dark:text-brand-100/40">
            بابەت
          </span>
        )}
        <ChevronDown
          size={14}
          className={`shrink-0 text-brand-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Portaled menu — fixed, above everything. */}
      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.div
              ref={menuRef}
              dir="rtl"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              role="listbox"
              style={{ position: 'fixed', top: pos.top, left: pos.left, width: MENU_WIDTH }}
              className="no-scrollbar z-[100] max-h-56 overflow-y-auto rounded-2xl border border-brand-200 bg-white p-1 shadow-2xl dark:border-night-600 dark:bg-night-800"
            >
              {todaySubjects.length > 0 && (
                <>
                  <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-bold uppercase text-brand-500 dark:text-brand-300">
                    وانەکانی ئەمڕۆ
                  </p>
                  {todaySubjects.map((s) => (
                    <Option
                      key={s.id}
                      subject={s}
                      selected={s.id === value}
                      onClick={() => pick(s.id)}
                    />
                  ))}
                </>
              )}
              {otherSubjects.length > 0 && (
                <>
                  <p className="px-2.5 pb-1 pt-2 text-[11px] font-bold uppercase text-night-700/50 dark:text-brand-100/40">
                    بابەتەکانی تر
                  </p>
                  {otherSubjects.map((s) => (
                    <Option
                      key={s.id}
                      subject={s}
                      selected={s.id === value}
                      onClick={() => pick(s.id)}
                    />
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

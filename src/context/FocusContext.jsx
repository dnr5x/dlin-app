import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Coffee, Timer, Zap, Play } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

/**
 * Global launcher for Focus mode — the heart of the app. Any component, from
 * anywhere, can start a focus session by calling `requestFocus(...)`:
 *
 *   const { requestFocus } = useFocusLauncher()
 *   requestFocus({ contextTitle: 'خوێندنی فیزیا', estimatedMinutes: 25 })
 *
 * The payload travels to the Focus page via router state:
 *   { contextTitle, contextDetail?, estimatedMinutes?, breakMinutes? }
 *
 * `contextDetail` is the optional task description, shown under the title in the
 * Focus UI. When `estimatedMinutes` is omitted we first pop a small, shared
 * picker so the student chooses a preset (study + break) or a fully custom time
 * — then route them in. The picker is rendered once here, so every entry point
 * feels identical.
 */
const FocusLauncherContext = createContext(null)

// Quick-pick presets: study minutes + matching break minutes + a friendly label.
const PRESETS = [
  { work: 10, brk: 2, label: 'خێرا', Icon: Zap },
  { work: 15, brk: 3, label: 'کورت', Icon: Coffee },
  { work: 25, brk: 5, label: 'پۆمۆدۆرۆ', Icon: Timer },
  { work: 45, brk: 10, label: 'قووڵ', Icon: Brain },
]

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.round(v)))

export function FocusProvider({ children }) {
  const navigate = useNavigate()
  // The title awaiting a choice; non-null means the picker is open.
  const [pending, setPending] = useState(null)
  // Custom-timer inputs (kept as strings so the fields can be cleared mid-edit).
  const [customWork, setCustomWork] = useState('30')
  const [customBreak, setCustomBreak] = useState('5')
  // The last durations actually used (written by the Focus page) — powers the
  // one-tap "resume" fast path.
  const [lastFocus] = useLocalStorage('dlin:lastFocus', null)

  // Route into Focus mode with the full payload.
  const go = useCallback(
    (contextTitle, contextDetail, estimatedMinutes, breakMinutes) => {
      setPending(null)
      navigate('/focus', { state: { contextTitle, contextDetail, estimatedMinutes, breakMinutes } })
    },
    [navigate]
  )

  // Public action. Resolution order:
  //  1. explicit `estimatedMinutes` → straight in with those.
  //  2. a remembered `lastFocus` (and not forced to choose) → one-tap resume.
  //  3. otherwise → open the picker (first run, or `choose: true`).
  const requestFocus = useCallback(
    ({ contextTitle, contextDetail, estimatedMinutes, breakMinutes, choose } = {}) => {
      const title = (contextTitle || '').trim()
      const detail = (contextDetail || '').trim()
      if (estimatedMinutes != null) {
        go(title, detail, estimatedMinutes, breakMinutes)
      } else if (!choose && lastFocus?.work) {
        go(title, detail, lastFocus.work, lastFocus.break)
      } else {
        setPending({ contextTitle: title, contextDetail: detail })
      }
    },
    [go, lastFocus]
  )

  const value = useMemo(() => ({ requestFocus }), [requestFocus])

  const startCustom = () => {
    go(
      pending.contextTitle,
      pending.contextDetail,
      clamp(Number(customWork) || 0, 1, 180),
      clamp(Number(customBreak) || 0, 1, 60)
    )
  }

  return (
    <FocusLauncherContext.Provider value={value}>
      {children}

      {/* Shared picker — one beautiful sheet for every entry point. */}
      <Modal open={!!pending} onClose={() => setPending(null)} title="چەند خولەک سەعی دەکەیت؟">
        {pending?.contextTitle && (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-brand-50 px-4 py-2.5 text-center text-sm font-semibold text-brand-700 dark:bg-night-700/50 dark:text-brand-200">
            <Timer size={16} className="shrink-0" />
            <span>سەعی لەسەر: {pending.contextTitle}</span>
          </div>
        )}

        {/* Presets — each shows its study time AND its break time. */}
        <div className="grid grid-cols-2 gap-3">
          {PRESETS.map(({ work, brk, label, Icon }) => (
            <motion.button
              key={work}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => go(pending.contextTitle, pending.contextDetail, work, brk)}
              className="flex flex-col items-center gap-1 rounded-2xl border-2 border-brand-200 bg-white px-3 py-4 text-center transition hover:border-brand-400 hover:bg-brand-50 dark:border-night-600 dark:bg-night-700 dark:hover:border-brand-400 dark:hover:bg-night-600"
            >
              <Icon size={20} className="text-brand-500 dark:text-brand-300" />
              <span className="text-sm font-extrabold text-night-900 dark:text-brand-50">
                {work} خولەک سەعی
              </span>
              <span className="text-[11px] font-semibold text-night-700/60 dark:text-brand-100/50">
                {brk} خولەک پشوو · {label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Custom timer — exact study + break minutes. */}
        <div className="mt-5 border-t border-brand-100 pt-4 dark:border-night-700">
          <h3 className="mb-3 text-sm font-bold text-night-900 dark:text-brand-50">کاتی خۆت</h3>
          <div className="flex items-end gap-3">
            <CustomField label="سەعی (خولەک)" value={customWork} onChange={setCustomWork} max={180} />
            <CustomField label="پشوو (خولەک)" value={customBreak} onChange={setCustomBreak} max={60} />
          </div>
          <button
            type="button"
            onClick={startCustom}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-95"
          >
            <Play size={18} /> با دەست پێبکەین!
          </button>
        </div>
      </Modal>
    </FocusLauncherContext.Provider>
  )
}

function CustomField({ label, value, onChange, max }) {
  return (
    <label className="flex-1 space-y-1.5">
      <span className="block text-xs font-semibold text-night-700/70 dark:text-brand-100/60">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir="ltr"
        className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-center text-lg font-bold tabular-nums text-night-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:border-night-600 dark:bg-night-700 dark:text-brand-50"
      />
    </label>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFocusLauncher() {
  const ctx = useContext(FocusLauncherContext)
  if (!ctx) throw new Error('useFocusLauncher must be used inside <FocusProvider>')
  return ctx
}

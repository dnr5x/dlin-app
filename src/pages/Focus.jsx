import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Brain, Coffee, Minus, Plus, Target, ChevronDown } from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'
import Modal from '../components/Modal.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { SUBJECT_ICONS } from '../data/subjects.js'

// Completion chimes, synthesised with the Web Audio API (no audio assets).
//  • 'work'  → a bright, rewarding rising arpeggio (E5→A5→E6) to celebrate a
//    finished study session.
//  • 'break' → a softer, lower, settling two-note (C5→G4) that gently nudges the
//    student to resume studying.
function playChime(kind = 'work') {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    const WORK = [
      { f: 659.25, type: 'sine' }, // E5
      { f: 880.0, type: 'sine' }, // A5
      { f: 1318.51, type: 'triangle' }, // E6 — bright finish
    ]
    const BREAK = [
      { f: 523.25, type: 'sine' }, // C5
      { f: 392.0, type: 'sine' }, // G4 — calm, settling
    ]
    const notes = kind === 'break' ? BREAK : WORK
    const peak = kind === 'break' ? 0.18 : 0.26 // breaks a touch quieter
    notes.forEach(({ f, type }, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.value = f
      const t = ctx.currentTime + i * 0.16
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(peak, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.65)
    })
    setTimeout(() => ctx.close(), 1800)
  } catch {
    /* audio not available — the visual cue still fires */
  }
}

const R = 120 // ring radius
const CIRC = 2 * Math.PI * R
const clampMin = (m) => Math.min(90, Math.max(1, Math.round(m)))

export default function Focus() {
  const { pomodoro, setPomodoro, addXp, addCompletedSession, subjects } = useApp()

  // Global focus payload, delivered via router state from any "Start Focusing"
  // action across the app: { contextTitle, estimatedMinutes? }. The title says
  // exactly what we're focusing on; an estimate (if given) overrides the work
  // duration for this session only — the saved default is left untouched.
  const { state: focusCtx } = useLocation()
  const contextTitle = focusCtx?.contextTitle?.trim() || ''
  const contextDetail = focusCtx?.contextDetail?.trim() || ''
  const overrideWork =
    focusCtx?.estimatedMinutes != null ? clampMin(focusCtx.estimatedMinutes) : null
  const overrideBreak =
    focusCtx?.breakMinutes != null ? clampMin(focusCtx.breakMinutes) : null

  // The student can re-point the session at a subject from inside Focus mode;
  // the chosen subject overrides whatever context we arrived with.
  const [subjectOverride, setSubjectOverride] = useState(null)
  const [subjectPickerOpen, setSubjectPickerOpen] = useState(false)
  const activeTitle = subjectOverride || contextTitle
  const focusLabel = activeTitle ? `سەعی لەسەر: ${activeTitle}` : 'سەعیی گشتی'

  const [mode, setMode] = useState('work') // 'work' | 'break'
  const [running, setRunning] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [earnedXp, setEarnedXp] = useState(0) // points from the last completed session

  // Study / break lengths (minutes). Seeded from the payload when present (a
  // one-off override), otherwise from the saved defaults.
  const [workMin, setWorkMin] = useState(() => overrideWork ?? pomodoro.work)
  const [breakMin, setBreakMin] = useState(() => overrideBreak ?? pomodoro.break)

  // Remember the durations actually used, so contextual focus actions can
  // "resume last focus" in one tap instead of re-prompting the picker.
  const [, setLastFocus] = useLocalStorage('dlin:lastFocus', null)
  useEffect(() => {
    setLastFocus({ work: workMin, break: breakMin })
  }, [workMin, breakMin, setLastFocus])

  const totalSeconds = (mode === 'work' ? workMin : breakMin) * 60
  const [remaining, setRemaining] = useState(totalSeconds)
  const tick = useRef(null)

  // Re-sync the clock when the mode or its configured duration changes, but
  // only while the timer is idle (don't disrupt a running session). `running`
  // is intentionally NOT a dependency: otherwise pausing (running → false)
  // would re-fire this and snap the clock back to the full duration. Pausing
  // must freeze `remaining` exactly where it is.
  useEffect(() => {
    if (!running) setRemaining(totalSeconds)
  }, [totalSeconds]) // eslint-disable-line react-hooks/exhaustive-deps

  // A single ticking interval while running — it ONLY decrements the clock, so
  // it keeps ticking seamlessly across an automatic study→break transition
  // (where `running` stays true and this effect isn't torn down).
  useEffect(() => {
    if (!running) return undefined
    tick.current = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0))
    }, 1000)
    return () => clearInterval(tick.current)
  }, [running])

  // When the clock reaches 00:00 mid-session, finish it. Kept out of the ticking
  // updater above so it stays a pure function (no double-fire in StrictMode).
  useEffect(() => {
    if (!running || remaining > 0) return
    finishSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, running])

  // Clear the celebration flourish after a moment.
  useEffect(() => {
    if (!celebrate) return undefined
    const id = setTimeout(() => setCelebrate(false), 2500)
    return () => clearTimeout(id)
  }, [celebrate])

  // Finish the current session: reward a study session, then roll into the next
  // mode. A study session AUTO-STARTS the break (seamless, no manual tap); a
  // break ends and waits for the student to choose to study again.
  const finishSession = () => {
    const wasWork = mode === 'work'
    playChime(wasWork ? 'work' : 'break') // rewarding for study, gentle nudge after a break
    if (navigator.vibrate) navigator.vibrate([200, 100, 200])

    if (wasWork) {
      addXp(50)
      addCompletedSession()
    }
    setEarnedXp(wasWork ? 50 : 0)
    setCelebrate(true)

    const nextMode = wasWork ? 'break' : 'work'
    setMode(nextMode)
    setRemaining((nextMode === 'work' ? workMin : breakMin) * 60)
    setRunning(wasWork) // true → break auto-starts; false → stop after a break
  }

  const reset = () => {
    setRunning(false)
    setRemaining(totalSeconds)
  }

  const switchMode = (m) => {
    setRunning(false)
    setMode(m)
    setRemaining((m === 'work' ? workMin : breakMin) * 60)
  }

  // Each length nudges this session. With no override it also writes through to
  // the saved default (the original behaviour); an override stays local so it
  // never clobbers the student's preferred defaults.
  const adjustWork = (delta) => {
    const next = clampMin(workMin + delta)
    setWorkMin(next)
    if (overrideWork == null) setPomodoro((p) => ({ ...p, work: next }))
  }

  const adjustBreak = (delta) => {
    const next = Math.min(60, Math.max(1, breakMin + delta))
    setBreakMin(next)
    if (overrideBreak == null) setPomodoro((p) => ({ ...p, break: next }))
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0

  // Status line under the controls, precise to the timer's state:
  //  • running                       → encouragement
  //  • paused part-way (remaining < total) → resume hint
  //  • fresh / just reset (remaining === total) → start prompt
  const statusText = running
    ? 'بەردەوام بە! سەرت لە سەعییەکەت بێت 🔥'
    : remaining < totalSeconds
      ? 'وەستا ⏸️ کەی ئامادە بوویت، بەردەوام بە.'
      : 'ئامادەی دەست پێبکە 👆'

  return (
    <PageTransition>
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-extrabold text-night-900 dark:text-brand-50">کاتی سەعی</h1>
        <p className="mt-1 text-night-700/80 dark:text-brand-100/70">
          کاتت دیاری بکە و دەست بکە بە سەعی 💪
        </p>
      </header>

      {/* What we're focusing on — a clickable subject selector. Tapping it lets
          the student re-point the session at any subject without leaving Focus.
          The task description (if any) shows beneath, until a subject is chosen. */}
      <div className="mx-auto mb-5 max-w-xs">
        <button
          type="button"
          onClick={() => setSubjectPickerOpen(true)}
          aria-haspopup="dialog"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 transition active:scale-[0.98] dark:bg-night-700/50 dark:text-brand-200"
        >
          <Target size={16} className="shrink-0" />
          <span className="min-w-0 truncate">{focusLabel}</span>
          <ChevronDown size={16} className="shrink-0 text-brand-400" />
        </button>
        {!subjectOverride && contextDetail && (
          <p className="mt-2 whitespace-pre-wrap text-center text-xs leading-relaxed text-night-700/75 dark:text-brand-100/65">
            {contextDetail}
          </p>
        )}
      </div>

      {/* Mode switch */}
      <div className="mx-auto mb-6 grid max-w-xs grid-cols-2 gap-2 rounded-2xl bg-brand-100 p-1 dark:bg-night-700">
        <ModeTab active={mode === 'work'} onClick={() => switchMode('work')} Icon={Brain}>
          سەعی
        </ModeTab>
        <ModeTab active={mode === 'break'} onClick={() => switchMode('break')} Icon={Coffee}>
          پشوو
        </ModeTab>
      </div>

      {/* Circular timer */}
      <div className="relative mx-auto flex h-72 w-72 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 280 280">
          <circle
            cx="140"
            cy="140"
            r={R}
            fill="none"
            strokeWidth="16"
            className="stroke-brand-100 dark:stroke-night-700"
          />
          <motion.circle
            cx="140"
            cy="140"
            r={R}
            fill="none"
            strokeWidth="16"
            strokeLinecap="round"
            className={mode === 'work' ? 'stroke-brand-500' : 'stroke-emerald-400'}
            strokeDasharray={CIRC}
            animate={{ strokeDashoffset: CIRC * (1 - progress) }}
            // Smooth sweep only while ticking. When stopped/paused (e.g. rapidly
            // tapping +/- to adjust the duration) update instantly, so stacked
            // 0.5s animations can't fight each other and glitch the ring out.
            transition={{ duration: running ? 0.5 : 0, ease: 'linear' }}
          />
        </svg>

        <motion.div
          animate={celebrate ? { scale: [1, 1.08, 1] } : {}}
          transition={{ repeat: celebrate ? 2 : 0, duration: 0.5 }}
          className="absolute flex flex-col items-center"
        >
          <span dir="ltr" className="text-6xl font-extrabold tabular-nums text-night-900 dark:text-brand-50">
            {mm}:{ss}
          </span>
          <span className="mt-2 text-sm font-semibold text-brand-500 dark:text-brand-300">
            {celebrate
              ? earnedXp
                ? `🎉 +${earnedXp} خاڵ ⭐️`
                : '🎉 دەستخۆش!'
              : mode === 'work'
                ? 'کاتی سەعی'
                : 'کاتی پشوو'}
          </span>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-4">
        <button onClick={reset} aria-label="ڕێکخستنەوە" className="btn-ghost h-14 w-14 !rounded-full !px-0">
          <RotateCcw size={24} />
        </button>
        <motion.button
          onClick={() => setRunning((r) => !r)}
          className="btn-primary h-20 w-20 !rounded-full !px-0 text-lg shadow-soft"
          aria-label={running ? 'وەستان' : 'دەستپێکردن'}
          // Breathe gently while idle to invite a tap; hold steady while running.
          animate={running ? { scale: 1 } : { scale: [1, 1.06, 1] }}
          transition={running ? {} : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          whileTap={{ scale: 0.92 }}
        >
          {running ? <Pause size={32} /> : <Play size={32} className="mr-1" />}
        </motion.button>
        <div className="h-14 w-14" aria-hidden="true" />
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-night-700/70 dark:text-brand-100/60">
        {statusText}
      </p>

      {/* Duration settings */}
      <section className="card mx-auto mt-7 max-w-xs space-y-3 p-4">
        <h2 className="text-sm font-bold text-night-900 dark:text-brand-50">کاتەکان دیاری بکە</h2>
        <DurationRow
          label="ماوەی سەعی"
          value={workMin}
          onDec={() => adjustWork(-1)}
          onInc={() => adjustWork(1)}
        />
        <DurationRow
          label="ماوەی پشوو"
          value={breakMin}
          onDec={() => adjustBreak(-1)}
          onInc={() => adjustBreak(1)}
        />
      </section>

      {/* Subject selector — change what we're focusing on without leaving Focus. */}
      <Modal
        open={subjectPickerOpen}
        onClose={() => setSubjectPickerOpen(false)}
        title="سەعی لەسەر چی بکەین؟"
      >
        {subjects.length === 0 ? (
          <p className="py-4 text-center text-sm text-night-700/60 dark:text-brand-100/50">
            هێشتا هیچ بابەتێکت نییە.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {subjects.map((s) => {
              const Icon = SUBJECT_ICONS[s.id]
              const active = subjectOverride === s.name
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSubjectOverride(s.name)
                    setSubjectPickerOpen(false)
                  }}
                  className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-right transition active:scale-[0.98] ${
                    active
                      ? 'border-brand-400 bg-brand-50 dark:border-brand-400 dark:bg-night-600'
                      : 'border-brand-200 bg-white hover:border-brand-400 hover:bg-brand-50 dark:border-night-600 dark:bg-night-700 dark:hover:border-brand-400'
                  }`}
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
        )}
      </Modal>
    </PageTransition>
  )
}

function ModeTab({ active, onClick, Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`touch-target flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-white text-brand-700 shadow dark:bg-night-800 dark:text-brand-200'
          : 'text-night-700/60 dark:text-brand-100/60'
      }`}
    >
      <Icon size={18} /> {children}
    </button>
  )
}

function DurationRow({ label, value, onDec, onInc }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-night-700 dark:text-brand-100/80">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onDec}
          aria-label="کەمکردنەوە"
          className="touch-target flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-night-700 dark:text-brand-100"
        >
          <Minus size={18} />
        </button>
        <span className="w-16 text-center text-lg font-bold tabular-nums text-night-900 dark:text-brand-50">
          {value} خ
        </span>
        <button
          onClick={onInc}
          aria-label="زیادکردن"
          className="touch-target flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-night-700 dark:text-brand-100"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  )
}

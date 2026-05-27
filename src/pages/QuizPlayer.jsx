import { useMemo, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check, X, RotateCcw, Trophy } from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import Confetti from '../components/Confetti.jsx'
import { useApp } from '../context/AppContext.jsx'

// Fisher–Yates shuffle for question variety on each run.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Warm, encouraging feedback based on the final percentage.
function feedback(pct) {
  if (pct === 100) return { emoji: '🏆', text: 'تەواو بێ هەڵە! تۆ نایابیت دلین!' }
  if (pct >= 80) return { emoji: '🌟', text: 'زۆر باش! نزیکیت لە تەواوی.' }
  if (pct >= 50) return { emoji: '💪', text: 'باشە! بە مەشقی زیاتر باشتر دەبیت.' }
  return { emoji: '🌱', text: 'سەرەتایەکی باشە — دووبارەی بکەرەوە و بەهێزتر دەبیت!' }
}

export default function QuizPlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getQuizItems, getSubject } = useApp()
  const subject = getSubject(id)

  // Build a stable, shuffled set of MCQ questions for this session. The filter
  // also skips any legacy flashcard items that may remain in storage.
  const questions = useMemo(
    () => shuffle(getQuizItems(id).filter((q) => q.type === 'mcq')),
    [id] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  if (!subject) return <Navigate to="/subjects" replace />
  if (questions.length === 0) return <Navigate to={`/subjects/${id}`} replace />

  const q = questions[current]
  const isLast = current === questions.length - 1
  const answered = selected !== null

  const choose = (i) => {
    if (answered) return
    setSelected(i)
    if (i === q.correctIndex) setScore((s) => s + 1)
  }

  const next = () => {
    if (isLast) {
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  const restart = () => {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  // ---- Results screen ----
  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    const fb = feedback(pct)
    return (
      <PageTransition>
        {/* Celebrate good results with a confetti burst. */}
        {pct >= 50 && <Confetti count={pct === 100 ? 60 : 40} />}
        <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
          <motion.div
            initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 to-blush-300 text-5xl shadow-soft"
          >
            <motion.span
              animate={{ rotate: [0, -10, 10, -6, 0], y: [0, -4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
            >
              {fb.emoji}
            </motion.span>
          </motion.div>
          <div>
            <p className="text-sm text-brand-500 dark:text-brand-300">ئەنجامەکەت</p>
            <p dir="ltr" className="mt-1 text-4xl font-extrabold text-night-900 dark:text-brand-50">
              <AnimatedNumber value={score} /> / {questions.length}
            </p>
            <p dir="ltr" className="mt-1 text-lg font-semibold text-brand-600 dark:text-brand-300">
              <AnimatedNumber value={pct} />%
            </p>
          </div>
          <p className="max-w-xs text-night-700 dark:text-brand-100/80">{fb.text}</p>

          <div className="mt-2 flex w-full max-w-xs gap-3">
            <button onClick={restart} className="btn-ghost flex-1">
              <RotateCcw size={18} /> دووبارە
            </button>
            <button onClick={() => navigate(`/subjects/${id}`)} className="btn-primary flex-1">
              تەواوبوون
            </button>
          </div>
        </div>
      </PageTransition>
    )
  }

  // ---- Question screen ----
  const progress = ((current + (answered ? 1 : 0)) / questions.length) * 100

  return (
    <PageTransition>
      {/* Header */}
      <header className="mb-5">
        <button
          onClick={() => navigate(`/subjects/${id}`)}
          className="touch-target -mr-2 mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300"
        >
          <ChevronRight size={18} /> دەرچوون لە کویز
        </button>
        <div className="flex items-center justify-between text-sm text-night-700/70 dark:text-brand-100/60">
          <span>{subject.name}</span>
          <span className="flex items-center gap-1">
            <Trophy size={16} className="text-amber-500" /> {score}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-100 dark:bg-night-700">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-brand-400 to-brand-600"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="mt-1 text-xs text-night-700/60 dark:text-brand-100/50">
          پرسیار {current + 1} لە {questions.length}
        </p>
      </header>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
        >
          <div className="card mb-5 p-5">
            <p className="text-lg font-bold leading-relaxed text-night-900 dark:text-brand-50">
              {q.question}
            </p>
          </div>

          <div className="space-y-3">
            {(q.options ?? []).map((opt, i) => {
              const isCorrect = i === q.correctIndex
              const isChosen = i === selected
              let style =
                'border-brand-200 bg-white dark:border-night-600 dark:bg-night-800'
              if (answered && isCorrect)
                style = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/15'
              else if (answered && isChosen && !isCorrect)
                style = 'border-rose-400 bg-rose-50 dark:bg-rose-500/15'

              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={answered}
                  className={`touch-target flex w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-4 text-right font-medium transition active:scale-[0.98] ${style}`}
                >
                  <span className="text-night-900 dark:text-brand-50">{opt}</span>
                  {answered && isCorrect && <Check className="shrink-0 text-emerald-500" size={22} />}
                  {answered && isChosen && !isCorrect && (
                    <X className="shrink-0 text-rose-500" size={22} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Inline feedback + next */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5"
              >
                <p
                  className={`mb-3 text-center font-semibold ${
                    selected === q.correctIndex ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {selected === q.correctIndex ? 'وەڵامی ڕاست! 🎉' : 'وەڵامەکە هەڵە بوو.'}
                </p>
                <button onClick={next} className="btn-primary w-full">
                  {isLast ? 'بینینی ئەنجام' : 'پرسیاری دواتر'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </PageTransition>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check, ChevronDown, PlayCircle, CalendarClock } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import StartFocusButton from './StartFocusButton.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

// Parse a target-score input to a clean integer percentage: digits only, no
// leading zeros, empty → 0, clamped to 0–100.
const clampScore = (v) =>
  Math.max(0, Math.min(100, Math.floor(Number(String(v).replace(/[^\d]/g, '')) || 0)))

// Whole days from today (local midnight) until the exam date. Shared with the
// Home "next exam" summary card.
export function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exam = new Date(`${dateStr}T00:00:00`)
  return Math.round((exam - today) / 86400000)
}

// Urgency palette: >20 → soft green, 5–20 → soft orange, <5 (incl. today/past) → soft red.
export function urgencyClass(days) {
  if (days < 5) return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
  if (days <= 20) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
}

export function daysLabel(days) {
  if (days > 0) return `${days} ڕۆژ`
  if (days === 0) return 'ئەمڕۆیە!'
  return 'تێپەڕیوە'
}

// Sub-topic title / description with backward-compat: topics created before the
// title+description split stored a single `text` field — treat it as the title.
const topicTitle = (t) => (t.title ?? t.text ?? '').trim()
const topicDescription = (t) => (t.description ?? '').trim()

/**
 * "خشتەی تاقیکردنەوەکان" — add exams (subject + date), auto-count the days left
 * with urgency colors, and expand each one for a target score and a study
 * checklist. Persisted in localStorage.
 */
export default function ExamPlanner() {
  const [exams, setExams] = useLocalStorage('dlin:exams', [])

  const patchExam = (id, patch) =>
    setExams((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)))
  const removeExam = (id) => setExams((prev) => prev.filter((ex) => ex.id !== id))

  const addTopic = (examId, title, description) =>
    setExams((prev) =>
      prev.map((ex) =>
        ex.id === examId
          ? {
              ...ex,
              topics: [
                ...(ex.topics ?? []),
                { id: newId(), title: title.trim(), description: (description || '').trim(), done: false },
              ],
            }
          : ex
      )
    )
  const toggleTopic = (examId, topicId) =>
    setExams((prev) =>
      prev.map((ex) =>
        ex.id === examId
          ? { ...ex, topics: (ex.topics ?? []).map((t) => (t.id === topicId ? { ...t, done: !t.done } : t)) }
          : ex
      )
    )
  const removeTopic = (examId, topicId) =>
    setExams((prev) =>
      prev.map((ex) =>
        ex.id === examId ? { ...ex, topics: (ex.topics ?? []).filter((t) => t.id !== topicId) } : ex
      )
    )

  // Soonest first.
  const sorted = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date))

  // Exam creation now lives solely in the global "+" hub; this is a pure list.
  if (sorted.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-500 dark:bg-night-700 dark:text-brand-300">
          <CalendarClock size={30} />
        </span>
        <p className="mt-1 font-bold text-night-900 dark:text-brand-50">
          هیچ تاقیکردنەوەیەکت لە پێشە نییە
        </p>
        <p className="text-sm text-night-700/60 dark:text-brand-100/50">
          لێیگەڕێ یان بە دوگمەی ‎+‎ تاقیکردنەوەیەک زیاد بکە.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {sorted.map((ex) => (
        <ExamItem
          key={ex.id}
          exam={ex}
          days={daysUntil(ex.date)}
          onPatch={patchExam}
          onRemove={removeExam}
          onAddTopic={addTopic}
          onToggleTopic={toggleTopic}
          onRemoveTopic={removeTopic}
        />
      ))}
    </ul>
  )
}

function ExamItem({ exam, days, onPatch, onRemove, onAddTopic, onToggleTopic, onRemoveTopic }) {
  const [open, setOpen] = useState(false)
  const [topicText, setTopicText] = useState('')
  const [topicDesc, setTopicDesc] = useState('')
  const [confirmDel, setConfirmDel] = useState(false) // delete-confirmation dialog

  const submitTopic = (e) => {
    e.preventDefault()
    const t = topicText.trim()
    if (!t) return
    onAddTopic(exam.id, t, topicDesc)
    setTopicText('')
    setTopicDesc('')
  }

  // Normalise once so a legacy/undefined topics list can never crash a render.
  const topics = exam.topics ?? []
  const doneCount = topics.filter((t) => t.done).length
  const pct = topics.length ? Math.round((doneCount / topics.length) * 100) : 0

  return (
    <li className="card overflow-hidden">
      {/* Header (always visible): days-left badge, subject + date, target, chevron. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-3 text-right transition active:scale-[0.99]"
      >
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${urgencyClass(days)}`}>
          {daysLabel(days)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold text-night-900 dark:text-brand-50">
            {exam.subject}
          </span>
          <span dir="ltr" className="block text-xs tabular-nums text-night-700/55 dark:text-brand-100/45">
            {exam.date}
          </span>
        </span>
        <span
          dir="ltr"
          className="shrink-0 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-night-700 dark:text-brand-200"
          title="ئامانج"
        >
          {exam.target ?? 0}٪
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 text-brand-400">
          <ChevronDown size={16} />
        </motion.span>
      </button>

      {/* Progress bar — glanceable even when the card is collapsed. */}
      {topics.length > 0 && (
        <div className="h-1.5 w-full bg-brand-100/70 dark:bg-night-700">
          <motion.div
            className="h-full rounded-l-full bg-green-400 dark:bg-green-500"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-3 pb-3">
              {/* Target score */}
              <div className="flex items-center gap-2 text-sm font-semibold text-night-900 dark:text-brand-50">
                <span>🎯 ئامانج:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={String(exam.target ?? 0)}
                  onChange={(e) => onPatch(exam.id, { target: clampScore(e.target.value) })}
                  dir="ltr"
                  className="w-16 rounded-xl border border-brand-200 bg-white px-2 py-1 text-center tabular-nums outline-none focus:border-brand-400 dark:border-night-600 dark:bg-night-700 dark:text-brand-50"
                />
                <span>٪</span>
              </div>

              {/* Syllabus checklist */}
              <div>
                <p className="mb-1.5 text-xs font-semibold text-night-700/70 dark:text-brand-100/60">
                  بابەتەکانی سەعی{' '}
                  {topics.length > 0 && (
                    <span dir="ltr" className="tabular-nums">
                      ({doneCount}/{topics.length})
                    </span>
                  )}
                </p>
                <form onSubmit={submitTopic} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={topicText}
                      onChange={(e) => setTopicText(e.target.value)}
                      dir="rtl"
                      placeholder="بابەتێک زیاد بکە (نموونە: ڕێزمان)"
                      className="field flex-1 !py-2 text-right"
                    />
                    <button
                      type="submit"
                      aria-label="زیادکردنی بابەت"
                      className="flex shrink-0 items-center justify-center rounded-xl bg-brand-100 px-2.5 text-brand-700 transition active:scale-90 dark:bg-night-600 dark:text-brand-100"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  {/* Optional details for the sub-topic — softer & smaller. */}
                  <input
                    value={topicDesc}
                    onChange={(e) => setTopicDesc(e.target.value)}
                    dir="rtl"
                    placeholder="وردەکاری زیاتر (ئارەزوومەندانە)…"
                    className="field !py-2 text-right text-xs"
                  />
                </form>

                {topics.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {topics.map((t) => (
                      <li
                        key={t.id}
                        className={`flex items-start gap-2 rounded-xl px-2 py-1.5 transition-colors ${
                          t.done ? 'bg-green-50 dark:bg-emerald-500/10' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onToggleTopic(exam.id, t.id)}
                          className="flex flex-1 items-start gap-2 text-right"
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                              t.done
                                ? 'border-green-500 bg-green-100 text-green-600 dark:border-green-500 dark:bg-green-500/20 dark:text-green-400'
                                : 'border-brand-300 text-transparent dark:border-night-500'
                            }`}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block text-sm transition ${
                                t.done
                                  ? 'text-gray-400 line-through dark:text-brand-100/30'
                                  : 'text-night-900 dark:text-brand-50'
                              }`}
                            >
                              {topicTitle(t)}
                            </span>
                            {topicDescription(t) && (
                              <span
                                className={`mt-0.5 block text-xs transition ${
                                  t.done
                                    ? 'text-gray-300 line-through dark:text-brand-100/20'
                                    : 'text-night-700/55 dark:text-brand-100/45'
                                }`}
                              >
                                {topicDescription(t)}
                              </span>
                            )}
                          </span>
                        </button>
                        {/* Mini-Focus — study THIS sub-topic; carries the
                            "[Subject] - [Sub-topic]" title AND its details into Focus. */}
                        <StartFocusButton
                          iconOnly
                          icon={PlayCircle}
                          contextTitle={`${exam.subject} - ${topicTitle(t)}`}
                          contextDetail={topicDescription(t)}
                          className="mt-0.5 shrink-0 rounded-lg p-1 text-brand-500 transition hover:bg-brand-100 active:scale-90 dark:text-brand-300 dark:hover:bg-night-700"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveTopic(exam.id, t.id)}
                          aria-label="سڕینەوە"
                          className="mt-0.5 shrink-0 text-night-700/30 transition hover:text-rose-500 active:scale-90 dark:text-brand-100/30"
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <StartFocusButton
                  contextTitle={`سەعی بۆ تاقیکردنەوەی ${exam.subject}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-95"
                />
                <button
                  type="button"
                  onClick={() => setConfirmDel(true)}
                  aria-label="سڕینەوەی تاقیکردنەوە"
                  className="flex items-center justify-center rounded-2xl bg-rose-100 px-3 py-2.5 text-rose-600 transition active:scale-95 dark:bg-rose-500/15 dark:text-rose-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm before deleting an exam (and all its topics). */}
      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={() => onRemove(exam.id)}
        message="دڵنیایت ئەم تاقیکردنەوەیە بسڕیتەوە؟"
      />
    </li>
  )
}

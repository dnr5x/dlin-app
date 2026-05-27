import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ListChecks, Check, Trash2, Repeat, PlayCircle } from 'lucide-react'
import { SUBJECT_ICONS } from '../data/subjects.js'
import { useApp } from '../context/AppContext.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { KURDISH_DAYS, dateKey, taskDateKey, taskTitle, taskDescription } from '../lib/tasks.js'
import StartFocusButton from './StartFocusButton.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'

/**
 * "ئەرکەکانی ئەمڕۆ" — the Home dashboard's read-only summary of today's tasks.
 *
 * Adding tasks now lives in the global Creation Hub (the "+" FAB), so this stays
 * a clean list: today's one-off tasks and this weekday's recurring tasks, shown
 * in two clearly separated sections. Each row can be checked off, sent to Focus,
 * or deleted (with confirmation).
 */
export default function TodoWidget() {
  const { subjects } = useApp()
  const [todos, setTodos] = useLocalStorage('dlin:todos', [])
  const [toDelete, setToDelete] = useState(null) // task id pending delete confirmation
  const [confirmClear, setConfirmClear] = useState(false) // "clear today's tasks" confirmation

  // "Today" as a weekday index (0-6), a toDateString key (per-day "done"
  // tracking), an exact YYYY-MM-DD key (anchors one-offs), and its Kurdish name.
  const today = new Date().getDay()
  const todayStr = new Date().toDateString()
  const todayKey = dateKey()
  const todayName = KURDISH_DAYS[today]

  // Which tasks belong on today's list:
  //  • Recurring → shows when td.dayOfWeek === today's weekday.
  //  • One-off   → shows ONLY when its exact date equals today's date key; it can
  //    never appear on any other day, not even the same weekday next week.
  const visibleTodos = todos.filter((td) =>
    td.isRecurring ? td.dayOfWeek === today : taskDateKey(td) === todayKey
  )

  // Split into the two categories shown as separate sections in the list.
  const oneOffTasks = visibleTodos.filter((td) => !td.isRecurring)
  const recurringTasks = visibleTodos.filter((td) => td.isRecurring)

  // Recurring tasks reset each occurrence: "done" means done *today*.
  const isDone = (td) => (td.isRecurring ? td.doneDate === todayStr : !!td.done)

  const toggle = (id) =>
    setTodos((prev) =>
      prev.map((td) => {
        if (td.id !== id) return td
        if (td.isRecurring)
          return { ...td, doneDate: td.doneDate === todayStr ? null : todayStr }
        return { ...td, done: !td.done }
      })
    )

  const remove = (id) => setTodos((prev) => prev.filter((td) => td.id !== id))

  // Context carried into Focus mode: the title (prefixed with its subject if any)
  // as the main line, and the description as the detail shown under the timer.
  const focusContext = (td) => {
    const subject = subjects.find((s) => s.id === td.subjectId)
    const title = taskTitle(td)
    return {
      contextTitle: subject ? `${subject.name} — ${title}` : title,
      contextDetail: taskDescription(td),
    }
  }

  // A single task row. Defined once and reused by both list sections (one-off
  // and recurring) so the item UI — checkbox, subject badge, Play pill, delete —
  // stays identical everywhere.
  const renderTask = (td) => {
    const subject = subjects.find((s) => s.id === td.subjectId)
    const SubjectIcon = subject && SUBJECT_ICONS[subject.id]
    const done = isDone(td)
    const title = taskTitle(td)
    const description = taskDescription(td)
    const focus = focusContext(td)
    return (
      <motion.li
        key={td.id}
        layout
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.18 }}
        className="flex items-start gap-2 rounded-2xl px-2 py-1.5 transition-colors hover:bg-brand-50 dark:hover:bg-night-700/50"
      >
        <motion.button
          type="button"
          onClick={() => toggle(td.id)}
          whileTap={{ scale: 0.97 }}
          className="flex flex-1 items-start gap-2.5 text-right"
        >
          {/* Bouncy checkbox — fills soft green when checked. */}
          <motion.span
            animate={{ scale: done ? [1, 1.25, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
              done
                ? 'border-green-400 bg-green-400 text-white'
                : 'border-brand-300 text-transparent dark:border-night-600'
            }`}
          >
            <AnimatePresence>
              {done && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                >
                  <Check size={14} strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.span>

          {/* Subject badge — icon in the subject's accent gradient. */}
          {subject && (
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${subject.gradient} text-white`}
              title={subject.name}
            >
              {SubjectIcon ? (
                <SubjectIcon size={13} />
              ) : (
                <span className="text-[10px]">{subject.emoji}</span>
              )}
            </span>
          )}

          {/* Recurring marker. */}
          {td.isRecurring && (
            <Repeat
              size={13}
              className="shrink-0 text-brand-400 dark:text-brand-300"
              aria-label="دووبارەبوونەوەی هەفتانە"
            />
          )}

          {/* Title (prominent) + optional description snippet beneath it. */}
          <span className="min-w-0 flex-1">
            <span
              className={`block text-sm font-medium transition-colors duration-300 ${
                done
                  ? 'text-slate-400 line-through dark:text-brand-100/30'
                  : 'text-night-900 dark:text-brand-50'
              }`}
            >
              {title}
            </span>
            {description && (
              <span
                className={`mt-0.5 block truncate text-xs transition-colors duration-300 ${
                  done
                    ? 'text-slate-300 line-through dark:text-brand-100/20'
                    : 'text-night-700/50 dark:text-brand-100/40'
                }`}
              >
                {description}
              </span>
            )}
          </span>
        </motion.button>

        {/* Start Focus — a clear, labelled Play pill with a soft
            background so it reads as an action, not decoration. */}
        <StartFocusButton
          contextTitle={focus.contextTitle}
          contextDetail={focus.contextDetail}
          icon={PlayCircle}
          className="mt-0.5 shrink-0 inline-flex items-center gap-1 rounded-xl bg-brand-100 px-2.5 py-1.5 text-xs font-bold text-brand-600 transition hover:bg-brand-200 active:scale-95 dark:bg-night-700 dark:text-brand-300 dark:hover:bg-night-600"
        >
          تەرکیز
        </StartFocusButton>

        {/* Delete — asks for confirmation first to prevent accidental loss. */}
        <button
          type="button"
          onClick={() => setToDelete(td.id)}
          aria-label="سڕینەوە"
          className="ms-0.5 shrink-0 rounded-lg p-1 text-night-700/30 transition hover:text-rose-500 active:scale-90 dark:text-brand-100/30"
        >
          <Trash2 size={16} />
        </button>
      </motion.li>
    )
  }

  // Clear today's one-off tasks but keep recurring ones (they're meant to last).
  const clearAll = () =>
    setTodos((prev) => prev.filter((td) => (td.isRecurring ? true : taskDateKey(td) !== todayKey)))

  const doneCount = visibleTodos.filter(isDone).length
  const allDone = visibleTodos.length > 0 && doneCount === visibleTodos.length

  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-brand-700 dark:text-brand-200">
          <ListChecks size={20} />
          <h2 className="font-bold">ئیشەکانی ئەمڕۆ</h2>
        </div>
        {visibleTodos.length > 0 && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-300 ${
              allDone
                ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                : 'bg-brand-50 text-brand-600 dark:bg-night-700 dark:text-brand-200'
            }`}
          >
            {allDone ? 'هەمووت کرد! 🎉' : `${doneCount} لە ${visibleTodos.length} کرا`}
          </span>
        )}
      </div>

      {visibleTodos.length > 0 ? (
        <>
          <div className="space-y-4">
            {/* One-off tasks — specific to the viewed day. */}
            {oneOffTasks.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold text-night-700/50 dark:text-brand-100/40">
                  تەنها بۆ ئەمڕۆ
                </h3>
                <ul className="space-y-1">
                  <AnimatePresence initial={false}>{oneOffTasks.map(renderTask)}</AnimatePresence>
                </ul>
              </div>
            )}

            {/* Recurring tasks — repeat every week. A faint divider separates
                them from the one-off block above (only when both are present). */}
            {recurringTasks.length > 0 && (
              <div
                className={
                  oneOffTasks.length > 0
                    ? 'border-t border-brand-100 pt-4 dark:border-night-700'
                    : ''
                }
              >
                <h3 className="mb-2 text-xs font-semibold text-night-700/50 dark:text-brand-100/40">
                  {`هەموو ${todayName}یەک`}
                </h3>
                <ul className="space-y-1">
                  <AnimatePresence initial={false}>{recurringTasks.map(renderTask)}</AnimatePresence>
                </ul>
              </div>
            )}
          </div>

          {/* Clear-all reset — start fresh in one tap (keeps recurring tasks). */}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1 text-xs font-semibold text-night-700/50 transition hover:text-rose-500 active:scale-95 dark:text-brand-100/40"
            >
              <Trash2 size={13} /> سڕینەوەی ئیشەکانی ئەمڕۆ
            </button>
          </div>
        </>
      ) : (
        // Beautiful empty state — encouraging, not a dead end.
        <div className="flex flex-col items-center gap-1 py-8 text-center">
          <span className="text-3xl">🎉</span>
          <p className="mt-1 font-semibold text-night-900 dark:text-brand-50">
            ئەمڕۆ پشووە!
          </p>
          <p className="text-sm text-night-700/60 dark:text-brand-100/50">
            یان بە دوگمەی ‎+‎ ئیشێک بۆ خۆت زیاد بکە.
          </p>
        </div>
      )}

      {/* Confirm before deleting a task — prevents accidental data loss. */}
      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => remove(toDelete)}
        message="دڵنیایت ئەم ئیشە بسڕیتەوە؟"
      />

      {/* Confirm before clearing all of today's one-off tasks. */}
      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearAll}
        message="دڵنیایت ئیشەکانی ئەمڕۆ بسڕیتەوە؟"
      />
    </section>
  )
}

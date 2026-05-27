import { useState } from 'react'
import { CalendarDays, Pencil, Check } from 'lucide-react'
import { SUBJECT_ICONS } from '../data/subjects.js'
import { useApp } from '../context/AppContext.jsx'
import Modal from './Modal.jsx'

// Kurdish day names indexed by Date.getDay() (0 = Sunday … 6 = Saturday).
const DAY_NAMES = ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە']
// Editor order: Saturday-first (the Kurdistan school week).
const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5]

/**
 * "خشتەی ئەمڕۆ" — a recurring weekly timetable. The widget auto-detects the
 * current day and shows only that day's subjects; the editor (a modal) assigns
 * subjects to every day. Persisted in localStorage as { dayIndex: [subjectId] }.
 */
export default function TodaySchedule() {
  const { subjects, weeklySchedule: schedule, setWeeklySchedule: setSchedule } = useApp()
  const [editing, setEditing] = useState(false)

  const today = new Date().getDay()
  const idsFor = (day) => schedule[day] ?? []

  const toggle = (day, id) =>
    setSchedule((prev) => {
      const cur = prev[day] ?? []
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
      return { ...prev, [day]: next }
    })

  // Today's subjects, resolved to live subject objects (drops deleted ones).
  const todaySubjects = subjects.filter((s) => idsFor(today).includes(s.id))

  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-brand-700 dark:text-brand-200">
          <CalendarDays size={20} />
          <h2 className="font-bold">خشتەی ئەمڕۆ ({DAY_NAMES[today]})</h2>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="دەستکاری خشتەی هەفتانە"
          className="flex shrink-0 items-center gap-1 rounded-xl bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 transition active:scale-95 dark:bg-night-700 dark:text-brand-200"
        >
          <Pencil size={13} /> دەستکاری
        </button>
      </div>

      {/* Today's subjects only */}
      {todaySubjects.length > 0 ? (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {todaySubjects.map((s) => {
            const Icon = SUBJECT_ICONS[s.id]
            return (
              <span
                key={s.id}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:bg-night-700 dark:text-brand-200"
              >
                {Icon && <Icon size={14} />}
                {s.name}
              </span>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-night-700/50 dark:text-brand-100/40">
          خشتەی ئەمڕۆت دیاری نەکردووە
        </p>
      )}

      {/* Weekly editor */}
      <Modal open={editing} onClose={() => setEditing(false)} title="خشتەی هەفتانە">
        {subjects.length === 0 ? (
          <p className="text-sm text-night-700/60 dark:text-brand-100/50">
            پێویستە سەرەتا لە بەشی بابەتەکان بابەت زیاد بکەیت.
          </p>
        ) : (
          <div className="space-y-5">
            {DAY_ORDER.map((day) => {
              const dayIds = idsFor(day)
              const isToday = day === today
              return (
                <div key={day}>
                  <p
                    className={`mb-2 flex items-center gap-2 font-bold ${
                      isToday
                        ? 'text-brand-600 dark:text-brand-300'
                        : 'text-night-900 dark:text-brand-50'
                    }`}
                  >
                    {DAY_NAMES[day]}
                    {isToday && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-night-700 dark:text-brand-200">
                        ئەمڕۆ
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => {
                      const on = dayIds.includes(s.id)
                      const Icon = SUBJECT_ICONS[s.id]
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggle(day, s.id)}
                          aria-pressed={on}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition active:scale-95 ${
                            on
                              ? 'border-brand-500 bg-brand-500 text-white'
                              : 'border-brand-200 text-night-700 dark:border-night-600 dark:text-brand-100/70'
                          }`}
                        >
                          {Icon && <Icon size={14} />}
                          {s.name}
                          {on && <Check size={13} />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Modal>
    </section>
  )
}

// Shared task helpers used by both the Home task list (TodoWidget) and the
// global task creator (TaskCreator), kept in one place to stay DRY.

// Kurdish (Sorani) weekday names, indexed to match Date.getDay() (0 = Sunday).
export const KURDISH_DAYS = [
  'یەکشەممە',
  'دووشەممە',
  'سێشەممە',
  'چوارشەممە',
  'پێنجشەممە',
  'هەینی',
  'شەممە',
]

export const newTaskId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

// Local calendar-day key, e.g. "2026-05-27" (no time component → no timezone or
// millisecond drift when comparing days).
export const dateKey = (d = new Date()) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

// The exact date a one-off task is anchored to. New tasks store `date` directly;
// legacy tasks fall back to deriving it from their timestamp.
export const taskDateKey = (td) => td.date ?? (td.createdAt ? dateKey(td.createdAt) : null)

// Title / description accessors with backward-compat: tasks created before the
// title+description split stored a single `text` field — treat it as the title.
export const taskTitle = (td) => (td.title ?? td.text ?? '').trim()
export const taskDescription = (td) => (td.description ?? '').trim()

// Build a fresh task record. One-offs are stamped with the day's exact date so
// they can never bleed into a future day.
export const makeTask = ({ title, description = '', subjectId, isRecurring, day = new Date() }) => ({
  id: newTaskId(),
  title: title.trim(),
  description: description.trim(),
  done: false,
  doneDate: null,
  subjectId: subjectId || null,
  isRecurring,
  date: dateKey(day),
  dayOfWeek: new Date(day).getDay(),
  createdAt: Date.now(),
})

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { DEFAULT_SUBJECTS } from '../data/subjects.js'

const AppContext = createContext(null)

// Sensible default: the Iraqi/Kurdistan 12th-grade ministry exams window.
// Dlin can change this any time from Settings.
const DEFAULT_EXAM_DATE = '2026-06-14T08:00:00'

/** A unique-enough id for locally-stored items. */
const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

/**
 * Coerce a subject's stored notes into an array of { id, text, createdAt }.
 * Legacy data kept a single string per subject; wrap it as one note (createdAt
 * 0) so older notes survive the move to a multi-note list.
 */
const toNoteArray = (raw) => {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string' && raw.trim())
    return [{ id: 'legacy', text: raw, createdAt: 0 }]
  return []
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('dlin:theme', 'light')
  const [color, setColor] = useLocalStorage('dlin:color', 'purple') // accent theme
  const [studentName, setStudentName] = useLocalStorage('dlin:name', 'دلین')
  const [examDate, setExamDate] = useLocalStorage('dlin:examDate', DEFAULT_EXAM_DATE)

  // Subjects are user-editable; seeded once from the defaults. The ':v2' suffix
  // re-seeds the canonical 7-subject scientific-track set (adds عەرەبی/Arabic);
  // notes & quizzes are keyed by subject id, so they stay linked across reseed.
  const [subjects, setSubjects] = useLocalStorage('dlin:subjects:v2', DEFAULT_SUBJECTS)

  // Per-subject content. Both are maps keyed by subject id.
  const [notes, setNotes] = useLocalStorage('dlin:notes', {})
  const [quizzes, setQuizzes] = useLocalStorage('dlin:quizzes', {})

  // Study & break durations (minutes).
  const [pomodoro, setPomodoro] = useLocalStorage('dlin:pomodoro', {
    work: 25,
    break: 5,
  })

  // Gamification: total XP earned (e.g. +50 per completed focus session).
  const [xp, setXp] = useLocalStorage('dlin:xp', 0)
  const addXp = useCallback((amount) => setXp((x) => x + amount), [setXp])

  // Focus (study) sessions completed today. Stored as { date, count } and tracked
  // per day so "today's record" stays accurate — once the date rolls over it
  // reads back as 0. The Focus timer calls addCompletedSession() each time a
  // study session counts down to 00:00.
  const [sessionLog, setSessionLog] = useLocalStorage('dlin:completedSessions', {
    date: '',
    count: 0,
  })
  const completedSessions = sessionLog.date === new Date().toDateString() ? sessionLog.count : 0
  const addCompletedSession = useCallback(() => {
    const today = new Date().toDateString()
    setSessionLog((prev) =>
      prev.date === today ? { date: today, count: prev.count + 1 } : { date: today, count: 1 }
    )
  }, [setSessionLog])

  // Weekly study timetable: { dayIndex(0-6): [subjectId] }. Shared so the Home
  // schedule widget and the task input read/write the exact same source.
  const [weeklySchedule, setWeeklySchedule] = useLocalStorage('dlin:weeklySchedule', {})

  // Keep the <html> class in sync with the chosen theme.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Apply the chosen accent color theme to <html data-theme>.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', color)
  }, [color])

  // Match the mobile browser's status-bar tint (theme-color) to the live app
  // background, so the safe area blends seamlessly with the app surface. In dark
  // mode we read the *computed* background — which --app-bg-dark tints with the
  // active accent — so it stays exact for every accent color; light mode keeps
  // the brand purple. Depends on `color` (the accent changes the background) and
  // is declared last so the `dark` class + `data-theme` are already applied when
  // we read getComputedStyle.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return
    meta.setAttribute(
      'content',
      theme === 'dark' ? getComputedStyle(document.body).backgroundColor : '#8b5cf6'
    )
  }, [theme, color])

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [setTheme]
  )

  // ----- Subjects -----
  const getSubject = useCallback((id) => subjects.find((s) => s.id === id), [subjects])

  const addSubject = useCallback(
    (data) => {
      const id = `subj-${uid()}`
      setSubjects((prev) => [...prev, { ...data, id }])
      return id
    },
    [setSubjects]
  )

  const updateSubject = useCallback(
    (id, patch) =>
      setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    [setSubjects]
  )

  const deleteSubject = useCallback(
    (id) => {
      setSubjects((prev) => prev.filter((s) => s.id !== id))
      // Clean up the subject's notes and quizzes so nothing is orphaned.
      setNotes((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setQuizzes((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    },
    [setSubjects, setNotes, setQuizzes]
  )

  // ----- Notes ----- (per subject: an array of { id, text, createdAt })
  const getNotes = useCallback((subjectId) => toNoteArray(notes[subjectId]), [notes])

  const addNote = useCallback(
    (subjectId, text) => {
      const clean = text.trim()
      if (!clean) return
      const note = { id: uid(), text: clean, createdAt: Date.now() }
      setNotes((prev) => ({ ...prev, [subjectId]: [...toNoteArray(prev[subjectId]), note] }))
    },
    [setNotes]
  )

  const deleteNote = useCallback(
    (subjectId, noteId) =>
      setNotes((prev) => ({
        ...prev,
        [subjectId]: toNoteArray(prev[subjectId]).filter((n) => n.id !== noteId),
      })),
    [setNotes]
  )

  // ----- Quizzes -----
  const getQuizItems = useCallback(
    (subjectId) => quizzes[subjectId] ?? [],
    [quizzes]
  )

  const addQuizItem = useCallback(
    (subjectId, item) => {
      const withId = { ...item, id: uid(), createdAt: Date.now() }
      setQuizzes((prev) => ({
        ...prev,
        [subjectId]: [...(prev[subjectId] ?? []), withId],
      }))
      return withId.id
    },
    [setQuizzes]
  )

  const updateQuizItem = useCallback(
    (subjectId, id, patch) =>
      setQuizzes((prev) => ({
        ...prev,
        [subjectId]: (prev[subjectId] ?? []).map((it) =>
          it.id === id ? { ...it, ...patch } : it
        ),
      })),
    [setQuizzes]
  )

  const deleteQuizItem = useCallback(
    (subjectId, id) =>
      setQuizzes((prev) => ({
        ...prev,
        [subjectId]: (prev[subjectId] ?? []).filter((it) => it.id !== id),
      })),
    [setQuizzes]
  )

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      color,
      setColor,
      studentName,
      setStudentName,
      examDate,
      setExamDate,
      subjects,
      getSubject,
      addSubject,
      updateSubject,
      deleteSubject,
      notes,
      getNotes,
      addNote,
      deleteNote,
      quizzes,
      getQuizItems,
      addQuizItem,
      updateQuizItem,
      deleteQuizItem,
      pomodoro,
      setPomodoro,
      xp,
      addXp,
      completedSessions,
      addCompletedSession,
      weeklySchedule,
      setWeeklySchedule,
    }),
    [
      theme,
      toggleTheme,
      setTheme,
      color,
      setColor,
      studentName,
      setStudentName,
      examDate,
      setExamDate,
      subjects,
      getSubject,
      addSubject,
      updateSubject,
      deleteSubject,
      notes,
      getNotes,
      addNote,
      deleteNote,
      quizzes,
      getQuizItems,
      addQuizItem,
      updateQuizItem,
      deleteQuizItem,
      pomodoro,
      setPomodoro,
      xp,
      addXp,
      completedSessions,
      addCompletedSession,
      weeklySchedule,
      setWeeklySchedule,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

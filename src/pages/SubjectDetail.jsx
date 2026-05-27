import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, FileText, ListChecks } from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'
import NotesEditor from '../components/NotesEditor.jsx'
import QuizManager from '../components/QuizManager.jsx'
import StartFocusButton from '../components/StartFocusButton.jsx'
import { useApp } from '../context/AppContext.jsx'

const TABS = [
  { key: 'notes', label: 'تێبینییەکان', Icon: FileText },
  { key: 'quizzes', label: 'کویزەکان', Icon: ListChecks },
]

export default function SubjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSubject } = useApp()
  const subject = getSubject(id)
  const [tab, setTab] = useState('notes')

  // Guard against unknown subject ids.
  if (!subject) return <Navigate to="/subjects" replace />

  return (
    <PageTransition>
      {/* Header with back button */}
      <header className="mb-5">
        <button
          onClick={() => navigate('/subjects')}
          className="touch-target -mr-2 mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300"
        >
          <ChevronRight size={18} /> گەڕانەوە بۆ بابەتەکان
        </button>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${subject.gradient} text-3xl text-white shadow-soft`}
          >
            {subject.emoji}
          </div>
          <h1 className="text-2xl font-extrabold text-night-900 dark:text-brand-50">
            {subject.name}
          </h1>
        </div>
      </header>

      {/* Start a focus session dedicated to studying this subject. */}
      <div className="mb-5">
        <StartFocusButton contextTitle={`خوێندنی ${subject.name}`} />
      </div>

      {/* Tab switcher */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-brand-100 p-1 dark:bg-night-700">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`touch-target relative flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-semibold transition ${
              tab === key
                ? 'text-brand-700 dark:text-brand-200'
                : 'text-night-700/60 dark:text-brand-100/60'
            }`}
          >
            {tab === key && (
              <motion.span
                layoutId="subject-tab"
                className="absolute inset-0 -z-10 rounded-xl bg-white shadow dark:bg-night-800"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === 'notes' && <NotesEditor subjectId={id} />}
        {tab === 'quizzes' && <QuizManager subjectId={id} />}
      </motion.div>
    </PageTransition>
  )
}

import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'
import ExamPlanner from '../components/ExamPlanner.jsx'

/** Dedicated full exam-schedule page (add + full list), linked from Home. */
export default function Exams() {
  const navigate = useNavigate()

  return (
    <PageTransition>
      <header className="mb-5">
        <button
          onClick={() => navigate('/')}
          className="touch-target -mr-2 mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300"
        >
          <ChevronRight size={18} /> گەڕانەوە بۆ ماڵەوە
        </button>
        <h1 className="text-2xl font-extrabold text-night-900 dark:text-brand-50">
          خشتەی تاقیکردنەوەکان
        </h1>
        <p className="mt-1 text-night-700/80 dark:text-brand-100/70">
          هەموو تاقیکردنەوەکانت لێرەن — ئامادە بە بۆیان 📚
        </p>
      </header>

      <ExamPlanner />
    </PageTransition>
  )
}

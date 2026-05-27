import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, ListChecks, CalendarClock, FileText, ChevronRight } from 'lucide-react'
import Modal from './Modal.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import TaskCreator from './TaskCreator.jsx'
import ExamForm, { makeExam } from './ExamForm.jsx'
import NoteCreator from './NoteCreator.jsx'

const TITLES = {
  menu: 'دەتەوێت چی زیاد بکەیت؟',
  task: 'ئەرکی نوێ',
  exam: 'تاقیکردنەوەی نوێ',
  note: 'تێبینیی نوێ',
}

/**
 * Global "+" Floating Action Button + Creation Hub. One entry point to add a
 * Task, Exam, or Note from anywhere — keeping inline add-forms off the main
 * viewing areas. Hidden on the distraction-free Focus and quiz screens.
 */
export default function CreationHub() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('menu') // 'menu' | 'task' | 'exam' | 'note'
  const [, setExams] = useLocalStorage('dlin:exams', [])

  const hidden = pathname === '/focus' || pathname.endsWith('/take')

  const close = () => setOpen(false)
  const openHub = () => {
    setStep('menu')
    setOpen(true)
  }
  const addExam = (data) => {
    setExams((prev) => [...prev, makeExam(data)])
    close()
  }

  if (hidden) return null

  return (
    <>
      <motion.button
        type="button"
        onClick={openHub}
        whileTap={{ scale: 0.9 }}
        aria-label="زیادکردنی نوێ"
        /* Float above the bottom nav with a clean gap: 7rem clears the nav's
           content, and the safe-area inset matches the nav's own `safe-bottom`
           so it never clashes on notched devices. */
        className="absolute bottom-[calc(7rem_+_env(safe-area-inset-bottom))] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
      >
        <Plus size={28} />
      </motion.button>

      <Modal open={open} onClose={close} title={TITLES[step]}>
        {step !== 'menu' && (
          <button
            type="button"
            onClick={() => setStep('menu')}
            className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300"
          >
            <ChevronRight size={16} /> گەڕانەوە
          </button>
        )}

        {step === 'menu' && (
          <div className="space-y-3">
            <HubChoice Icon={ListChecks} title="ئەرک" desc="ئەرکێک بۆ ئەمڕۆ یان هەفتانە" onClick={() => setStep('task')} />
            <HubChoice Icon={CalendarClock} title="تاقیکردنەوە" desc="تاقیکردنەوەیەک بۆ خشتەکە" onClick={() => setStep('exam')} />
            <HubChoice Icon={FileText} title="تێبینی" desc="تێبینییەک بۆ بابەتێک" onClick={() => setStep('note')} />
          </div>
        )}
        {step === 'task' && <TaskCreator onDone={close} />}
        {step === 'exam' && <ExamForm onSubmit={addExam} />}
        {step === 'note' && <NoteCreator onDone={close} />}
      </Modal>
    </>
  )
}

/** A large choice row in the hub menu (accent icon tile + title + description). */
function HubChoice({ Icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border-2 border-brand-200 bg-white p-4 text-right transition hover:border-brand-400 hover:bg-brand-50 active:scale-[0.98] dark:border-night-600 dark:bg-night-700 dark:hover:border-brand-400 dark:hover:bg-night-600"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-night-600 dark:text-brand-300">
        <Icon size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-night-900 dark:text-brand-50">{title}</span>
        <span className="block text-xs text-night-700/60 dark:text-brand-100/60">{desc}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-brand-300 dark:text-brand-100/40" />
    </button>
  )
}

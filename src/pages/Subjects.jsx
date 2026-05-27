import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ListChecks, ChevronLeft, Plus, Pencil, Trash2, Check } from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import SubjectForm from '../components/SubjectForm.jsx'
import { SUBJECT_ICONS } from '../data/subjects.js'
import { useApp } from '../context/AppContext.jsx'

const stagger = { animate: { transition: { staggerChildren: 0.05 } } }
const item = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } }

export default function Subjects() {
  const { subjects, getNotes, quizzes, addSubject, updateSubject, deleteSubject } = useApp()

  const [editMode, setEditMode] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null) // subject being edited, or null = add
  const [toDelete, setToDelete] = useState(null) // subject pending deletion

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (subject) => {
    setEditing(subject)
    setFormOpen(true)
  }

  const handleSubmit = (data) => {
    if (editing) updateSubject(editing.id, data)
    else addSubject(data)
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <PageTransition>
      <header className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-night-900 dark:text-brand-50">بابەتەکان</h1>
          <p className="mt-1 text-night-700/80 dark:text-brand-100/70">
            {editMode ? 'بابەتەکان دەستکاری بکە یان بیانسڕەوە.' : 'بابەتێک هەڵبژێرە یان بابەتی نوێ زیاد بکە.'}
          </p>
        </div>
        {subjects.length > 0 && (
          <button
            onClick={() => setEditMode((v) => !v)}
            className="touch-target shrink-0 rounded-2xl bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 transition active:scale-95 dark:bg-night-700 dark:text-brand-200"
          >
            {editMode ? (
              <span className="flex items-center gap-1">
                <Check size={16} /> تەواو
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Pencil size={16} /> دەستکاری
              </span>
            )}
          </button>
        )}
      </header>

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3"
      >
        <AnimatePresence>
          {subjects.map((s) => {
            const noteCount = getNotes(s.id).length
            const quizCount = (quizzes[s.id] || []).length
            return (
              <motion.div key={s.id} variants={item} layout exit={{ opacity: 0, scale: 0.9 }}>
                {/* Inner wrapper does the edit-mode wiggle so it doesn't override
                    the entrance variant (which controls opacity/position). */}
                <motion.div
                  className="h-full"
                  animate={editMode ? { rotate: [0, -1, 1, 0] } : { rotate: 0 }}
                  transition={
                    editMode
                      ? { repeat: Infinity, duration: 0.45, repeatDelay: 0.6 }
                      : { duration: 0.2 }
                  }
                >
                  <SubjectCard
                    subject={s}
                    noteCount={noteCount}
                    quizCount={quizCount}
                    editMode={editMode}
                    onEdit={() => openEdit(s)}
                    onDelete={() => setToDelete(s)}
                  />
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Add-subject card (always available) */}
        <motion.button
          variants={item}
          layout
          onClick={openAdd}
          className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed
                     border-brand-300 text-brand-600 transition active:scale-95 dark:border-night-600 dark:text-brand-300"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 dark:bg-night-700">
            <Plus size={26} />
          </span>
          <span className="font-bold">زیادکردنی بابەت</span>
        </motion.button>
      </motion.div>

      {/* Add / edit subject sheet */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'دەستکاریکردنی بابەت' : 'بابەتی نوێ'}
      >
        <SubjectForm initial={editing} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => deleteSubject(toDelete.id)}
        title={`سڕینەوەی «${toDelete?.name || ''}»؟`}
        message="هەموو تێبینی و کویزەکانی ئەم بابەتەش دەسڕێنەوە. دڵنیایت؟"
      />
    </PageTransition>
  )
}

function SubjectCard({ subject: s, noteCount, quizCount, editMode, onEdit, onDelete }) {
  // Lucide icon for the default subjects; custom subjects fall back to emoji.
  const Icon = SUBJECT_ICONS[s.id]
  // Soft pastel surface in light mode; a calm dark surface in dark mode.
  const surface = `${s.soft} dark:bg-night-800 dark:text-brand-50`

  const inner = (
    <>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-soft`}
      >
        {Icon ? <Icon size={26} strokeWidth={2.2} /> : <span className="text-2xl">{s.emoji}</span>}
      </div>
      <h2 className="text-lg font-bold text-night-900 dark:text-brand-50">{s.name}</h2>
      <div className="mt-auto flex items-center gap-3 text-xs text-night-700/70 dark:text-brand-100/60">
        <span className="flex items-center gap-1">
          <ListChecks size={14} /> {quizCount} کویز
        </span>
        <span className="flex items-center gap-1">
          <FileText size={14} /> {noteCount} تێبینی
        </span>
      </div>
    </>
  )

  // In edit mode the card shows edit/delete controls instead of navigating.
  if (editMode) {
    return (
      <div className={`relative flex h-full flex-col gap-3 rounded-3xl p-4 shadow-card ${surface}`}>
        {inner}
        <div className="mt-3 flex gap-2">
          <button
            onClick={onEdit}
            className="touch-target flex flex-1 items-center justify-center gap-1 rounded-xl bg-brand-100 py-2 text-sm font-semibold text-brand-700 dark:bg-night-700 dark:text-brand-200"
          >
            <Pencil size={16} /> دەستکاری
          </button>
          <button
            onClick={onDelete}
            aria-label="سڕینەوە"
            className="touch-target flex items-center justify-center rounded-xl bg-rose-100 px-3 text-rose-600 dark:bg-rose-500/15"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <Link
      to={`/subjects/${s.id}`}
      className={`flex h-full flex-col gap-3 rounded-3xl p-4 shadow-card transition active:scale-95 ${surface}`}
    >
      {inner}
      <span className="flex items-center gap-1 text-sm font-semibold text-brand-700 dark:text-brand-200">
        کردنەوە <ChevronLeft size={16} />
      </span>
    </Link>
  )
}

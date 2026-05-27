import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Play, ListChecks } from 'lucide-react'
import Modal from './Modal.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import QuizForm from './QuizForm.jsx'
import { useApp } from '../context/AppContext.jsx'

/** Manage (create/edit/delete) multiple-choice quiz questions for a subject. */
export default function QuizManager({ subjectId }) {
  const navigate = useNavigate()
  const { getQuizItems, addQuizItem, updateQuizItem, deleteQuizItem } = useApp()
  // Only multiple-choice questions remain; the filter also hides any legacy
  // flashcard items left in storage so they never render here.
  const items = getQuizItems(subjectId).filter((i) => i.type === 'mcq')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null) // item being edited, or null
  const [toDelete, setToDelete] = useState(null) // item id pending deletion

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (item) => {
    setEditing(item)
    setFormOpen(true)
  }

  const handleSubmit = (data) => {
    if (editing) updateQuizItem(subjectId, editing.id, data)
    else addQuizItem(subjectId, data)
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex gap-3">
        <button onClick={openAdd} className="btn-primary flex-1">
          <Plus size={20} /> زیادکردن
        </button>
        <button
          onClick={() => navigate(`/subjects/${subjectId}/take`)}
          disabled={items.length === 0}
          className="btn-ghost flex-1 disabled:opacity-40"
        >
          <Play size={20} /> دەستپێکردنی کویز
        </button>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <McqCard item={item} onEdit={() => openEdit(item)} onDelete={() => setToDelete(item.id)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Add / edit sheet */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'دەستکاریکردن' : 'زیادکردنی نوێ'}
      >
        <QuizForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => deleteQuizItem(subjectId, toDelete)}
        message="دڵنیایت لە سڕینەوەی ئەم بابەتە؟ ناتوانرێت بگەڕێندرێتەوە."
      />
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="card flex flex-col items-center gap-3 p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-500 dark:bg-night-700">
        <ListChecks size={28} />
      </span>
      <p className="font-semibold text-night-900 dark:text-brand-50">هێشتا هیچ کویزێک نییە</p>
      <p className="text-sm text-night-700/70 dark:text-brand-100/60">
        یەکەم پرسیارت دروست بکە و دەست بە مەشق بکە.
      </p>
      <button onClick={onAdd} className="btn-primary mt-1">
        <Plus size={20} /> زیادکردن
      </button>
    </div>
  )
}

function CardActions({ onEdit, onDelete }) {
  return (
    <div className="flex shrink-0 gap-1">
      <button
        onClick={onEdit}
        aria-label="دەستکاری"
        className="touch-target flex items-center justify-center rounded-xl text-brand-500 hover:bg-brand-100 dark:hover:bg-night-700"
      >
        <Pencil size={18} />
      </button>
      <button
        onClick={onDelete}
        aria-label="سڕینەوە"
        className="touch-target flex items-center justify-center rounded-xl text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}

function McqCard({ item, onEdit, onDelete }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className="mb-2 inline-block rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-night-700 dark:text-brand-200">
            پرسیاری هەڵبژاردن
          </span>
          <p className="font-semibold text-night-900 dark:text-brand-50">{item.question}</p>
        </div>
        <CardActions onEdit={onEdit} onDelete={onDelete} />
      </div>
      <ul className="mt-3 space-y-1.5">
        {(item.options ?? []).map((opt, i) => (
          <li
            key={i}
            className={`rounded-xl px-3 py-2 text-sm ${
              i === item.correctIndex
                ? 'bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'bg-brand-50 text-night-700 dark:bg-night-700/50 dark:text-brand-100/80'
            }`}
          >
            {opt}
            {i === item.correctIndex && ' ✓'}
          </li>
        ))}
      </ul>
    </div>
  )
}

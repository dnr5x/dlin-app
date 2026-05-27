import Modal from './Modal.jsx'
import { AlertTriangle } from 'lucide-react'

/** A small confirmation sheet, used before destructive actions (delete). */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'دڵنیایت؟',
  message = 'ئەم کردارە ناتوانرێت بگەڕێندرێتەوە.',
  confirmLabel = 'سڕینەوە',
  cancelLabel = 'لێگەڕێ',
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15">
          <AlertTriangle size={28} />
        </div>
        <p className="text-night-700 dark:text-brand-100/80">{message}</p>
        <div className="mt-2 flex w-full gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="btn flex-1 bg-rose-500 text-white hover:bg-rose-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

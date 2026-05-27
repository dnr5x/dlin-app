import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * A bottom-sheet style modal (mobile-native pattern). Slides up from the
 * bottom, dims the background, and closes on backdrop tap or the X button.
 *
 * It is rendered through a portal to <body> and positioned `fixed`, so it
 * always anchors to the viewport — never to a transformed/scrolled ancestor
 * (e.g. the animated page wrapper).
 */
export default function Modal({ open, onClose, title, children, centered = false }) {
  // Lock background scroll while open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-50 flex justify-center ${centered ? 'items-center p-4' : 'items-end'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-night-900/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog — bottom sheet by default, or a centered card when requested.
              Constrained to the phone-frame width on larger screens. */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={centered ? { scale: 0.92, opacity: 0 } : { y: '100%' }}
            animate={centered ? { scale: 1, opacity: 1 } : { y: 0 }}
            exit={centered ? { scale: 0.92, opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 38 }}
            className={`relative mx-auto max-h-[88dvh] w-full max-w-[440px] overflow-y-auto no-scrollbar
                       bg-white p-5 shadow-2xl dark:bg-night-800 ${
                         centered ? 'rounded-3xl' : 'safe-bottom rounded-t-3xl'
                       }`}
          >
            {!centered && (
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-brand-200 dark:bg-night-600" />
            )}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-night-900 dark:text-brand-50">{title}</h2>
              <button
                onClick={onClose}
                aria-label="داخستن"
                className="touch-target flex items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-night-700 dark:text-brand-100"
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

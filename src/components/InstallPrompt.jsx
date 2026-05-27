import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Share, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

// Apple devices never fire `beforeinstallprompt`, so they need manual guidance.
function isIOS() {
  if (typeof navigator === 'undefined') return false
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS reports as "MacIntel" but exposes touch points.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

// Already launched from the home screen? Then there's nothing to install.
function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

/**
 * A soft, friendly "Add to Home Screen" prompt — rendered as a centered modal
 * with a darkened backdrop (matching the Eid greeting), not an inline banner.
 *
 * Sequencing: it stays dormant until `enabled` is true. The sequencer only
 * enables it once any Eid greeting has been resolved, so the two pop-ups never
 * appear at once. We still *capture* the browser's `beforeinstallprompt` event
 * whenever it fires (so the opportunity isn't lost), but only reveal the modal
 * when allowed.
 *
 * On Android/Chrome it offers a one-tap install; on iOS Safari (no install
 * event) it shows manual instructions. Once dismissed (✕, backdrop, or install)
 * it never returns, via `dlin:installDismissed`.
 */
export default function InstallPrompt({ enabled = false }) {
  const [dismissed, setDismissed] = useLocalStorage('dlin:installDismissed', false)
  const [deferred, setDeferred] = useState(null) // captured beforeinstallprompt event
  const [eligible, setEligible] = useState(false) // an install opportunity exists
  const ios = isIOS()

  // Capture the native install event (Android/Chrome) and note when the app gets
  // installed through the browser's own UI. Runs regardless of `enabled` so the
  // event is never missed mid-Eid.
  useEffect(() => {
    if (dismissed || isStandalone()) return
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferred(e)
      setEligible(true)
    }
    const onInstalled = () => setDismissed(true)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [dismissed, setDismissed])

  // iOS has no install event — become eligible a short beat AFTER we're allowed
  // to show (i.e. once the Eid greeting, if any, is gone), so it eases in.
  useEffect(() => {
    if (!ios || !enabled || dismissed || isStandalone()) return
    const t = setTimeout(() => setEligible(true), 1200)
    return () => clearTimeout(t)
  }, [ios, enabled, dismissed])

  const visible = enabled && eligible && !dismissed

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    try {
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') setDismissed(true)
    } catch {
      /* user dismissed the native sheet; leave the prompt for next time */
    }
    setDeferred(null)
  }

  const dismiss = () => setDismissed(true)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
          className="absolute inset-0 z-[55] flex items-center justify-center bg-night-900/50 p-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xs overflow-hidden rounded-[2rem] bg-white p-6 text-center shadow-2xl dark:bg-night-800"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="داخستن"
              className="absolute left-3 top-3 rounded-full p-1.5 text-night-700/40 transition hover:bg-brand-50 hover:text-rose-500 active:scale-90 dark:text-brand-100/40 dark:hover:bg-night-700"
            >
              <X size={18} />
            </button>

            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-night-700 dark:text-brand-300">
              <Download size={30} />
            </span>

            <h2 className="mt-4 text-xl font-extrabold text-night-900 dark:text-brand-50">
              زیادی بکە بۆ شاشەی سەرەکی
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-night-700/70 dark:text-brand-100/60">
              وەک ئەپێکی ڕاستەقینە بەکاریبهێنە — خێراتر و ئاسانتر دەیکەیتەوە 📲
            </p>

            {ios ? (
              <>
                <p className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl bg-brand-50 px-3 py-3 text-xs font-medium leading-relaxed text-brand-700 dark:bg-night-700/60 dark:text-brand-200">
                  دوگمەی هاوبەشکردن
                  <Share size={15} className="inline" />
                  لێبدە، پاشان «Add to Home Screen» هەڵبژێرە
                </p>
                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-4 w-full rounded-2xl bg-brand-500 px-4 py-3 font-bold text-white transition hover:bg-brand-600 active:scale-95"
                >
                  باشە
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={install}
                  disabled={!deferred}
                  className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-brand-500 px-4 py-3 font-bold text-white transition hover:bg-brand-600 active:scale-95 disabled:opacity-50"
                >
                  <Download size={18} /> زیادی بکە
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-2 w-full py-1.5 text-sm font-semibold text-night-700/50 transition hover:text-night-900 active:scale-95 dark:text-brand-100/50 dark:hover:text-brand-50"
                >
                  دواتر
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

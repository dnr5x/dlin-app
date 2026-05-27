import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import BottomNav from './BottomNav.jsx'
import CreationHub from './CreationHub.jsx'
import OnboardingModals from './OnboardingModals.jsx'

/**
 * The global app shell — a dead-simple, full-height flex column:
 *
 *   ┌─ frame (h-100dvh, flex-col) ─┐
 *   │  main  (flex-1, scrolls)     │
 *   │  …                           │
 *   └──────────────────────────────┘
 *      BottomNav (fixed, bottom-0)
 *
 * The nav is a separate fixed block pinned to the true viewport bottom (the
 * frame is only `relative` so overlay modals can anchor to it — `relative` does
 * NOT trap a fixed child). No floating desktop frame, no guessed paddings.
 */
export default function Layout({ children }) {
  const mainRef = useRef(null)
  const { pathname } = useLocation()

  // Reset the content area to the top on every page change, so a new page
  // never opens already scrolled down. (Also reset the window, just in case.)
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    // The app container is pinned to the viewport with `fixed inset-0` — sized by
    // insets, NOT by a 100dvh height calc, so it can never mis-measure and has no
    // overflow-hidden ancestor to trap the fixed nav. A SOLID background means any
    // theoretical sub-pixel gap is invisible. No margins, no spacers. `mx-auto`/
    // `max-w` centre the column on desktop; being `fixed` it also anchors modals.
    <div className="fixed inset-0 mx-auto flex max-w-[440px] flex-col bg-white dark:bg-night-900">
      {/* The ONLY scroller. Content scrolls behind the fixed nav; the bottom
          padding (nav height + home-indicator inset) keeps the last item clear —
          done with PADDING, never an empty spacer element. */}
      <main
        ref={mainRef}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-4"
      >
        {children}
      </main>

      {/* "+" action — on Home and the Exams page (both invite adding via "+").
          Other pages (Settings, Subjects, …) stay clean/button-free. */}
      {(pathname === '/' || pathname === '/exams') && <CreationHub />}

      {/* Bottom nav — sibling of the scroller, position: fixed; bottom: 0. */}
      <BottomNav />

      {/* Sequenced onboarding pop-ups: Eid greeting first, then the centered
          "Add to Home Screen" install modal — never both at once. */}
      <OnboardingModals />
    </div>
  )
}

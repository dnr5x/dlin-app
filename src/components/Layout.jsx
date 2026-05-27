import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import BottomNav from './BottomNav.jsx'
import CreationHub from './CreationHub.jsx'

/**
 * The global app shell. On phones it fills the screen; on desktop it is
 * constrained to a phone-sized frame and centered, so the experience stays
 * mobile-first everywhere.
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
    <div className="flex min-h-screen w-full justify-center bg-brand-100 dark:bg-[var(--app-bg-dark)] sm:py-6">
      <div
        className="app-frame relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden
                   sm:h-[calc(100vh-3rem)] sm:max-h-[920px] sm:rounded-[2.5rem] sm:shadow-2xl
                   sm:ring-[10px] sm:ring-night-900/10 dark:sm:ring-black/40"
      >
        {/* Scrollable content area. Bottom padding keeps content clear of the nav. */}
        <main ref={mainRef} className="no-scrollbar safe-top flex-1 overflow-y-auto px-5 pb-32 pt-4">
          {children}
        </main>

        {/* Global "+" action — add a task / exam / note from anywhere. */}
        <CreationHub />

        <BottomNav />
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BookOpen, Timer, Settings } from 'lucide-react'

// Bottom navigation items. Order is RTL-aware automatically via flex-row.
const ITEMS = [
  { to: '/', label: 'ماڵەوە', Icon: Home, end: true },
  { to: '/subjects', label: 'بابەتەکان', Icon: BookOpen },
  { to: '/focus', label: 'تەرکیز', Icon: Timer },
  { to: '/settings', label: 'ڕێکخستن', Icon: Settings },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Optimistic active tab: updated the instant a tab is tapped, so the
  // highlight moves in 0ms instead of waiting for the router + next page mount.
  const [activeTab, setActiveTab] = useState(pathname)

  // Keep it in sync when navigation comes from anywhere else (links, back btn…).
  useEffect(() => {
    setActiveTab(pathname)
  }, [pathname])

  const isActive = (to, end) =>
    end ? activeTab === to : activeTab === to || activeTab.startsWith(`${to}/`)

  const go = (to) => {
    if (to === activeTab) return
    // Commit the highlight synchronously (0ms) BEFORE navigating, so the heavy
    // next-page render can't batch with — and block — the visual update.
    // (flushSync rather than startTransition: a deferred transition collides
    // with the page-level <AnimatePresence mode="wait"> and stalls navigation.)
    flushSync(() => setActiveTab(to))
    navigate(to)
  }

  return (
    <nav
      className="shrink-0 border-t border-brand-200/70 bg-white dark:border-white/5 dark:bg-night-900"
      aria-label="ناڤیگەیشنی سەرەکی"
    >
      <ul className="flex h-16 items-stretch justify-around px-2">
        {ITEMS.map(({ to, label, Icon, end }) => {
          const active = isActive(to, end)
          return (
            <li key={to} className="flex-1">
              <button
                type="button"
                onClick={() => go(to)}
                aria-current={active ? 'page' : undefined}
                className="touch-target group relative flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition-transform active:scale-95"
              >
                {/* Soft active-tab pill that slides between items. */}
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-1 -z-10 rounded-2xl bg-brand-100 dark:bg-night-700"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon
                  size={24}
                  strokeWidth={active ? 2.5 : 2}
                  className={
                    active
                      ? 'text-brand-600 dark:text-brand-300'
                      : 'text-night-700/60 dark:text-brand-100/50'
                  }
                />
                <span
                  className={
                    active
                      ? 'text-brand-700 dark:text-brand-200'
                      : 'text-night-700/60 dark:text-brand-100/50'
                  }
                >
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

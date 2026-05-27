import { NavLink } from 'react-router-dom'
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
  return (
    <nav
      className="app-nav safe-bottom absolute inset-x-0 bottom-0 z-20 border-t border-brand-200/70
                 backdrop-blur-lg dark:border-white/5"
      aria-label="ناڤیگەیشنی سەرەکی"
    >
      <ul className="flex items-stretch justify-around px-2 py-1">
        {ITEMS.map(({ to, label, Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className="touch-target group relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium"
            >
              {({ isActive }) => (
                <>
                  {/* Soft active-tab pill that slides between items. */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-1 -z-10 rounded-2xl bg-brand-100 dark:bg-night-700"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={
                      isActive
                        ? 'text-brand-600 dark:text-brand-300'
                        : 'text-night-700/60 dark:text-brand-100/50'
                    }
                  />
                  <span
                    className={
                      isActive
                        ? 'text-brand-700 dark:text-brand-200'
                        : 'text-night-700/60 dark:text-brand-100/50'
                    }
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, User, CalendarDays, Trash2, Heart, Palette, Check } from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { useApp } from '../context/AppContext.jsx'

// The six selectable accent themes. `swatch` is a representative color shown
// in the picker; the actual palette is driven by CSS variables in index.css.
const COLOR_THEMES = [
  { id: 'purple', label: 'مۆر', swatch: '#8b5cf6' },
  { id: 'pink', label: 'پەمەیی', swatch: '#ec4899' },
  { id: 'darkpink', label: 'پەمەیی تۆخ', swatch: '#e11d48' },
  { id: 'whitepink', label: 'پەمەیی کاڵ', swatch: '#ffb3d6' },
  { id: 'black', label: 'ڕەش', swatch: '#27272a' },
  { id: 'white', label: 'سپی', swatch: '#f4f4f5' },
]

// Convert the stored ISO datetime to a value the <input type="date"> accepts.
const toDateInput = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function Settings() {
  const { theme, toggleTheme, color, setColor, studentName, setStudentName, examDate, setExamDate } =
    useApp()
  const [confirmReset, setConfirmReset] = useState(false)

  const clearAllData = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('dlin:'))
      .forEach((k) => localStorage.removeItem(k))
    // Reload so every context value re-reads its defaults.
    window.location.href = '/'
  }

  return (
    <PageTransition>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-night-900 dark:text-brand-50">ڕێکخستنەکان</h1>
        <p className="mt-1 text-night-700/80 dark:text-brand-100/70">
          دلین بەو شێوەیە ڕێکی بخە کە حەزت لێیەتی.
        </p>
      </header>

      <div className="space-y-4">
        {/* Student name */}
        <SettingCard>
          <label className="block">
            <span className="mb-2 flex items-center gap-3">
              <IconBubble><User size={20} /></IconBubble>
              <span className="font-bold text-night-900 dark:text-brand-50">ناو</span>
            </span>
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              dir="rtl"
              placeholder="ناوەکەت بنووسە"
              className="field text-right"
            />
          </label>
        </SettingCard>

        {/* Dark mode */}
        <SettingCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBubble>{theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}</IconBubble>
              <div>
                <p dir="ltr" className="font-bold text-night-900 dark:text-brand-50">Dark Mode</p>
                <p className="text-xs text-night-700/70 dark:text-brand-100/60">
                  بۆ ئەوەی چاوت نەیەشێ
                </p>
              </div>
            </div>
            <Toggle on={theme === 'dark'} onClick={toggleTheme} />
          </div>
        </SettingCard>

        {/* Accent color theme */}
        <SettingCard>
          <div className="mb-3 flex items-center gap-3">
            <IconBubble><Palette size={20} /></IconBubble>
            <div>
              <p className="font-bold text-night-900 dark:text-brand-50">ڕەنگی دڵخوازت</p>
              <p className="text-xs text-night-700/70 dark:text-brand-100/60">
                ڕەنگێک هەڵبژێرە کە حەزت لێیەتی
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {COLOR_THEMES.map((c) => {
              const active = color === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  aria-label={c.label}
                  aria-pressed={active}
                  className={`touch-target flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition active:scale-95 ${
                    active
                      ? 'border-brand-500 bg-brand-50 dark:bg-night-700'
                      : 'border-transparent bg-brand-50/50 dark:bg-night-700/50'
                  }`}
                >
                  <motion.span
                    whileTap={{ scale: 0.85 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-black/10 dark:ring-white/15"
                    style={{ backgroundColor: c.swatch }}
                  >
                    {active && (
                      <Check
                        size={20}
                        className={c.id === 'white' || c.id === 'whitepink' ? 'text-night-900' : 'text-white'}
                      />
                    )}
                  </motion.span>
                  <span className="text-xs font-semibold text-night-900 dark:text-brand-50">
                    {c.label}
                  </span>
                </button>
              )
            })}
          </div>
        </SettingCard>

        {/* Exam date */}
        <SettingCard>
          <label className="block">
            <span className="mb-2 flex items-center gap-3">
              <IconBubble><CalendarDays size={20} /></IconBubble>
              <span className="font-bold text-night-900 dark:text-brand-50">
                بەرواری تاقیکردنەوەکان
              </span>
            </span>
            <input
              type="date"
              value={toDateInput(examDate)}
              onChange={(e) => {
                if (e.target.value) setExamDate(`${e.target.value}T08:00:00`)
              }}
              dir="ltr"
              /* Same iOS/Safari hardening as the Home exam widget: fill the
                 container without overflow, strip native chrome, keep a fixed
                 height so Safari can't collapse it, and force a visible text
                 color (WebKit pseudo-element fixes live in index.css).
                 min-w-0 + max-w-full hard-cap the width at 100% of the card so
                 iOS's intrinsic date-field width can never push it past the edge. */
              className="field block h-12 w-full min-w-0 max-w-full box-border appearance-none text-left text-night-900 dark:text-brand-50"
            />
            <span className="mt-2 block text-xs text-night-700/70 dark:text-brand-100/60">
              ئەم بەروارە لە ژمێرەرەوەی ماڵەوەدا بەکاردێت.
            </span>
          </label>
        </SettingCard>

        {/* Reset data */}
        <SettingCard>
          <button
            onClick={() => setConfirmReset(true)}
            className="flex w-full items-center gap-3 text-right"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 dark:bg-rose-500/15">
              <Trash2 size={20} />
            </span>
            <span>
              <span className="block font-bold text-rose-600 dark:text-rose-400">
                سڕینەوەی هەموو داتاکان
              </span>
              <span className="block text-xs text-night-700/70 dark:text-brand-100/60">
                تێبینی، کویز و ڕێکخستنەکان دەسڕێنەوە
              </span>
            </span>
          </button>
        </SettingCard>

        <p className="flex items-center justify-center gap-1.5 py-2 text-center text-sm text-night-700/60 dark:text-brand-100/50">
          بە <Heart size={14} className="fill-rose-400 text-rose-400" /> بۆ دلین
        </p>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={clearAllData}
        title="سڕینەوەی هەموو داتاکان؟"
        message="هەموو تێبینی، کویز و ڕێکخستنەکانت بۆ هەمیشە دەسڕێنەوە. دڵنیایت؟"
        confirmLabel="بەڵێ، بیسڕەوە"
      />
    </PageTransition>
  )
}

function SettingCard({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4"
    >
      {children}
    </motion.div>
  )
}

function IconBubble({ children }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-night-700 dark:text-brand-300">
      {children}
    </span>
  )
}

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label="گۆڕینی دۆخی تاریک"
      className={`touch-target relative flex h-8 w-14 items-center rounded-full px-1 transition ${
        on ? 'bg-brand-500' : 'bg-brand-200 dark:bg-night-600'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`h-6 w-6 rounded-full bg-white shadow ${on ? 'mr-auto' : 'ml-auto'}`}
      />
    </button>
  )
}

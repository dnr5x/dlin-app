import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, BookOpen, ChevronDown } from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'
import CountdownTimer from '../components/CountdownTimer.jsx'
import QuoteWidget from '../components/QuoteWidget.jsx'
import LevelBar from '../components/LevelBar.jsx'
import NextExamCard from '../components/NextExamCard.jsx'
import TodoWidget from '../components/TodoWidget.jsx'
import StudyTracker from '../components/StudyTracker.jsx'
import TodaySchedule from '../components/TodaySchedule.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useApp } from '../context/AppContext.jsx'
import { useFocusLauncher } from '../context/FocusContext.jsx'

// Current hour (0–23) in Baghdad (Kurdistan), independent of the device timezone.
function baghdadHour(d = new Date()) {
  return parseInt(
    d.toLocaleString('en-US', { timeZone: 'Asia/Baghdad', hour: 'numeric', hourCycle: 'h23' }),
    10
  )
}

// Kurdish time-of-day label for a given hour (shared by greeting + clock).
function periodLabel(h) {
  if (h >= 5 && h < 12) return 'بەیانی' // 05:00–11:59
  if (h >= 12 && h < 16) return 'نیوەڕۆ' // 12:00–15:59
  if (h >= 16 && h < 20) return 'ئێوارە' // 16:00–19:59
  return 'شەو' // 20:00–04:59
}

// Greeting that adapts to the time of day in Baghdad. Returns text + emoji.
function greeting() {
  const h = baghdadHour()
  if (h >= 5 && h < 12) return 'بەیانیت باش 🌸'
  if (h >= 12 && h < 16) return 'نیوەڕۆت باش ☀️'
  if (h >= 16 && h < 20) return 'ئێوارەت باش 🌇'
  return 'شەوت باش 🌙'
}

// Live clock: Baghdad time, 12-hour, with a Kurdish period label. Ticks each minute.
function LiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const time = now
    .toLocaleTimeString('en-US', {
      timeZone: 'Asia/Baghdad',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/\s?(AM|PM)$/i, '')

  return (
    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-night-700/55 dark:text-brand-100/50">
      🕒 <span dir="ltr">{time}</span> ی {periodLabel(baghdadHour(now))}
    </span>
  )
}

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
}
const item = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
}

export default function Home() {
  const { studentName, examDate } = useApp()
  const { requestFocus } = useFocusLauncher()

  return (
    <PageTransition>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">
        {/* Warm greeting header */}
        <motion.header variants={item}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-brand-500 dark:text-brand-300">{greeting()}</p>
            <LiveClock />
          </div>
          <h1 className="mt-1 text-2xl font-extrabold leading-snug text-night-900 dark:text-brand-50">
            بەخێربێیتەوە {studentName}!
          </h1>
          <MoodCheck />
        </motion.header>

        {/* Level & XP progress (not in the requested list — kept as a top status). */}
        <motion.div variants={item}>
          <LevelBar />
        </motion.div>

        {/* 2) Main exam countdown — motivation */}
        <motion.div variants={item}>
          <CountdownTimer target={examDate} />
        </motion.div>

        {/* Quote of the day — above the quick actions */}
        <motion.div variants={item}>
          <QuoteWidget />
        </motion.div>

        {/* Quick actions — sleek dashboard cards (compact, not big blocks). */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          {/* Focus shortcut — opens the global focus picker, then routes in. */}
          <button
            type="button"
            onClick={() => requestFocus({ contextTitle: '' })}
            className="card flex items-center gap-3 p-4 text-right transition active:scale-95"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blush-100 text-rose-500 dark:bg-night-700">
              <Timer size={22} />
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-night-900 dark:text-brand-50">تەرکیز</span>
              <span className="block truncate text-xs text-night-700/60 dark:text-brand-100/60">
                دەست بکە بە تەرکیز
              </span>
            </span>
          </button>

          <Link
            to="/subjects"
            className="card flex items-center gap-3 p-4 transition active:scale-95"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-night-700">
              <BookOpen size={22} />
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-night-900 dark:text-brand-50">بابەتەکان</span>
              <span className="block truncate text-xs text-night-700/60 dark:text-brand-100/60">
                تێبینی و کویزەکان
              </span>
            </span>
          </Link>
        </motion.div>

        {/* Today's schedule — placed below the quick actions */}
        <motion.div variants={item}>
          <TodaySchedule />
        </motion.div>

        {/* Today's tasks */}
        <motion.div variants={item}>
          <TodoWidget />
        </motion.div>

        {/* 6) Study stats / streak */}
        <motion.div variants={item}>
          <StudyTracker />
        </motion.div>

        {/* Next upcoming exam only — full schedule lives on /exams. */}
        <motion.div variants={item}>
          <NextExamCard />
        </motion.div>

      </motion.div>
    </PageTransition>
  )
}

// A tiny, optional mood check that lives under the greeting. It opens in three
// steps: a collapsed "how are you today?" prompt → tap to reveal Good/Bad pills
// → tap a pill to settle on a warm reply.
function MoodCheck() {
  const today = new Date().toDateString()
  const [lastCheck, setLastCheck] = useLocalStorage('dlin:lastMoodCheckDate', '')
  const [open, setOpen] = useState(false) // are the Good/Bad pills revealed?
  const [mood, setMood] = useState(null) // null = unanswered | 'good' | 'bad'

  // After a mood is picked, show the reply for 3s, then clear it. Since picking
  // also stamps today's date, the guard below then keeps the whole widget hidden
  // until a new day. Cleanup avoids a stray timer firing after unmount.
  useEffect(() => {
    if (!mood) return
    const id = setTimeout(() => {
      setMood(null)
      setOpen(false)
    }, 3000)
    return () => clearTimeout(id)
  }, [mood])

  // Record the daily check-in, then reveal the reply.
  const choose = (value) => {
    setLastCheck(today)
    setMood(value)
  }

  // Already checked in today (and not mid-reply) → hide entirely until a new day.
  if (lastCheck === today && !mood) return null

  // Once answered, show only the final message (for 3s, per the effect above).
  if (mood) {
    const reply = mood === 'good' ? 'باشتر بی ئینشەڵا!' : 'هەوڵدە باش بی!'
    return (
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1 text-night-700/80 dark:text-brand-100/70"
      >
        {reply}
      </motion.p>
    )
  }

  return (
    <div className="mt-1">
      {/* Step 1: the clickable prompt. Tapping it toggles the pills open. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 text-night-700/80 transition active:scale-95 dark:text-brand-100/70"
      >
        چۆنی ئەمڕۆ؟
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-brand-400"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      {/* Step 2: the revealed Good/Bad pills. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => choose('good')}
                className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700 transition active:scale-95 dark:bg-emerald-500/15 dark:text-emerald-300"
              >
                باشم
              </button>
              <button
                type="button"
                onClick={() => choose('bad')}
                className="rounded-full bg-blush-100 px-4 py-1.5 text-sm font-semibold text-rose-600 transition active:scale-95 dark:bg-rose-500/15 dark:text-rose-300"
              >
                خراپم
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

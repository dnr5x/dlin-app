import { Calculator, Atom, FlaskConical, Dna, BookOpen, Languages, Globe } from 'lucide-react'

// The default 12th-grade (scientific track) subjects, in Kurdish (Sorani).
// These are only used to *seed* the store the first time; afterwards Dlin can
// add / edit / delete subjects freely (persisted in AppContext + localStorage).
// `gradient`/`soft` are literal Tailwind classes so they're picked up at build.
export const DEFAULT_SUBJECTS = [
  { id: 'math', name: 'بیرکاری', emoji: '📐', gradient: 'from-brand-300 to-brand-500', soft: 'bg-brand-100 text-brand-700' },
  { id: 'physics', name: 'فیزیا', emoji: '⚛️', gradient: 'from-sky-400 to-blue-500', soft: 'bg-sky-soft text-blue-700' },
  { id: 'chemistry', name: 'کیمیا', emoji: '🧪', gradient: 'from-emerald-300 to-teal-500', soft: 'bg-emerald-100 text-emerald-700' },
  { id: 'biology', name: 'زیندەوەرزانی', emoji: '🧬', gradient: 'from-pink-300 to-rose-500', soft: 'bg-blush-100 text-rose-700' },
  { id: 'kurdish', name: 'کوردی', emoji: '📖', gradient: 'from-amber-300 to-orange-500', soft: 'bg-amber-100 text-amber-700' },
  { id: 'arabic', name: 'عەرەبی', emoji: '🕌', gradient: 'from-cyan-300 to-sky-500', soft: 'bg-cyan-100 text-cyan-700' },
  { id: 'english', name: 'ئینگلیزی', emoji: '🔤', gradient: 'from-indigo-300 to-violet-500', soft: 'bg-indigo-100 text-indigo-700' },
]

// Mobile-friendly lucide icon for each default subject, keyed by id. Cards fall
// back to the subject's emoji for anything not listed here (e.g. custom subjects).
export const SUBJECT_ICONS = {
  math: Calculator,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  kurdish: BookOpen,
  arabic: Languages,
  english: Globe,
}

// Color presets shown in the "add/edit subject" picker. The first six match the
// defaults above. All gradient/soft strings are literal so Tailwind generates them.
export const SUBJECT_COLORS = [
  { id: 'purple', gradient: 'from-brand-300 to-brand-500', soft: 'bg-brand-100 text-brand-700', swatch: '#8b5cf6' },
  { id: 'blue', gradient: 'from-sky-400 to-blue-500', soft: 'bg-sky-soft text-blue-700', swatch: '#3b82f6' },
  { id: 'teal', gradient: 'from-emerald-300 to-teal-500', soft: 'bg-emerald-100 text-emerald-700', swatch: '#14b8a6' },
  { id: 'rose', gradient: 'from-pink-300 to-rose-500', soft: 'bg-blush-100 text-rose-700', swatch: '#f43f5e' },
  { id: 'amber', gradient: 'from-amber-300 to-orange-500', soft: 'bg-amber-100 text-amber-700', swatch: '#f59e0b' },
  { id: 'indigo', gradient: 'from-indigo-300 to-violet-500', soft: 'bg-indigo-100 text-indigo-700', swatch: '#6366f1' },
  { id: 'cyan', gradient: 'from-cyan-300 to-sky-500', soft: 'bg-cyan-100 text-cyan-700', swatch: '#06b6d4' },
  { id: 'green', gradient: 'from-lime-300 to-green-500', soft: 'bg-lime-100 text-green-700', swatch: '#22c55e' },
  { id: 'fuchsia', gradient: 'from-fuchsia-300 to-purple-500', soft: 'bg-fuchsia-100 text-fuchsia-700', swatch: '#d946ef' },
  { id: 'slate', gradient: 'from-slate-400 to-slate-600', soft: 'bg-slate-100 text-slate-700', swatch: '#64748b' },
]

// Quick-pick emojis for new subjects (Dlin can also type her own).
export const SUBJECT_EMOJIS = [
  '📚', '📐', '⚛️', '🧪', '🧬', '📖', '🔤', '🌍', '🖥️', '💻',
  '🎨', '🎵', '⚽', '🧠', '📊', '🗺️', '🔬', '🧮', '📝', '🏛️',
]

// Default appearance for a brand-new subject.
export const DEFAULT_SUBJECT_LOOK = {
  emoji: '📚',
  gradient: SUBJECT_COLORS[0].gradient,
  soft: SUBJECT_COLORS[0].soft,
}

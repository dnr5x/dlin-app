// XP-based leveling. Each completed focus session awards +50 XP (see Focus.jsx).
// `min` is the cumulative XP needed to *reach* that level.
export const LEVELS = [
  { level: 1, min: 0, title: 'قوتابی چالاک' },
  { level: 2, min: 100, title: 'قوتابی زیرەک' },
  { level: 3, min: 250, title: 'پێشەنگ' },
  { level: 4, min: 450, title: 'قوتابی بەهرەمەند' },
  { level: 5, min: 700, title: 'زیرەکی پۆل' },
  { level: 6, min: 1000, title: 'شارەزای بابەتەکان' },
  { level: 7, min: 1400, title: 'پاڵەوانی خوێندن' },
  { level: 8, min: 1900, title: 'ئەستێرەی دەرسەکان' },
  { level: 9, min: 2500, title: 'نەهەنگی تاقیکردنەوە' },
  { level: 10, min: 3200, title: 'وەحشی وەزاری' },
]

/**
 * Resolve XP into level info: current title, and progress toward the next level.
 * At the max level, progress is full and `xpToNext` is 0.
 */
export function levelInfo(xp = 0) {
  // Highest level whose threshold we've reached.
  let idx = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) idx = i
  }
  const current = LEVELS[idx]
  const next = LEVELS[idx + 1] // undefined at max level
  const isMax = !next

  const span = isMax ? 1 : next.min - current.min
  const into = xp - current.min
  const progress = isMax ? 1 : Math.min(1, into / span)

  return {
    level: current.level,
    title: current.title,
    isMax,
    xp,
    xpIntoLevel: into,
    xpForLevel: span,
    xpToNext: isMax ? 0 : next.min - xp,
    progress,
  }
}

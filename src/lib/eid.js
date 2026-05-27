// Eid greeting configuration & date logic, shared by the greeting modal and the
// onboarding sequencer. Kept out of the component file so the date helpers can be
// imported without tripping react-refresh's "only export components" rule.

// The single calendar day the greeting may appear on — Eid al-Adha 2026.
// (To greet a future Eid: bump EID_DATE and use a fresh EID_SEEN_KEY so the new
// Eid shows once on its own.)
export const EID_DATE = '2026-05-27'
export const EID_SEEN_KEY = 'dlin:hasSeenEid2026'
export const EID_NAME = 'جەژنی قوربان'

// Today's LOCAL date as YYYY-MM-DD (day-level granularity is all we compare).
export function todayKey(d = new Date()) {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

// True only on the exact Eid date.
export function isEidToday() {
  return todayKey() === EID_DATE
}

/**
 * Has the Eid greeting already been dismissed? Reads the flag STRICTLY and
 * synchronously from localStorage so the decision is instant and never depends
 * on async state — the greeting can never flash twice within a storage context.
 * Robust to every truthy encoding the flag may have been written as.
 */
export function hasSeenEid() {
  try {
    const v = localStorage.getItem(EID_SEEN_KEY)
    return v === 'true' || v === '"true"' || v === '1'
  } catch {
    // If storage is unreachable, fail safe by NOT re-showing repeatedly.
    return true
  }
}

// Persist the "seen" flag immediately and directly to localStorage.
export function markEidSeen() {
  try {
    localStorage.setItem(EID_SEEN_KEY, 'true')
  } catch {
    /* storage unavailable — nothing more we can do */
  }
}

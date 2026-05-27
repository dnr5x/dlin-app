import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * In-window pub/sub so that multiple useLocalStorage hooks bound to the SAME key
 * stay in sync immediately. The native `storage` event only fires in OTHER tabs,
 * never the document that wrote — so without this, e.g. the global "add" modal
 * and the Home list (both reading `dlin:todos`) would drift until a reload.
 */
const channels = new Map() // key -> Set<(value, origin) => void>
function subscribe(key, fn) {
  let set = channels.get(key)
  if (!set) {
    set = new Set()
    channels.set(key, set)
  }
  set.add(fn)
  return () => set.delete(fn)
}
function publish(key, value, origin) {
  channels.get(key)?.forEach((fn) => fn(value, origin))
}

/**
 * A small wrapper around useState that transparently persists the value to
 * localStorage. Used to keep notes, quizzes, settings, and theme on the device.
 *
 * @param {string} key      localStorage key
 * @param {*}      initial  default value (or a function returning it)
 */
export function useLocalStorage(key, initial) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') return resolve(initial)
    let raw = null
    try {
      raw = window.localStorage.getItem(key)
    } catch {
      // Storage is entirely unavailable (private mode, blocked) — run on the
      // default in memory; we simply won't persist.
      return resolve(initial)
    }
    if (raw === null) return resolve(initial)
    try {
      return JSON.parse(raw)
    } catch {
      // The stored value is corrupt. Never silently throw the student's bytes
      // away: stash the original under a one-time backup key so it can be
      // recovered, then fall back to the default so the app keeps working.
      try {
        const backupKey = `${key}__corrupt`
        if (window.localStorage.getItem(backupKey) === null) {
          window.localStorage.setItem(backupKey, raw)
        }
      } catch {
        /* backup is best-effort */
      }
      return resolve(initial)
    }
  }, [key, initial])

  const [value, setValue] = useState(readValue)
  const originRef = useRef({}) // stable identity for this hook instance
  const didMount = useRef(false) // guards the first persist (see below)

  // Persist on every change, then notify sibling hooks in THIS window.
  useEffect(() => {
    // Skip the very first run. On mount `value` is just the freshly-read value
    // (or the default when nothing is stored yet) — writing it back here would,
    // in the worst case, clobber good data with a default. We only ever persist
    // genuine, post-mount changes.
    if (!didMount.current) {
      didMount.current = true
      return
    }
    // Never write `undefined` over a previously good value.
    if (value === undefined) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage might be full or blocked; keep the in-memory value */
    }
    publish(key, value, originRef.current)
  }, [key, value])

  // Stay in sync with sibling hooks (same window, via pub/sub) and with other
  // tabs/windows (via the native `storage` event).
  useEffect(() => {
    const onLocal = (newValue, origin) => {
      if (origin !== originRef.current) setValue(newValue)
    }
    const unsubscribe = subscribe(key, onLocal)

    const onStorage = (e) => {
      if (e.key !== key || e.newValue == null) return
      try {
        setValue(JSON.parse(e.newValue))
      } catch {
        /* ignore malformed values */
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      unsubscribe()
      window.removeEventListener('storage', onStorage)
    }
  }, [key])

  return [value, setValue]
}

function resolve(v) {
  return typeof v === 'function' ? v() : v
}

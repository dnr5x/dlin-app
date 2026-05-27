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
    try {
      const raw = window.localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : resolve(initial)
    } catch {
      return resolve(initial)
    }
  }, [key, initial])

  const [value, setValue] = useState(readValue)
  const originRef = useRef({}) // stable identity for this hook instance

  // Persist on every change, then notify sibling hooks in THIS window.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage might be full or blocked; fail silently */
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

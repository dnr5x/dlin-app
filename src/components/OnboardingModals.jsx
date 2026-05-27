import { useState } from 'react'
import EidGreeting from './EidGreeting.jsx'
import InstallPrompt from './InstallPrompt.jsx'
import { isEidToday, hasSeenEid, markEidSeen } from '../lib/eid.js'

/**
 * The app's pop-up sequencer — guarantees the student is never bombarded by two
 * modals at once. Order of operations on app open:
 *
 *   1. If the Eid greeting is due (exact date + not yet seen), show ONLY it.
 *   2. While the Eid greeting is open, the PWA install modal stays dormant
 *      (`enabled={false}` → it renders nothing).
 *   3. Once the Eid greeting is dismissed — OR if it was never due — the install
 *      modal becomes eligible and may then appear.
 *
 * The "seen" flag is read straight from localStorage (synchronous + robust via
 * hasSeenEid), so the greeting decision is made instantly on mount and the modal
 * can never flash twice within a storage context.
 */
export default function OnboardingModals() {
  const [eidOpen, setEidOpen] = useState(() => isEidToday() && !hasSeenEid())

  const closeEid = () => {
    markEidSeen() // persist immediately, directly to localStorage
    setEidOpen(false)
  }

  // The install prompt is allowed to appear only when no Eid greeting is showing.
  const installEnabled = !eidOpen

  return (
    <>
      <EidGreeting open={eidOpen} onClose={closeEid} />
      <InstallPrompt enabled={installEnabled} />
    </>
  )
}

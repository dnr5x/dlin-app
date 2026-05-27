import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { FocusProvider } from './context/FocusContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* App-wide safety net: any render error shows a Kurdish fallback instead
        of a blank white screen, with a one-tap recovery. */}
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <FocusProvider>
            <App />
          </FocusProvider>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)

// Data permanency: ask the browser to mark our storage as *persistent*. Without
// this, localStorage is "best-effort" and can be evicted under disk pressure —
// with it, the student's exams/tasks/notes survive indefinitely. Best-effort and
// never blocks startup; if the API is missing or denied, normal storage is used.
if (navigator.storage?.persist) {
  navigator.storage
    .persisted()
    .then((already) => {
      if (!already) navigator.storage.persist().catch(() => {})
    })
    .catch(() => {})
}

// Service worker: enable offline PWA support in production only.
// In development it must stay OFF, otherwise it caches the app shell and
// serves stale files — which makes code/data changes appear "not to work".
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* best-effort registration */
      })
    })
  } else {
    // Tear down any service worker + caches left over from a previous visit.
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()))
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
    }
  }
}

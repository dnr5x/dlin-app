import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

/**
 * App-wide safety net. Catches any unhandled error thrown while rendering the
 * child tree and shows a calm Kurdish fallback instead of React's blank
 * "white screen of death". Recovery re-reads fresh state, so transient data
 * inconsistencies clear on the next mount.
 *
 * Must be a class component — only class lifecycles (getDerivedStateFromError /
 * componentDidCatch) can intercept render-time errors.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Surface the real error in the console for debugging; users only see the
    // friendly fallback below.
    console.error('ErrorBoundary caught an error:', error, info)
  }

  // A full reload remounts the app and re-reads localStorage from scratch —
  // the most reliable way back from a temporary state inconsistency.
  handleRecover = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        dir="rtl"
        className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-brand-50 px-6 text-center dark:bg-night-900"
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-500 dark:bg-amber-500/15">
          <AlertTriangle size={40} />
        </span>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-night-900 dark:text-brand-50">
            ببوورە، هەڵەیەک لە سیستەمەکەدا ڕوویدا ⚠️
          </h1>
          <p className="max-w-xs text-sm text-night-700/80 dark:text-brand-100/70">
            هیچ شتێکت لەدەست نەچووە — تەنها دووبارە دەستپێبکەرەوە و بەردەوام بە.
          </p>
        </div>

        <button
          onClick={this.handleRecover}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-95"
        >
          <RotateCcw size={18} /> گەڕانەوە و نوێکردنەوە
        </button>
      </div>
    )
  }
}

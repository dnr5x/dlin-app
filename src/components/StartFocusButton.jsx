import { Timer } from 'lucide-react'
import { useFocusLauncher } from '../context/FocusContext.jsx'

const DEFAULT_LABEL = 'دەست بکە بە سەعی'

/**
 * Universal "Start Focusing" action. Drop it into any component to send the
 * student into Focus mode with context:
 *
 *   <StartFocusButton contextTitle="خوێندنی فیزیا" />            // prompts for time
 *   <StartFocusButton contextTitle="ئەرک" estimatedMinutes={25} /> // jumps straight in
 *
 * Variants keep it at home everywhere:
 *   • default  → full pill button with icon + label
 *   • iconOnly → compact icon button (e.g. inside a dense task row)
 *
 * `className` overrides the look entirely; `children` overrides the label.
 */
export default function StartFocusButton({
  contextTitle,
  contextDetail,
  estimatedMinutes,
  iconOnly = false,
  icon: Icon = Timer,
  className,
  children,
}) {
  const { requestFocus } = useFocusLauncher()

  const start = (e) => {
    e.preventDefault()
    e.stopPropagation()
    requestFocus({ contextTitle, contextDetail, estimatedMinutes })
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={start}
        aria-label={DEFAULT_LABEL}
        title={DEFAULT_LABEL}
        className={
          className ||
          'shrink-0 rounded-lg p-1 text-brand-500 transition hover:bg-brand-100 active:scale-90 dark:text-brand-300 dark:hover:bg-night-700'
        }
      >
        <Icon size={16} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={start}
      className={
        className ||
        'flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-95'
      }
    >
      <Icon size={18} /> {children || DEFAULT_LABEL}
    </button>
  )
}

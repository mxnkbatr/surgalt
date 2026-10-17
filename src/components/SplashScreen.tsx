import { useEffect, useState } from 'react'

const SPLASH_MS = 1800

type Props = {
  /** When false, parent controls unmount (no auto fade). */
  autoHide?: boolean
}

export function SplashScreen({ autoHide = true }: Props) {
  const [phase, setPhase] = useState<'in' | 'out' | 'gone'>('in')

  useEffect(() => {
    if (!autoHide) return
    const fade = window.setTimeout(() => setPhase('out'), SPLASH_MS)
    const remove = window.setTimeout(() => setPhase('gone'), SPLASH_MS + 450)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(remove)
    }
  }, [autoHide])

  if (autoHide && phase === 'gone') return null

  return (
    <div
      className={`splash${autoHide && phase === 'out' ? ' splash--out' : ''}`}
      aria-hidden="true"
    >
      <div className="splash__glow" aria-hidden="true" />
      <div className="splash__mark">
        <img className="splash__icon" src="/logo.svg" alt="" width="64" height="64" />
        <p className="splash__brand">
          surgalt<span>.</span>
        </p>
      </div>
    </div>
  )
}

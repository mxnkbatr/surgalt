import { useEffect, useState, type ReactNode } from 'react'
import { hasCompletedOnboarding, Onboarding } from './Onboarding'
import { SplashScreen } from './SplashScreen'

const SPLASH_MS = 1500

type Phase = 'splash' | 'onboarding' | 'ready'

type Props = {
  children: ReactNode
}

export function AppBoot({ children }: Props) {
  const [phase, setPhase] = useState<Phase>('splash')
  const [splashOut, setSplashOut] = useState(false)

  useEffect(() => {
    const fade = window.setTimeout(() => setSplashOut(true), SPLASH_MS)
    const next = window.setTimeout(() => {
      setPhase(hasCompletedOnboarding() ? 'ready' : 'onboarding')
    }, SPLASH_MS + 380)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(next)
    }
  }, [])

  return (
    <>
      {children}
      {phase === 'splash' && (
        <div className={splashOut ? 'splash--host-out' : undefined}>
          <SplashScreen autoHide={false} />
        </div>
      )}
      {phase === 'onboarding' && <Onboarding onDone={() => setPhase('ready')} />}
    </>
  )
}

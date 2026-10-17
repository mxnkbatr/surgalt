import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  fetchUnlocked,
  getGuestUnlocked,
  unlockCourse as unlockGuest,
  unlockCoursesForUser as unlockOnServer,
} from '../lib/access'

type AccessContextValue = {
  unlocked: string[]
  isUnlocked: (slug: string) => boolean
  refresh: () => Promise<void>
  unlockCourses: (slugs: string[]) => Promise<void>
  unlockGuestCourse: (slug: string) => void
}

const AccessContext = createContext<AccessContextValue | null>(null)

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [unlocked, setUnlocked] = useState<string[]>([])

  const refresh = useCallback(async () => {
    if (!user) {
      setUnlocked(getGuestUnlocked())
      return
    }
    try {
      const list = await fetchUnlocked()
      setUnlocked(list)
    } catch {
      setUnlocked([])
    }
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<AccessContextValue>(
    () => ({
      unlocked,
      isUnlocked(slug) {
        return unlocked.includes(slug)
      },
      refresh,
      async unlockCourses(slugs) {
        if (!user) {
          for (const s of slugs) unlockGuest(s)
          setUnlocked(getGuestUnlocked())
          return
        }
        const list = await unlockOnServer(slugs)
        setUnlocked(list)
      },
      unlockGuestCourse(slug) {
        unlockGuest(slug)
        setUnlocked(getGuestUnlocked())
      },
    }),
    [unlocked, refresh, user],
  )

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
}

export function useAccess() {
  const ctx = useContext(AccessContext)
  if (!ctx) throw new Error('useAccess must be used within AccessProvider')
  return ctx
}

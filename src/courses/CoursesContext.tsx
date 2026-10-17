import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Course } from '../data/courses'
import { fetchCourses } from '../lib/coursesApi'

type CoursesContextValue = {
  courses: Course[]
  ready: boolean
  error: string | null
  refresh: () => Promise<void>
  getCourse: (slug: string) => Course | undefined
}

const CoursesContext = createContext<CoursesContextValue | null>(null)

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const list = await fetchCourses()
      setCourses(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Сургалт ачааллахад алдаа гарлаа.')
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<CoursesContextValue>(
    () => ({
      courses,
      ready,
      error,
      refresh,
      getCourse(slug) {
        return courses.find((c) => c.slug === slug)
      },
    }),
    [courses, ready, error, refresh],
  )

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>
}

export function useCourses() {
  const ctx = useContext(CoursesContext)
  if (!ctx) throw new Error('useCourses must be used within CoursesProvider')
  return ctx
}

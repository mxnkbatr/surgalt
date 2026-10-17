import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useCourses } from '../courses/CoursesContext'
import type { Course } from '../data/courses'

type CartContextValue = {
  slugs: string[]
  items: Course[]
  count: number
  total: number
  has: (slug: string) => boolean
  add: (slug: string) => void
  remove: (slug: string) => void
  clear: () => void
}

const KEY = 'dcapital-cart'
const CartContext = createContext<CartContextValue | null>(null)

function readCart(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { courses } = useCourses()
  const [slugs, setSlugs] = useState<string[]>(() => readCart())

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(slugs))
  }, [slugs])

  const value = useMemo<CartContextValue>(() => {
    const items = slugs
      .map((slug) => courses.find((c) => c.slug === slug))
      .filter((c): c is Course => Boolean(c))

    return {
      slugs,
      items,
      count: items.length,
      total: items.reduce((sum, c) => sum + c.price, 0),
      has: (slug) => slugs.includes(slug),
      add: (slug) => {
        setSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]))
      },
      remove: (slug) => {
        setSlugs((prev) => prev.filter((s) => s !== slug))
      },
      clear: () => setSlugs([]),
    }
  }, [slugs, courses])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

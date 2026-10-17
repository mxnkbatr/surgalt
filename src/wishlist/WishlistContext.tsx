import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type WishlistContextValue = {
  slugs: string[]
  count: number
  has: (slug: string) => boolean
  toggle: (slug: string) => void
}

const KEY = 'surgalt-wishlist'
const WishlistContext = createContext<WishlistContextValue | null>(null)

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>(() => read())

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(slugs))
  }, [slugs])

  const value = useMemo<WishlistContextValue>(
    () => ({
      slugs,
      count: slugs.length,
      has: (slug) => slugs.includes(slug),
      toggle: (slug) => {
        setSlugs((prev) =>
          prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
        )
      },
    }),
    [slugs],
  )

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}

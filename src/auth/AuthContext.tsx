import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError, api, getToken, setToken } from '../lib/api'
import { formatPhoneDisplay, normalizePhone } from './phone'

export type AuthUser = {
  id: string
  name: string
  phone: string
  isAdmin?: boolean
  unlockedSlugs?: string[]
}

type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string }

type AuthContextValue = {
  user: AuthUser | null
  login: (phone: string, password: string) => Promise<AuthResult>
  signup: (name: string, phone: string, password: string) => Promise<AuthResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const token = getToken()
    if (!token) {
      setReady(true)
      return
    }

    const failSafe = window.setTimeout(() => {
      if (!cancelled) setReady(true)
    }, 9000)

    void api<{ user: AuthUser }>('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        window.clearTimeout(failSafe)
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
      window.clearTimeout(failSafe)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async login(phoneInput, password) {
        const phone = normalizePhone(phoneInput)
        if (!phone) {
          return { ok: false, error: 'Утасны дугаараа зөв оруулна уу (8 орон).' }
        }
        if (password.length < 6) {
          return { ok: false, error: 'Нууц үг хамгийн багадаа 6 тэмдэгт байна.' }
        }

        try {
          const data = await api<{ token: string; user: AuthUser }>('/auth/login', {
            method: 'POST',
            json: { phone, password },
          })
          setToken(data.token)
          setUser(data.user)
          return { ok: true, user: data.user }
        } catch (err) {
          if (err instanceof ApiError) {
            return { ok: false, error: err.message }
          }
          if (err instanceof TypeError) {
            return {
              ok: false,
              error: 'Серверт холбогдож чадсангүй. npm run dev ажиллуулсан эсэхээ шалгана уу.',
            }
          }
          return { ok: false, error: 'Нэвтрэх амжилтгүй.' }
        }
      },

      async signup(nameInput, phoneInput, password) {
        const name = nameInput.trim()
        const phone = normalizePhone(phoneInput)

        if (name.length < 2) {
          return { ok: false, error: 'Нэрээ оруулна уу.' }
        }
        if (!phone) {
          return {
            ok: false,
            error: 'Утасны дугаар 8 оронтой байх ёстой (жишээ: 9911 2233).',
          }
        }
        if (password.length < 6) {
          return { ok: false, error: 'Нууц үг хамгийн багадаа 6 тэмдэгт байна.' }
        }

        try {
          const data = await api<{ token: string; user: AuthUser }>('/auth/signup', {
            method: 'POST',
            json: { name, phone, password },
          })
          setToken(data.token)
          setUser(data.user)
          return { ok: true, user: data.user }
        } catch (err) {
          if (err instanceof ApiError) {
            return { ok: false, error: err.message }
          }
          if (err instanceof TypeError) {
            return {
              ok: false,
              error: 'Серверт холбогдож чадсангүй. npm run dev ажиллуулсан эсэхээ шалгана уу.',
            }
          }
          return { ok: false, error: 'Бүртгэл амжилтгүй.' }
        }
      },

      logout() {
        setToken(null)
        setUser(null)
      },
    }),
    [user],
  )

  if (!ready) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function displayUserPhone(phone: string) {
  return `+976 ${formatPhoneDisplay(phone)}`
}

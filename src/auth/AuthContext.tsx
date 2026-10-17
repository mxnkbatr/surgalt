import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { formatPhoneDisplay, normalizePhone } from './phone'

export type AuthUser = {
  id: string
  name: string
  phone: string
  isAdmin?: boolean
}

type StoredUser = AuthUser & {
  passwordHash: string
  createdAt: string
}

type AuthResult = { ok: true } | { ok: false; error: string }

type AuthContextValue = {
  user: AuthUser | null
  login: (phone: string, password: string) => Promise<AuthResult>
  signup: (name: string, phone: string, password: string) => Promise<AuthResult>
  logout: () => void
}

const USERS_KEY = 'surgalt-users'
const SESSION_KEY = 'surgalt-session'

/** Админ: утас 9000 0000 · нууц үг admin123 */
const ADMIN_PHONE = '90000000'
const ADMIN_PASSWORD = 'admin123'

const AuthContext = createContext<AuthContextValue | null>(null)

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : []
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    if (!parsed?.id || !parsed?.phone) return null
    return parsed
  } catch {
    return null
  }
}

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(`surgalt:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function ensureAdminUser() {
  const users = readUsers()
  if (users.some((u) => u.phone === ADMIN_PHONE || u.isAdmin)) return
  const passwordHash = await hashPassword(ADMIN_PASSWORD)
  writeUsers([
    ...users,
    {
      id: 'u_admin',
      name: 'Админ',
      phone: ADMIN_PHONE,
      isAdmin: true,
      passwordHash,
      createdAt: new Date().toISOString(),
    },
  ])
}

function toPublicUser(u: StoredUser): AuthUser {
  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    isAdmin: Boolean(u.isAdmin),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readSession())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void ensureAdminUser().finally(() => setReady(true))
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [user])

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

        await ensureAdminUser()
        const users = readUsers()
        const found = users.find((u) => u.phone === phone)
        if (!found) {
          return { ok: false, error: 'Энэ дугаараар бүртгэл олдсонгүй.' }
        }

        const hash = await hashPassword(password)
        if (hash !== found.passwordHash) {
          return { ok: false, error: 'Нууц үг буруу байна.' }
        }

        setUser(toPublicUser(found))
        return { ok: true }
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
        if (phone === ADMIN_PHONE) {
          return { ok: false, error: 'Энэ дугаарыг ашиглах боломжгүй.' }
        }
        if (password.length < 6) {
          return { ok: false, error: 'Нууц үг хамгийн багадаа 6 тэмдэгт байна.' }
        }

        const users = readUsers()
        if (users.some((u) => u.phone === phone)) {
          return { ok: false, error: 'Энэ дугаар аль хэдийн бүртгэлтэй байна.' }
        }

        const passwordHash = await hashPassword(password)
        const next: StoredUser = {
          id: `u_${Date.now().toString(36)}`,
          name,
          phone,
          passwordHash,
          createdAt: new Date().toISOString(),
        }
        writeUsers([...users, next])
        setUser(toPublicUser(next))
        return { ok: true }
      },

      logout() {
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

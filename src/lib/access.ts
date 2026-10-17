const GUEST_KEY = 'surgalt-unlocked'
const USER_KEY = 'surgalt-unlocked-by-user'

type UnlockMap = Record<string, string[]>

function readGuest(): string[] {
  try {
    const raw = sessionStorage.getItem(GUEST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function writeGuest(slugs: string[]) {
  sessionStorage.setItem(GUEST_KEY, JSON.stringify(slugs))
}

function readMap(): UnlockMap {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as UnlockMap) : {}
  } catch {
    return {}
  }
}

function writeMap(map: UnlockMap) {
  localStorage.setItem(USER_KEY, JSON.stringify(map))
}

/** Одоогийн хэрэглэгчийн нээлттэй сургалтууд */
export function getUnlocked(userId?: string | null): string[] {
  if (!userId) return readGuest()
  const map = readMap()
  return Array.isArray(map[userId]) ? map[userId] : []
}

export function isUnlocked(slug: string, userId?: string | null): boolean {
  return getUnlocked(userId).includes(slug)
}

/** Зочин (session) — карт демо */
export function unlockCourse(slug: string) {
  const next = new Set(readGuest())
  next.add(slug)
  writeGuest([...next])
}

/** Админ баталгаажуулсны дараа хэрэглэгчид нээх */
export function unlockCoursesForUser(userId: string, slugs: string[]) {
  const map = readMap()
  const next = new Set(map[userId] ?? [])
  for (const slug of slugs) next.add(slug)
  map[userId] = [...next]
  writeMap(map)

  // Хэрэв энэ төхөөрөмж дээрх session мөн тэр хэрэглэгч бол guest key-д ч синк
  try {
    const session = localStorage.getItem('surgalt-session')
    if (session) {
      const user = JSON.parse(session) as { id?: string }
      if (user?.id === userId) {
        const merged = new Set([...readGuest(), ...slugs])
        writeGuest([...merged])
      }
    }
  } catch {
    /* ignore */
  }
}

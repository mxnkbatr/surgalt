import { api } from './api'

const GUEST_KEY = 'dcapital-unlocked'

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

/** Зочин (session) — карт демо */
export function unlockCourse(slug: string) {
  const next = new Set(readGuest())
  next.add(slug)
  writeGuest([...next])
}

export function getGuestUnlocked(): string[] {
  return readGuest()
}

export async function fetchUnlocked(): Promise<string[]> {
  const data = await api<{ unlocked: string[] }>('/access/unlocked')
  return data.unlocked
}

export async function unlockCoursesForUser(slugs: string[]): Promise<string[]> {
  const data = await api<{ unlocked: string[] }>('/access/unlock', {
    method: 'POST',
    json: { slugs },
  })
  return data.unlocked
}

export function isGuestUnlocked(slug: string) {
  return readGuest().includes(slug)
}

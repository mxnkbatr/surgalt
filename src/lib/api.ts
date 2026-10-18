const TOKEN_KEY = 'dcapital-token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const controller = new AbortController()
  const timeoutMs = 8000
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      ...options,
      headers,
      body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
      signal: options.signal ?? controller.signal,
    })
  } catch {
    throw new ApiError(
      0,
      'Серверт холбогдож чадсангүй. API болон MongoDB холболтоо шалгана уу.',
    )
  } finally {
    window.clearTimeout(timer)
  }

  const data = (await res.json().catch(() => ({}))) as {
    error?: string
  } & T

  if (!res.ok) {
    const fallback =
      res.status === 502 || res.status === 504
        ? 'API сервер ажиллахгүй байна. Терминалд npm run dev дахин ажиллуулна уу.'
        : 'Алдаа гарлаа.'
    throw new ApiError(res.status, data.error || fallback)
  }

  return data
}

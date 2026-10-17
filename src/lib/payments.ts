export type PaymentStatus = 'pending' | 'approved' | 'rejected'

export type PaymentOrder = {
  id: string
  ref: string
  userId: string
  userName: string
  phone: string
  slugs: string[]
  titles: string[]
  amount: number
  status: PaymentStatus
  createdAt: string
  reviewedAt?: string
}

const KEY = 'surgalt-payments'

function readAll(): PaymentOrder[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as PaymentOrder[]) : []
  } catch {
    return []
  }
}

function writeAll(orders: PaymentOrder[]) {
  localStorage.setItem(KEY, JSON.stringify(orders))
}

export function listPayments(): PaymentOrder[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function listPendingPayments(): PaymentOrder[] {
  return listPayments().filter((o) => o.status === 'pending')
}

export function createPaymentOrder(
  input: Omit<PaymentOrder, 'id' | 'status' | 'createdAt' | 'reviewedAt'>,
): PaymentOrder {
  const order: PaymentOrder = {
    ...input,
    id: `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  writeAll([order, ...readAll()])
  return order
}

export function updatePaymentStatus(
  id: string,
  status: 'approved' | 'rejected',
): PaymentOrder | null {
  const all = readAll()
  const idx = all.findIndex((o) => o.id === id)
  if (idx < 0) return null
  const next = {
    ...all[idx],
    status,
    reviewedAt: new Date().toISOString(),
  }
  all[idx] = next
  writeAll(all)
  return next
}

export function getUserPendingPayments(userId: string): PaymentOrder[] {
  return listPayments().filter((o) => o.userId === userId && o.status === 'pending')
}

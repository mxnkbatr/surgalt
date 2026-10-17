import { api } from './api'

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

export async function listPayments(): Promise<PaymentOrder[]> {
  const data = await api<{ payments: PaymentOrder[] }>('/payments')
  return data.payments
}

export async function createPaymentOrder(input: {
  ref: string
  slugs: string[]
  titles: string[]
  amount: number
}): Promise<PaymentOrder> {
  const data = await api<{ payment: PaymentOrder }>('/payments', {
    method: 'POST',
    json: input,
  })
  return data.payment
}

export async function updatePaymentStatus(
  id: string,
  status: 'approved' | 'rejected',
): Promise<PaymentOrder> {
  const data = await api<{ payment: PaymentOrder }>(`/payments/${id}`, {
    method: 'PATCH',
    json: { status },
  })
  return data.payment
}

export async function getUserPendingPayments(userId: string): Promise<PaymentOrder[]> {
  const all = await listPayments()
  return all.filter((o) => o.userId === userId && o.status === 'pending')
}

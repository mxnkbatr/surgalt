import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { displayUserPhone, useAuth } from '../auth/AuthContext'
import { Logo } from '../components/Logo'
import { unlockCoursesForUser } from '../lib/access'
import {
  listPayments,
  updatePaymentStatus,
  type PaymentOrder,
  type PaymentStatus,
} from '../lib/payments'
import { formatPrice } from '../data/courses'

type Filter = 'pending' | 'all'

export function AdminPage() {
  const { user, logout } = useAuth()
  const [filter, setFilter] = useState<Filter>('pending')
  const [orders, setOrders] = useState<PaymentOrder[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  const refresh = useCallback(() => {
    const all = listPayments()
    setOrders(filter === 'pending' ? all.filter((o) => o.status === 'pending') : all)
  }, [filter])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/admin' }} />
  }

  if (!user.isAdmin) {
    return <Navigate to="/profile" replace />
  }

  function onReview(id: string, status: Extract<PaymentStatus, 'approved' | 'rejected'>) {
    setBusyId(id)
    const updated = updatePaymentStatus(id, status)
    if (updated && status === 'approved') {
      unlockCoursesForUser(updated.userId, updated.slugs)
    }
    refresh()
    setBusyId(null)
  }

  const pendingCount = listPayments().filter((o) => o.status === 'pending').length

  return (
    <div className="admin-page">
      <header className="admin-page__bar">
        <Link to="/" className="admin-page__brand">
          <Logo size={32} />
          <span>
            surgalt<span>.</span> admin
          </span>
        </Link>
        <div className="admin-page__actions">
          <button type="button" className="admin-page__ghost" onClick={refresh}>
            Шинэчлэх
          </button>
          <button type="button" className="admin-page__ghost" onClick={logout}>
            Гарах
          </button>
        </div>
      </header>

      <div className="admin-page__inner">
        <header className="admin-page__head">
          <div>
            <p className="admin-page__eyebrow">Хяналт</p>
            <h1>Төлбөрийн хүсэлт</h1>
            <p className="admin-page__lead">
              Дансаар шилжүүлсэн эсэхийг шалгаад хэрэглэгчийн хичээлийг нээнэ үү.
            </p>
          </div>
          <div className="admin-page__stat">
            <b>{pendingCount}</b>
            <span>Хүлээгдэж буй</span>
          </div>
        </header>

        <div className="ios-segmented admin-page__tabs" role="tablist">
          <button
            type="button"
            className={`ios-segmented__item${filter === 'pending' ? ' is-active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Хүлээгдэж буй
          </button>
          <button
            type="button"
            className={`ios-segmented__item${filter === 'all' ? ' is-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Бүгд
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="admin-empty">
            <h2>Хүсэлт алга</h2>
            <p>
              {filter === 'pending'
                ? 'Шинэ шилжүүлгийн хүсэлт ирээгүй байна.'
                : 'Одоогоор төлбөрийн бүртгэл байхгүй.'}
            </p>
          </div>
        ) : (
          <div className="admin-list">
            {orders.map((order) => (
              <article key={order.id} className="admin-card">
                <div className="admin-card__top">
                  <span className={`admin-card__status is-${order.status}`}>
                    {statusLabel(order.status)}
                  </span>
                  <time dateTime={order.createdAt}>
                    {new Date(order.createdAt).toLocaleString('mn-MN')}
                  </time>
                </div>

                <h2>{formatPrice(order.amount)}</h2>
                <p className="admin-card__ref">Утга: {order.ref}</p>

                <dl className="admin-card__meta">
                  <div>
                    <dt>Хэрэглэгч</dt>
                    <dd>
                      {order.userName} · {displayUserPhone(order.phone)}
                    </dd>
                  </div>
                  <div>
                    <dt>Сургалт</dt>
                    <dd>{order.titles.join(', ')}</dd>
                  </div>
                </dl>

                {order.status === 'pending' && (
                  <div className="admin-card__actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={busyId === order.id}
                      onClick={() => onReview(order.id, 'approved')}
                    >
                      Баталгаажуулах · Нээх
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      disabled={busyId === order.id}
                      onClick={() => onReview(order.id, 'rejected')}
                    >
                      Татгалзах
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function statusLabel(status: PaymentStatus) {
  if (status === 'pending') return 'Хүлээгдэж буй'
  if (status === 'approved') return 'Баталгаажсан'
  return 'Татгалзсан'
}

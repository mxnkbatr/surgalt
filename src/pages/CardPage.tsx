import { useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAccess } from '../access/AccessContext'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'
import { useCourses } from '../courses/CoursesContext'
import { formatPrice, type Course } from '../data/courses'

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

function formatCardNumber(value: string) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()
}

function formatExpiry(value: string) {
  const digits = onlyDigits(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function CardPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { unlockCourses, unlockGuestCourse } = useAccess()
  const { getCourse } = useCourses()
  const { items, total, clear } = useCart()
  const navigate = useNavigate()

  const single = slug ? getCourse(slug) : undefined
  const orderItems: Course[] = single ? [single] : items
  const orderTotal = single ? single.price : total
  const backTo = single ? `/surgalt/${single.slug}` : '/sags'

  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [paying, setPaying] = useState(false)

  const displayNumber = number || '•••• •••• •••• ••••'
  const displayName = name.trim() || 'КАРТ ЭЗЭМШИГЧ'
  const displayExpiry = expiry || 'MM/YY'

  const canSubmit = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      onlyDigits(number).length === 16 &&
      onlyDigits(expiry).length === 4 &&
      onlyDigits(cvv).length >= 3 &&
      orderItems.length > 0
    )
  }, [name, number, expiry, cvv, orderItems.length])

  if (!single && items.length === 0) {
    return <Navigate to="/sags" replace />
  }

  if (slug && !single) {
    return <Navigate to="/surgalt" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit || paying) return

    setPaying(true)
    const slugs = orderItems.map((item) => item.slug)

    window.setTimeout(() => {
      void (async () => {
        try {
          if (user) {
            await unlockCourses(slugs)
          } else {
            for (const s of slugs) unlockGuestCourse(s)
          }
          if (!single) clear()
          const target = single
            ? `/surgalt/${single.slug}?paid=1`
            : `/surgalt/${orderItems[0].slug}?paid=1`
          navigate(target, { replace: true })
        } finally {
          setPaying(false)
        }
      })()
    }, 900)
  }

  return (
    <div className="card-page">
      <header className="card-page__bar">
        <Link to={backTo} className="card-page__back" aria-label="Буцах">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path
              d="M13.5 5 7.5 11l6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1>Карт төлбөр</h1>
        <span className="card-page__bar-space" />
      </header>

      <div className="card-page__inner">
        <div className="pay-card" aria-hidden="true">
          <div className="pay-card__top">
            <span className="pay-card__brand">Dcapital</span>
            <span className="pay-card__chip" />
          </div>
          <p className="pay-card__number">{displayNumber}</p>
          <div className="pay-card__bottom">
            <div>
              <span>Эзэмшигч</span>
              <strong>{displayName}</strong>
            </div>
            <div>
              <span>Дуусах</span>
              <strong>{displayExpiry}</strong>
            </div>
          </div>
        </div>

        <aside className="card-order">
          {single ? (
            <>
              <div
                className="card-order__thumb"
                style={{
                  background: `linear-gradient(135deg, ${single.accent}, #1a1f1c)`,
                }}
              >
                {single.coverLabel.split('\n')[0]}
              </div>
              <div>
                <h2>{single.title}</h2>
                <p>{single.lessons.length} хичээл · насан туршийн хандалт</p>
                <div className="card-order__price">
                  <s>{formatPrice(single.originalPrice)}</s>
                  <b>{formatPrice(single.price)}</b>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="card-order__thumb card-order__thumb--multi">
                {orderItems.length}
              </div>
              <div>
                <h2>Сагсны захиалга</h2>
                <p>{orderItems.length} сургалт</p>
                <div className="card-order__price">
                  <b>{formatPrice(orderTotal)}</b>
                </div>
              </div>
            </>
          )}
        </aside>

        <form className="card-form" onSubmit={onSubmit}>
          <label className="card-field">
            <span>Карт дээрх нэр</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="BOLD BAT"
              autoComplete="cc-name"
            />
          </label>

          <label className="card-field">
            <span>Картын дугаар</span>
            <input
              value={number}
              onChange={(e) => setNumber(formatCardNumber(e.target.value))}
              placeholder="ACCT-000003"
              autoComplete="cc-number"
              inputMode="numeric"
            />
          </label>

          <div className="card-form__row">
            <label className="card-field">
              <span>Дуусах хугацаа</span>
              <input
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                autoComplete="cc-exp"
                inputMode="numeric"
              />
            </label>
            <label className="card-field">
              <span>CVV</span>
              <input
                value={cvv}
                onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, 4))}
                placeholder="123"
                autoComplete="cc-csc"
                inputMode="numeric"
                type="password"
              />
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary card-form__submit"
            disabled={!canSubmit || paying}
          >
            {paying ? 'Төлж байна…' : `${formatPrice(orderTotal)} төлөх`}
          </button>

          <Link
            to={single ? `/transfer/${single.slug}` : '/transfer'}
            className="transfer-alt"
          >
            Дансаар шилжүүлэх (Хаан банк)
          </Link>

          <p className="card-form__note">
            Картын төлбөр демо горим. Жинхэнэ төлбөрт дансаар шилжүүлнэ үү.
          </p>
        </form>
      </div>
    </div>
  )
}

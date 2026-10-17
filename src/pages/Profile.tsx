import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { displayUserPhone, useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'
import { AppHeader } from '../components/AppHeader'
import { legalDocs, type LegalDoc } from '../data/legal'
import { getUnlocked } from '../lib/access'
import { getUserPendingPayments } from '../lib/payments'
import { courses, formatPrice } from '../data/courses'
import { useWishlist } from '../wishlist/WishlistContext'

type SheetId = LegalDoc['id'] | null

export function Profile() {
  const { user, logout } = useAuth()
  const { count: cartCount } = useCart()
  const { count: wishCount } = useWishlist()
  const [sheet, setSheet] = useState<SheetId>(null)

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/profile' }} />
  }

  const owned = getUnlocked(user.id)
    .map((slug) => courses.find((c) => c.slug === slug))
    .filter(Boolean)
  const pending = getUserPendingPayments(user.id)

  const lessonsDone = owned.reduce((sum, c) => sum + (c?.lessons.length ?? 0), 0)
  const initial = (user?.name?.trim()?.[0] ?? 'С').toUpperCase()

  return (
    <div className="ios-page profile-screen">
      <AppHeader />

      <header className="ios-large-title">
        <p className="ios-large-title__eyebrow">Акаунт</p>
        <h1>Профайл</h1>
      </header>

      <section className="profile-hero profile-hero--rich">
        <div className="profile-hero__glow" aria-hidden="true" />
        <div className="profile-hero__top">
          <div className="profile-hero__avatar" aria-hidden="true">
            {initial}
          </div>
          <div className="profile-hero__meta">
            <span className="profile-hero__badge is-on">
              {user.isAdmin ? 'Админ' : 'Нэвтэрсэн'}
            </span>
            <h2>{user.name}</h2>
            <p>{displayUserPhone(user.phone)}</p>
          </div>
          <button type="button" className="profile-hero__edit" onClick={logout}>
            Гарах
          </button>
        </div>

        <div className="profile-stats" aria-label="Товч статистик">
          <div className="profile-stats__item">
            <b>{owned.length}</b>
            <span>Сургалт</span>
          </div>
          <div className="profile-stats__item">
            <b>{lessonsDone}</b>
            <span>Хичээл</span>
          </div>
          <div className="profile-stats__item">
            <b>{wishCount}</b>
            <span>Хүсэлт</span>
          </div>
          <div className="profile-stats__item">
            <b>{cartCount}</b>
            <span>Сагс</span>
          </div>
        </div>
      </section>

      <div className="profile-quick">
        <Link to="/surgalt" className="profile-quick__chip">
          <RowIcon kind="book" />
          Сургалт
        </Link>
        <Link to="/wishlist" className="profile-quick__chip">
          <RowIcon kind="heart" />
          Хүсэлт
        </Link>
        <Link to="/sags" className="profile-quick__chip">
          <RowIcon kind="cart" />
          Сагс
          {cartCount > 0 && <i>{cartCount}</i>}
        </Link>
      </div>

      {user.isAdmin && (
        <Link to="/admin" className="btn btn-primary profile-login" style={{ marginBottom: 16 }}>
          Админ панел
        </Link>
      )}

      {pending.length > 0 && (
        <section className="ios-section">
          <h3 className="ios-section__label">Хүлээгдэж буй төлбөр</h3>
          <div className="ios-group">
            {pending.map((order) => (
              <div key={order.id} className="ios-row">
                <span className="ios-row__text">
                  <b>{formatPrice(order.amount)}</b>
                  <small>
                    {order.ref} · {order.titles.join(', ')}
                  </small>
                </span>
                <span className="profile-pending-pill">Шалгагдаж байна</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="ios-section">
        <h3 className="ios-section__label">Миний сургалт</h3>
        <div className="ios-group">
          {owned.length === 0 ? (
            <div className="profile-empty">
              <div className="profile-empty__icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10.5a1.5 1.5 0 0 1-1.5 1.5H7A3 3 0 0 0 4 21V7.5Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                </svg>
              </div>
              <h4>Одоогоор сургалт алга</h4>
              <p>Худалдан авсан хичээлүүд энд харагдана.</p>
              <Link to="/surgalt" className="btn btn-primary profile-empty__cta">
                Сургалт үзэх
              </Link>
            </div>
          ) : (
            owned.map((course) =>
              course ? (
                <Link key={course.id} to={`/surgalt/${course.slug}`} className="ios-row profile-course">
                  <span
                    className="profile-course__thumb"
                    style={{ background: `linear-gradient(135deg, ${course.accent}, #1a1f1c)` }}
                  >
                    {course.coverLabel.split('\n')[0]}
                  </span>
                  <span className="ios-row__text">
                    <b>{course.title}</b>
                    <small>
                      {course.lessons.length} хичээл · {formatPrice(course.price)}
                    </small>
                  </span>
                  <Chevron />
                </Link>
              ) : null,
            )
          )}
        </div>
      </section>

      <section className="ios-section">
        <h3 className="ios-section__label">Тохиргоо</h3>
        <div className="ios-group">
          <Link to="/sags" className="ios-row">
            <RowIcon kind="cart" />
            <span className="ios-row__text">
              <b>Сагс</b>
              <small>{cartCount > 0 ? `${cartCount} сургалт хүлээгдэж байна` : 'Хоосон'}</small>
            </span>
            <Chevron />
          </Link>
          <Link to="/wishlist" className="ios-row">
            <RowIcon kind="heart" />
            <span className="ios-row__text">
              <b>Хүслийн жагсаалт</b>
              <small>{wishCount > 0 ? `${wishCount} хадгалсан` : 'Хадгалаагүй'}</small>
            </span>
            <Chevron />
          </Link>
          <button type="button" className="ios-row" onClick={() => setSheet('help')}>
            <RowIcon kind="help" />
            <span className="ios-row__text">
              <b>Тусламж</b>
              <small>Түгээмэл асуулт, дэмжлэг</small>
            </span>
            <Chevron />
          </button>
        </div>
      </section>

      <section className="ios-section">
        <h3 className="ios-section__label">Хууль эрх зүй</h3>
        <div className="ios-group">
          <button type="button" className="ios-row" onClick={() => setSheet('terms')}>
            <RowIcon kind="doc" />
            <span className="ios-row__text">
              <b>Үйлчилгээний нөхцөл</b>
              <small>Худалдан авалт, эрх үүрэг</small>
            </span>
            <Chevron />
          </button>
          <button type="button" className="ios-row" onClick={() => setSheet('privacy')}>
            <RowIcon kind="shield" />
            <span className="ios-row__text">
              <b>Нууцлалын бодлого</b>
              <small>Өгөгдөл хэрхэн хамгаалагдах вэ</small>
            </span>
            <Chevron />
          </button>
          <button type="button" className="ios-row" onClick={() => setSheet('about')}>
            <RowIcon kind="info" />
            <span className="ios-row__text">
              <b>surgalt. тухай</b>
              <small>Хувилбар 1.0.0</small>
            </span>
            <Chevron />
          </button>
        </div>
      </section>

      <button type="button" className="btn btn-ghost profile-login" onClick={logout}>
        Системээс гарах
      </button>

      {sheet && <LegalSheet doc={legalDocs[sheet]} onClose={() => setSheet(null)} />}
    </div>
  )
}

function LegalSheet({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div className="legal-sheet" role="dialog" aria-modal="true" aria-label={doc.title}>
      <button type="button" className="legal-sheet__backdrop" aria-label="Хаах" onClick={onClose} />
      <div className="legal-sheet__panel">
        <div className="legal-sheet__grab" aria-hidden="true" />
        <div className="legal-sheet__head">
          <div>
            <p className="legal-sheet__eyebrow">{doc.eyebrow}</p>
            <h2>{doc.title}</h2>
          </div>
          <button type="button" className="app-header__icon" aria-label="Хаах" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="legal-sheet__body">
          {doc.sections.map((s) => (
            <article key={s.heading} className="legal-sheet__section">
              <h3>{s.heading}</h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
        <button type="button" className="btn btn-primary legal-sheet__done" onClick={onClose}>
          Ойлголоо
        </button>
      </div>
    </div>,
    document.body,
  )
}

function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M7 4.5 11.5 9 7 13.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RowIcon({
  kind,
}: {
  kind: 'cart' | 'heart' | 'help' | 'doc' | 'shield' | 'info' | 'book'
}) {
  const paths: Record<typeof kind, ReactNode> = {
    book: (
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10.5a1.5 1.5 0 0 1-1.5 1.5H7A3 3 0 0 0 4 21V7.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    ),
    cart: (
      <>
        <path
          d="M4 6h2.2l1.3 9.2a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 2-1.6L21 8H7"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="19" r="1.2" fill="currentColor" />
        <circle cx="17" cy="19" r="1.2" fill="currentColor" />
      </>
    ),
    heart: (
      <path
        d="M12 20s-6.5-4.1-9-8.2C1.4 9 2.2 5.8 5.1 4.6c1.8-.7 3.8-.2 5 1.3 1.2-1.5 3.2-2 5-1.3 2.9 1.2 3.7 4.4 2.1 7.2C18.5 15.9 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M9.5 9.2a2.5 2.5 0 1 1 3.8 2.1c-.7.5-1.3 1-1.3 2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      </>
    ),
    doc: (
      <>
        <path
          d="M7 3.5h7.5L19 8v12.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M14.5 3.5V8H19" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </>
    ),
    shield: (
      <path
        d="M12 3.5 5.5 6v5.2c0 4 2.7 6.8 6.5 8.3 3.8-1.5 6.5-4.3 6.5-8.3V6L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 11v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill="currentColor" />
      </>
    ),
  }

  return (
    <span className="profile-row-icon" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        {paths[kind]}
      </svg>
    </span>
  )
}

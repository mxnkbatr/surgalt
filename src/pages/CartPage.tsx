import { Link, useNavigate } from 'react-router-dom'
import { useAccess } from '../access/AccessContext'
import { useCart } from '../cart/CartContext'
import { AppHeader } from '../components/AppHeader'
import { formatPrice } from '../data/courses'

export function CartPage() {
  const { isUnlocked } = useAccess()
  const { items, total, count, remove } = useCart()
  const navigate = useNavigate()

  return (
    <div className="ios-page cart-page">
      <AppHeader />
      <header className="ios-large-title">
        <p className="ios-large-title__eyebrow">Захиалга</p>
        <h1>Сагс</h1>
      </header>

      {count === 0 ? (
        <div className="ios-empty">
          <div className="ios-empty__icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h2.2l1.3 9.2a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 2-1.6L21 8H7"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="19" r="1.2" fill="currentColor" />
              <circle cx="17" cy="19" r="1.2" fill="currentColor" />
            </svg>
          </div>
          <h2>Сагс хоосон</h2>
          <p>Сонирхсон сургалтаа нэмээд эндээс төлбөрөө хийнэ.</p>
          <Link to="/surgalt" className="btn btn-primary">
            Сургалт үзэх
          </Link>
        </div>
      ) : (
        <>
          <div className="ios-group">
            {items.map((course) => {
              const owned = isUnlocked(course.slug)
              return (
                <div key={course.id} className="cart-item">
                  <Link
                    to={`/surgalt/${course.slug}`}
                    className="cart-item__main"
                  >
                    <div
                      className="cart-item__cover"
                      style={{
                        background: `linear-gradient(135deg, ${course.accent}, #1a1f1c)`,
                      }}
                    >
                      {course.coverLabel.split('\n')[0]}
                    </div>
                    <div className="cart-item__body">
                      <h3>{course.title}</h3>
                      <p>
                        {owned ? 'Аль хэдийн нээлттэй' : course.category}
                      </p>
                      <b>{formatPrice(course.price)}</b>
                    </div>
                  </Link>
                  <button
                    type="button"
                    className="cart-item__remove"
                    onClick={() => remove(course.slug)}
                    aria-label="Сагснаас хасах"
                  >
                    Хасах
                  </button>
                </div>
              )
            })}
          </div>

          <div className="ios-group cart-summary">
            <div className="cart-summary__row">
              <span>Нийт сургалт</span>
              <b>{count}</b>
            </div>
            <div className="cart-summary__row cart-summary__row--total">
              <span>Төлөх дүн</span>
              <b>{formatPrice(total)}</b>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary cart-checkout"
            onClick={() => navigate('/transfer')}
          >
            Дансаар шилжүүлэх
          </button>
          <button
            type="button"
            className="btn btn-ghost cart-checkout cart-checkout--alt"
            onClick={() => navigate('/card')}
          >
            Картаар төлөх
          </button>
        </>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { courses, formatPrice } from '../data/courses'
import { useWishlist } from '../wishlist/WishlistContext'
import { AppHeader } from '../components/AppHeader'

export function WishlistPage() {
  const { slugs, toggle } = useWishlist()
  const items = slugs
    .map((slug) => courses.find((c) => c.slug === slug))
    .filter(Boolean)

  return (
    <div className="ios-page wishlist-page">
      <AppHeader />
      <header className="ios-large-title">
        <p className="ios-large-title__eyebrow">Хадгалсан</p>
        <h1>Хүслийн жагсаалт</h1>
      </header>

      {items.length === 0 ? (
        <div className="ios-empty">
          <h2>Жагсаалт хоосон</h2>
          <p>Дуртай сургалтаа зүрх дээр дарж хадгалаарай.</p>
          <Link to="/surgalt" className="btn btn-primary">
            Сургалт үзэх
          </Link>
        </div>
      ) : (
        <div className="ios-group">
          {items.map((course) =>
            course ? (
              <div key={course.id} className="cart-item">
                <Link to={`/surgalt/${course.slug}`} className="cart-item__main">
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
                    <p>{course.category}</p>
                    <b>{formatPrice(course.price)}</b>
                  </div>
                </Link>
                <button
                  type="button"
                  className="cart-item__remove"
                  onClick={() => toggle(course.slug)}
                >
                  Хасах
                </button>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}

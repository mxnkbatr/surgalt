import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { useCourses } from '../courses/CoursesContext'
import { formatPrice } from '../data/courses'
import { useWishlist } from '../wishlist/WishlistContext'

const filters = ['Бүгд', 'Эрэлттэй', 'Шинэ'] as const

export function Home() {
  const { courses } = useCourses()
  const [filter, setFilter] = useState<(typeof filters)[number]>('Бүгд')
  const { has, toggle } = useWishlist()

  const list = useMemo(() => {
    if (filter === 'Эрэлттэй') {
      return courses.filter((c) => c.tag.includes('эрэлт') || c.tag.includes('Эрэлт'))
    }
    if (filter === 'Шинэ') {
      return courses.filter((c) => c.tag === 'Шинэ')
    }
    return courses
  }, [filter, courses])

  const featured = courses.slice(0, 3)

  return (
    <div className="app-home ios-page ios26">
      <AppHeader />

      <section className="home-hero-glass" aria-label="Онцлох баннер">
        <div className="home-hero-glass__media" aria-hidden="true">
          <span className="home-hero-glass__orb home-hero-glass__orb--a" />
          <span className="home-hero-glass__orb home-hero-glass__orb--b" />
          <span className="home-hero-glass__mesh" />
        </div>
        <div className="home-hero-glass__body">
          <p className="home-hero-glass__brand">
            Dcapital
          </p>
          <h1>
            <span className="home-hero-glass__line">Хичээлээ байршуул.</span>
            <span className="home-hero-glass__line">Худалдаж ав. Үз.</span>
          </h1>
          <Link to="/surgalt" className="home-hero-glass__cta">
            <span className="home-hero-glass__cta-shine" aria-hidden="true" />
            Сургалт үзэх
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>

      <div className="ios-segmented" role="tablist" aria-label="Шүүлтүүр">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={`ios-segmented__item${filter === f ? ' is-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <section className="app-section app-section--featured">
        <div className="app-section__head">
          <h2>Онцлох</h2>
          <Link to="/surgalt" className="ios-link-pill">
            Бүгд
          </Link>
        </div>
        <div className="featured-scroll">
          {featured.map((course) => (
            <div key={course.id} className="featured-card-wrap">
              <Link
                to={`/surgalt/${course.slug}`}
                className="featured-card featured-card--ios26"
                style={{
                  background: `linear-gradient(155deg, ${course.accent} 0%, #0e1412 100%)`,
                }}
              >
                <span className="featured-card__shine" aria-hidden="true" />
                <span className="featured-card__tag">{course.tag}</span>
                <div className="featured-card__foot">
                  <strong>{course.coverLabel}</strong>
                  <span className="featured-card__price">{formatPrice(course.price)}</span>
                </div>
              </Link>
              <button
                type="button"
                className={`wish-fab wish-fab--glass${has(course.slug) ? ' is-on' : ''}`}
                aria-label="Хүслийн жагсаалт"
                onClick={() => toggle(course.slug)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 20s-6.5-4.1-9-8.2C1.4 9 2.2 5.8 5.1 4.6c1.8-.7 3.8-.2 5 1.3 1.2-1.5 3.2-2 5-1.3 2.9 1.2 3.7 4.4 2.1 7.2C18.5 15.9 12 20 12 20Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                    fill={has(course.slug) ? 'currentColor' : 'none'}
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="app-section" id="courses">
        <div className="app-section__head">
          <h2>Бүх сургалт</h2>
          <span className="ios-count">{list.length}</span>
        </div>
        <div className="ios-group ios-group--list">
          {list.map((course, i) => (
            <Link
              key={course.id}
              to={`/surgalt/${course.slug}`}
              className={`home-course-row${i === list.length - 1 ? ' is-last' : ''}`}
            >
              <div
                className="home-course-row__cover"
                style={{
                  background: `linear-gradient(135deg, ${course.accent}, #1a1f1c)`,
                }}
              >
                <span>{course.coverLabel.split('\n')[0]}</span>
              </div>
              <div className="home-course-row__body">
                <h3>{course.title}</h3>
                <p>
                  {course.lessons.length} хичээл · ★ {course.rating}
                </p>
                <div className="home-course-row__price">
                  <s>{formatPrice(course.originalPrice)}</s>
                  <b>{formatPrice(course.price)}</b>
                </div>
              </div>
              <svg
                className="home-course-row__chev"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 3.5 10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

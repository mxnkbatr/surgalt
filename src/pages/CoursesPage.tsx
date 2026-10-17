import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { useCourses } from '../courses/CoursesContext'
import { formatPrice } from '../data/courses'

type SortBy = 'popular' | 'rating' | 'price-asc' | 'price-desc'

const sorts: { id: SortBy; label: string }[] = [
  { id: 'popular', label: 'Эрэлттэй' },
  { id: 'rating', label: 'Үнэлгээ' },
  { id: 'price-asc', label: 'Үнэ ↑' },
  { id: 'price-desc', label: 'Үнэ ↓' },
]

export function CoursesPage() {
  const { courses } = useCourses()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [sort, setSort] = useState<SortBy>('popular')

  useEffect(() => {
    setQuery(params.get('q') ?? '')
  }, [params])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()

    let result = courses.filter((c) => {
      if (!q) return true
      const hay = `${c.title} ${c.subtitle} ${c.category} ${c.instructor}`.toLowerCase()
      return hay.includes(q)
    })

    result = [...result].sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      return b.students - a.students
    })

    return result
  }, [query, sort, courses])

  return (
    <div className="courses-page ios-page">
      <div className="courses-page__inner">
        <AppHeader
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Сургалт, багш хайх…"
        />

        <section className="filter-block filter-block--sort" aria-label="Эрэмбэ">
          <div className="chip-row">
            {sorts.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`chip chip--soft${sort === item.id ? ' is-active' : ''}`}
                aria-pressed={sort === item.id}
                onClick={() => setSort(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="courses-results">
          <div className="app-section__head">
            <h2>Үр дүн</h2>
            <span>{list.length} сургалт</span>
          </div>

          {list.length === 0 ? (
            <div className="courses-empty">
              <p>Тохирох сургалт олдсонгүй</p>
              <button type="button" className="btn btn-ghost" onClick={() => setQuery('')}>
                Хайлт цэвэрлэх
              </button>
            </div>
          ) : (
            <div className="course-rows courses-results__rows">
              {list.map((course) => (
                <Link key={course.id} to={`/surgalt/${course.slug}`} className="course-row">
                  <div
                    className="course-row__cover"
                    style={{
                      background: `linear-gradient(135deg, ${course.accent}, #1a1f1c)`,
                    }}
                  >
                    <span>{course.coverLabel.split('\n')[0]}</span>
                  </div>
                  <div className="course-row__body">
                    <div className="course-row__meta-top">
                      <span className="course-row__cat">{course.category}</span>
                      <span className="course-row__tag">{course.tag}</span>
                    </div>
                    <h3>{course.title}</h3>
                    <p>
                      {course.lessons.length} хичээл · ★ {course.rating}
                    </p>
                    <div className="course-row__price">
                      <s>{formatPrice(course.originalPrice)}</s>
                      <b>{formatPrice(course.price)}</b>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAccess } from '../access/AccessContext'
import { useCart } from '../cart/CartContext'
import { useCourses } from '../courses/CoursesContext'
import { PurchaseBar } from '../components/PurchaseBar'
import { VideoPlayer } from '../components/VideoPlayer'
import { formatPrice, sortLessons } from '../data/courses'

type Tab = 'lessons' | 'about'

export function CoursePage() {
  const { slug = '' } = useParams()
  const { getCourse, ready } = useCourses()
  const course = getCourse(slug)
  const { isUnlocked, refresh } = useAccess()
  const navigate = useNavigate()
  const { add, has } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>('lessons')
  const [activeId, setActiveId] = useState('intro')
  const unlocked = slug ? isUnlocked(slug) : false
  const [playing, setPlaying] = useState(false)
  const [quizPick, setQuizPick] = useState<Record<number, number | null>>({})

  useEffect(() => {
    if (searchParams.get('paid') === '1') {
      void refresh()
      setPlaying(true)
      searchParams.delete('paid')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, refresh])

  const lessons = useMemo(
    () => (course ? sortLessons(course.lessons) : []),
    [course],
  )

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeId) ?? lessons[0],
    [lessons, activeId],
  )

  const nextLesson = useMemo(() => {
    if (!activeLesson) return null
    const idx = lessons.findIndex((l) => l.id === activeLesson.id)
    return lessons[idx + 1] ?? null
  }, [lessons, activeLesson])

  useEffect(() => {
    setQuizPick({})
  }, [activeLesson?.id])

  if (!ready) return null
  if (!course) {
    return <Navigate to="/" replace />
  }

  const canPlay = unlocked || Boolean(activeLesson?.free)

  function goCart() {
    if (!has(slug)) add(slug)
    navigate('/sags')
  }

  function handlePlay() {
    if (!canPlay) {
      goCart()
      return
    }
    setPlaying(true)
  }

  function handleSelectLesson(id: string, isFree?: boolean) {
    if (!unlocked && !isFree) {
      goCart()
      return
    }
    setActiveId(id)
    setPlaying(false)
  }

  return (
    <>
      <div className="course-page">
        <header className="ios-nav">
          <Link to="/surgalt" className="ios-nav__btn" aria-label="Буцах">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path
                d="M13.5 5 7.5 11l6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div className="ios-nav__center">
            <strong>{course.title}</strong>
            <span>{activeLesson?.title}</span>
          </div>
          <span className="ios-nav__spacer" aria-hidden="true" />
        </header>

        <div className="course-scroll">
          <div className="course-player-card">
            <div className="player__stage" style={{ background: course.accent }}>
              {playing && canPlay && activeLesson?.videoUrl ? (
                <VideoPlayer url={activeLesson.videoUrl} title={activeLesson.title} />
              ) : (
                <>
                  <div
                    className="player__stage-bg"
                    style={{
                      background: `linear-gradient(120deg, ${course.accent} 0%, #1a1f1c 70%)`,
                    }}
                  />
                  <div className="player__stage-label">{course.coverLabel}</div>
                  {playing && canPlay && !activeLesson?.videoUrl ? (
                    <div className="player__missing">
                      <p>Видео холбогдоогүй</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="player__play"
                      onClick={handlePlay}
                      aria-label="Тоглуулах"
                    >
                      <svg width="26" height="26" viewBox="0 0 28 28" fill="currentColor">
                        <path d="M10 7.5v13l11-6.5-11-6.5z" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <section className="course-meta">
            {nextLesson && (
              <button
                type="button"
                className="course-meta__next"
                onClick={() => handleSelectLesson(nextLesson.id, nextLesson.free)}
              >
                <span>
                  Дараах · <b>{nextLesson.title}</b>
                </span>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M4 9h10M10 5l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <h1>{course.title}</h1>
            <p className="course-meta__sub">{course.subtitle}</p>
            <div className="course-meta__stats">
              <span>
                <b>{course.lessons.length}</b> хичээл
              </span>
              <span>
                <b>{course.rating}</b> ★
              </span>
              <span>
                <b>{formatPrice(course.price)}</b>
              </span>
            </div>
          </section>

          <div className="ios-segment" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'lessons'}
              className={tab === 'lessons' ? 'is-active' : ''}
              onClick={() => setTab('lessons')}
            >
              Хичээл
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'about'}
              className={tab === 'about' ? 'is-active' : ''}
              onClick={() => setTab('about')}
            >
              Тухай
            </button>
          </div>

          {tab === 'lessons' ? (
            <>
              <div className="ios-group course-lessons" role="list">
                {lessons.map((lesson) => {
                  const locked = !unlocked && !lesson.free
                  const isActive = lesson.id === activeId
                  const num =
                    lesson.free && lesson.order === 0
                      ? 'FREE'
                      : String(lesson.order).padStart(2, '0')
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      className={`course-lesson${isActive ? ' is-active' : ''}`}
                      onClick={() => handleSelectLesson(lesson.id, lesson.free)}
                      role="listitem"
                    >
                      <div
                        className="course-lesson__badge"
                        style={{ background: course.accent }}
                        aria-hidden="true"
                      >
                        {num}
                      </div>
                      <div className="course-lesson__text">
                        <strong>{lesson.title}</strong>
                        <span>{lesson.duration}</span>
                      </div>
                      {locked ? (
                        <svg
                          className="course-lesson__lock"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-label="Төлбөртэй"
                        >
                          <rect
                            x="3.5"
                            y="7"
                            width="9"
                            height="6.5"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.4"
                          />
                          <path
                            d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : null}
                    </button>
                  )
                })}
              </div>

              {canPlay && activeLesson && (
                <div className="lesson-extras">
                  {(activeLesson.resources?.length ?? 0) > 0 && (
                    <section className="lesson-extras__block">
                      <h3>Холбоос</h3>
                      <ul>
                        {activeLesson.resources!.map((r) => (
                          <li key={`${r.label}-${r.url}`}>
                            <a href={r.url} target="_blank" rel="noreferrer">
                              {r.label || r.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {(activeLesson.quiz?.length ?? 0) > 0 && (
                    <section className="lesson-extras__block">
                      <h3>Шалгалт</h3>
                      {activeLesson.quiz!.map((q, qi) => {
                        const picked = quizPick[qi]
                        return (
                          <div key={qi} className="lesson-quiz">
                            <p>
                              <b>{qi + 1}.</b> {q.question}
                            </p>
                            <div className="lesson-quiz__opts">
                              {q.options.map((opt, oi) => {
                                const show = picked !== null && picked !== undefined
                                const correct = oi === q.correctIndex
                                const wrong = show && picked === oi && !correct
                                return (
                                  <button
                                    key={oi}
                                    type="button"
                                    className={`lesson-quiz__opt${correct && show ? ' is-ok' : ''}${wrong ? ' is-bad' : ''}`}
                                    onClick={() =>
                                      setQuizPick((prev) => ({ ...prev, [qi]: oi }))
                                    }
                                  >
                                    {opt}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </section>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="ios-group course-about">
              <h3>Энэ сургалтын тухай</h3>
              <p>{course.description}</p>
              <h3>Сурах зүйлс</h3>
              <ul>
                {course.learnings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="course-about__note">
                {course.instructor} · {course.instructorRole}
              </p>
            </div>
          )}
        </div>
      </div>

      {!unlocked && <PurchaseBar course={course} />}
    </>
  )
}

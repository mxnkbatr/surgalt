import { useEffect, useMemo, useState } from 'react'
import type { Course, Lesson, LessonQuiz, LessonResource } from '../../data/courses'
import {
  createCategory,
  createCourse,
  emptyLesson,
  updateCourse,
  type CategoryItem,
} from '../../lib/coursesApi'
import { useCourses } from '../../courses/CoursesContext'

type Props = {
  course: Course | null
  categories: CategoryItem[]
  onCategoriesChange: () => void
  onCancel: () => void
  onSaved: (course: Course) => void
}

type Draft = {
  title: string
  subtitle: string
  description: string
  learningsText: string
  instructor: string
  instructorRole: string
  category: string
  tag: string
  price: string
  originalPrice: string
  coverLabel: string
  accent: string
  published: boolean
  lessons: Lesson[]
}

type EditorTab = 'info' | 'lessons'

function toDraft(course: Course | null): Draft {
  if (!course) {
    return {
      title: '',
      subtitle: '',
      description: '',
      learningsText: '',
      instructor: '',
      instructorRole: '',
      category: '',
      tag: 'Шинэ',
      price: '29900',
      originalPrice: '99000',
      coverLabel: '',
      accent: '#1F6B4A',
      published: true,
      lessons: [],
    }
  }
  return {
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    learningsText: course.learnings.join('\n'),
    instructor: course.instructor,
    instructorRole: course.instructorRole,
    category: course.category,
    tag: course.tag,
    price: String(course.price),
    originalPrice: String(course.originalPrice),
    coverLabel: course.coverLabel,
    accent: course.accent,
    published: course.published !== false,
    lessons: [...course.lessons]
      .sort((a, b) => a.order - b.order)
      .map((l) => ({
        ...l,
        resources: [...(l.resources ?? [])],
        quiz: [...(l.quiz ?? [])],
      })),
  }
}

export function AdminCourseEditor({
  course,
  categories,
  onCategoriesChange,
  onCancel,
  onSaved,
}: Props) {
  const { refresh } = useCourses()
  const [draft, setDraft] = useState<Draft>(() => toDraft(course))
  const [tab, setTab] = useState<EditorTab>('info')
  const [openLesson, setOpenLesson] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newCat, setNewCat] = useState('')
  const [addingCat, setAddingCat] = useState(false)

  useEffect(() => {
    if (!draft.category && categories[0]) {
      setDraft((d) => ({ ...d, category: categories[0].name }))
    }
  }, [categories, draft.category])

  const sorted = useMemo(
    () => [...draft.lessons].sort((a, b) => a.order - b.order),
    [draft.lessons],
  )

  function patchLesson(id: string, patch: Partial<Lesson>) {
    setDraft((d) => ({
      ...d,
      lessons: d.lessons.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }))
  }

  function moveLesson(id: string, dir: -1 | 1) {
    setDraft((d) => {
      const list = [...d.lessons].sort((a, b) => a.order - b.order)
      const idx = list.findIndex((l) => l.id === id)
      const swap = idx + dir
      if (idx < 0 || swap < 0 || swap >= list.length) return d
      ;[list[idx], list[swap]] = [list[swap], list[idx]]
      return {
        ...d,
        lessons: list.map((l, i) => ({ ...l, order: i })),
      }
    })
  }

  function addLesson() {
    const maxOrder = draft.lessons.reduce((m, l) => Math.max(m, l.order), -1)
    const lesson = emptyLesson(maxOrder + 1)
    setDraft((d) => ({ ...d, lessons: [...d.lessons, lesson] }))
    setOpenLesson(lesson.id)
    setTab('lessons')
    setError(null)
  }

  function removeLesson(id: string) {
    setDraft((d) => ({
      ...d,
      lessons: d.lessons
        .filter((l) => l.id !== id)
        .sort((a, b) => a.order - b.order)
        .map((l, i) => ({ ...l, order: i })),
    }))
    if (openLesson === id) setOpenLesson(null)
  }

  async function onAddCategory() {
    const name = newCat.trim()
    if (!name) {
      setError('Ангиллын нэр оруулна уу.')
      return
    }
    setAddingCat(true)
    setError(null)
    try {
      const cat = await createCategory(name)
      setDraft((d) => ({ ...d, category: cat.name }))
      setNewCat('')
      onCategoriesChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ангилал нэмж чадсангүй.')
    } finally {
      setAddingCat(false)
    }
  }

  async function onSave() {
    if (!draft.title.trim()) {
      setError('Сургалтын нэр оруулна уу.')
      setTab('info')
      return
    }
    if (!draft.category.trim()) {
      setError('Ангилал сонгоно уу.')
      setTab('info')
      return
    }
    setBusy(true)
    setError(null)
    const body = {
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      description: draft.description.trim(),
      learningsText: draft.learningsText,
      instructor: draft.instructor.trim(),
      instructorRole: draft.instructorRole.trim(),
      category: draft.category.trim(),
      tag: draft.tag.trim() || 'Шинэ',
      price: Number(draft.price) || 0,
      originalPrice: Number(draft.originalPrice) || 0,
      coverLabel: draft.coverLabel.trim() || draft.title.slice(0, 16).toUpperCase(),
      accent: draft.accent,
      accentSoft: '#D8F3E5',
      published: draft.published,
      lessons: sorted.map((l, i) => ({
        ...l,
        order: i,
        title: l.title.trim() || `Хичээл ${i + 1}`,
        videoUrl: (l.videoUrl ?? '').trim(),
        resources: (l.resources ?? []).filter((r) => r.url.trim()),
        quiz: (l.quiz ?? []).filter(
          (q) => q.question.trim() && q.options.filter((o) => o.trim()).length >= 2,
        ),
      })),
    }

    try {
      const saved = course
        ? await updateCourse(course.id, body)
        : await createCourse(body)
      await refresh()
      onSaved(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалахад алдаа гарлаа.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rn-screen">
      <header className="rn-nav">
        <button type="button" className="rn-nav__back" onClick={onCancel} aria-label="Буцах">
          ‹
        </button>
        <div className="rn-nav__title">
          <strong>{course ? 'Засах' : 'Шинэ сургалт'}</strong>
          <span>{draft.title || 'Нэрээ оруулна уу'}</span>
        </div>
        <button
          type="button"
          className="rn-nav__action"
          disabled={busy}
          onClick={() => void onSave()}
        >
          {busy ? '…' : 'Хадгалах'}
        </button>
      </header>

      <div className="rn-segment">
        <button
          type="button"
          className={tab === 'info' ? 'is-active' : ''}
          onClick={() => setTab('info')}
        >
          Мэдээлэл
        </button>
        <button
          type="button"
          className={tab === 'lessons' ? 'is-active' : ''}
          onClick={() => setTab('lessons')}
        >
          Хичээл ({sorted.length})
        </button>
      </div>

      {error && <p className="rn-banner rn-banner--error">{error}</p>}

      <div className="rn-scroll">
        {tab === 'info' ? (
          <>
            <p className="rn-section-label">Үндсэн</p>
            <div className="rn-group">
              <label className="rn-cell rn-cell--stack">
                <span>Нэр</span>
                <input
                  value={draft.title}
                  placeholder="Сургалтын нэр"
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                />
              </label>
              <label className="rn-cell rn-cell--stack">
                <span>Дэд гарчиг</span>
                <input
                  value={draft.subtitle}
                  placeholder="Богино тайлбар"
                  onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
                />
              </label>
              <label className="rn-cell rn-cell--stack">
                <span>Тайлбар</span>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                />
              </label>
            </div>

            <p className="rn-section-label">Ангилал</p>
            <div className="rn-chips">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`rn-chip${draft.category === c.name ? ' is-on' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, category: c.name }))}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="rn-group rn-group--row">
              <input
                className="rn-inline-input"
                value={newCat}
                placeholder="Шинэ ангилал…"
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void onAddCategory()
                  }
                }}
              />
              <button
                type="button"
                className="rn-btn-sm"
                disabled={addingCat}
                onClick={() => void onAddCategory()}
              >
                Нэмэх
              </button>
            </div>

            <p className="rn-section-label">Үнэ · шошго</p>
            <div className="rn-group">
              <label className="rn-cell">
                <span>Үнэ</span>
                <input
                  inputMode="numeric"
                  value={draft.price}
                  onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                />
              </label>
              <label className="rn-cell">
                <span>Хуучин үнэ</span>
                <input
                  inputMode="numeric"
                  value={draft.originalPrice}
                  onChange={(e) => setDraft((d) => ({ ...d, originalPrice: e.target.value }))}
                />
              </label>
              <label className="rn-cell">
                <span>Шошго</span>
                <input
                  value={draft.tag}
                  onChange={(e) => setDraft((d) => ({ ...d, tag: e.target.value }))}
                />
              </label>
              <label className="rn-cell rn-cell--switch">
                <span>Нийтэд харагдах</span>
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
                />
              </label>
            </div>

            <p className="rn-section-label">Багш · харагдах байдал</p>
            <div className="rn-group">
              <label className="rn-cell rn-cell--stack">
                <span>Багш</span>
                <input
                  value={draft.instructor}
                  onChange={(e) => setDraft((d) => ({ ...d, instructor: e.target.value }))}
                />
              </label>
              <label className="rn-cell rn-cell--stack">
                <span>Албан тушаал</span>
                <input
                  value={draft.instructorRole}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, instructorRole: e.target.value }))
                  }
                />
              </label>
              <label className="rn-cell rn-cell--stack">
                <span>Юу сурах вэ (мөр бүрт)</span>
                <textarea
                  rows={3}
                  value={draft.learningsText}
                  onChange={(e) => setDraft((d) => ({ ...d, learningsText: e.target.value }))}
                />
              </label>
              <label className="rn-cell">
                <span>Cover текст</span>
                <input
                  value={draft.coverLabel}
                  placeholder="МӨНГӨНИЙ НУУЦ"
                  onChange={(e) => setDraft((d) => ({ ...d, coverLabel: e.target.value }))}
                />
              </label>
              <label className="rn-cell">
                <span>Өнгө</span>
                <input
                  type="color"
                  value={draft.accent}
                  onChange={(e) => setDraft((d) => ({ ...d, accent: e.target.value }))}
                />
              </label>
            </div>
          </>
        ) : (
          <>
            <button type="button" className="rn-add-row" onClick={addLesson}>
              <span>+</span> Хичээл нэмэх
            </button>

            {sorted.length === 0 ? (
              <div className="rn-empty">
                <p>Хичээл байхгүй</p>
                <span>YouTube unlisted линктэй хичээл нэмнэ үү</span>
              </div>
            ) : (
              <div className="rn-lesson-stack">
                {sorted.map((lesson, index) => {
                  const open = openLesson === lesson.id
                  return (
                    <div key={lesson.id} className={`rn-lesson${open ? ' is-open' : ''}`}>
                      <button
                        type="button"
                        className="rn-lesson__head"
                        onClick={() => setOpenLesson(open ? null : lesson.id)}
                      >
                        <i style={{ background: draft.accent }}>{String(index + 1).padStart(2, '0')}</i>
                        <div>
                          <b>{lesson.title || 'Гарчиггүй'}</b>
                          <small>
                            {lesson.duration || '—'}
                            {lesson.videoUrl ? ' · видео OK' : ' · линкгүй'}
                            {lesson.free ? ' · FREE' : ''}
                          </small>
                        </div>
                        <em>{open ? '▾' : '›'}</em>
                      </button>

                      {open && (
                        <div className="rn-lesson__body">
                          <label className="rn-cell rn-cell--stack">
                            <span>Гарчиг</span>
                            <input
                              value={lesson.title}
                              placeholder={`${index + 1}-р хичээл`}
                              onChange={(e) =>
                                patchLesson(lesson.id, { title: e.target.value })
                              }
                            />
                          </label>
                          <label className="rn-cell rn-cell--stack">
                            <span>YouTube unlisted линк</span>
                            <input
                              value={lesson.videoUrl ?? ''}
                              placeholder="https://youtu.be/XXXX"
                              onChange={(e) =>
                                patchLesson(lesson.id, { videoUrl: e.target.value })
                              }
                            />
                          </label>
                          <div className="rn-row2">
                            <label className="rn-cell rn-cell--stack">
                              <span>Хугацаа</span>
                              <input
                                value={lesson.duration}
                                placeholder="8:14"
                                onChange={(e) =>
                                  patchLesson(lesson.id, { duration: e.target.value })
                                }
                              />
                            </label>
                            <label className="rn-cell rn-cell--switch">
                              <span>FREE</span>
                              <input
                                type="checkbox"
                                checked={Boolean(lesson.free)}
                                onChange={(e) =>
                                  patchLesson(lesson.id, { free: e.target.checked })
                                }
                              />
                            </label>
                          </div>

                          <ResourceEditor
                            resources={lesson.resources ?? []}
                            onChange={(resources) => patchLesson(lesson.id, { resources })}
                          />
                          <QuizEditor
                            quiz={lesson.quiz ?? []}
                            onChange={(quiz) => patchLesson(lesson.id, { quiz })}
                          />

                          <div className="rn-lesson__tools">
                            <button type="button" onClick={() => moveLesson(lesson.id, -1)}>
                              Дээш
                            </button>
                            <button type="button" onClick={() => moveLesson(lesson.id, 1)}>
                              Доош
                            </button>
                            <button
                              type="button"
                              className="is-danger"
                              onClick={() => removeLesson(lesson.id)}
                            >
                              Устгах
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <div className="rn-dock">
        <button type="button" className="rn-dock__ghost" onClick={onCancel}>
          Болих
        </button>
        <button
          type="button"
          className="rn-dock__primary"
          disabled={busy}
          onClick={() => void onSave()}
        >
          {busy ? 'Хадгалж байна…' : 'Хадгалах'}
        </button>
      </div>
    </div>
  )
}

function ResourceEditor({
  resources,
  onChange,
}: {
  resources: LessonResource[]
  onChange: (next: LessonResource[]) => void
}) {
  return (
    <div className="rn-mini">
      <div className="rn-mini__head">
        <span>Холбоос</span>
        <button
          type="button"
          onClick={() => onChange([...resources, { label: 'Линк', url: '' }])}
        >
          + Нэмэх
        </button>
      </div>
      {resources.map((r, i) => (
        <div key={i} className="rn-mini__row">
          <input
            value={r.label}
            placeholder="Нэр"
            onChange={(e) => {
              const next = [...resources]
              next[i] = { ...r, label: e.target.value }
              onChange(next)
            }}
          />
          <input
            value={r.url}
            placeholder="https://"
            onChange={(e) => {
              const next = [...resources]
              next[i] = { ...r, url: e.target.value }
              onChange(next)
            }}
          />
          <button type="button" onClick={() => onChange(resources.filter((_, x) => x !== i))}>
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

function QuizEditor({
  quiz,
  onChange,
}: {
  quiz: LessonQuiz[]
  onChange: (next: LessonQuiz[]) => void
}) {
  return (
    <div className="rn-mini">
      <div className="rn-mini__head">
        <span>Гарц</span>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...quiz,
              { question: '', options: ['Тийм', 'Үгүй'], correctIndex: 0 },
            ])
          }
        >
          + Асуулт
        </button>
      </div>
      {quiz.map((q, qi) => (
        <div key={qi} className="rn-mini__quiz">
          <input
            value={q.question}
            placeholder={`Асуулт ${qi + 1}`}
            onChange={(e) => {
              const next = [...quiz]
              next[qi] = { ...q, question: e.target.value }
              onChange(next)
            }}
          />
          <textarea
            rows={2}
            value={q.options.join('\n')}
            placeholder={'Сонголт 1\nСонголт 2'}
            onChange={(e) => {
              const options = e.target.value.split('\n')
              const next = [...quiz]
              next[qi] = {
                ...q,
                options,
                correctIndex: Math.min(q.correctIndex, Math.max(options.length - 1, 0)),
              }
              onChange(next)
            }}
          />
          <div className="rn-mini__row">
            <input
              inputMode="numeric"
              value={String(q.correctIndex + 1)}
              title="Зөв хариултын дугаар"
              onChange={(e) => {
                const n = Math.max(1, Number(e.target.value) || 1)
                const next = [...quiz]
                next[qi] = { ...q, correctIndex: n - 1 }
                onChange(next)
              }}
            />
            <button type="button" onClick={() => onChange(quiz.filter((_, x) => x !== qi))}>
              Устгах
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { displayUserPhone, useAuth } from '../auth/AuthContext'
import { useCourses } from '../courses/CoursesContext'
import { formatPrice, type Course } from '../data/courses'
import {
  createCategory,
  deleteCategory,
  deleteCourse,
  fetchAdminCourses,
  fetchCategories,
  type CategoryItem,
} from '../lib/coursesApi'
import {
  listPayments,
  updatePaymentStatus,
  type PaymentOrder,
  type PaymentStatus,
} from '../lib/payments'
import { AdminCourseEditor } from './admin/AdminCourseEditor'

type MainTab = 'courses' | 'categories' | 'payments'
type PayFilter = 'pending' | 'all'

export function AdminPage() {
  const { user, logout } = useAuth()
  const { refresh: refreshPublicCourses } = useCourses()
  const [tab, setTab] = useState<MainTab>('courses')
  const [editing, setEditing] = useState<Course | null | 'new'>(null)
  const [categories, setCategories] = useState<CategoryItem[]>([])

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await fetchCategories())
    } catch {
      setCategories([])
    }
  }, [])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/admin' }} />
  }

  if (!user.isAdmin) {
    return <Navigate to="/profile" replace />
  }

  if (editing !== null) {
    return (
      <div className="rn-app">
        <AdminCourseEditor
          course={editing === 'new' ? null : editing}
          categories={categories}
          onCategoriesChange={() => void loadCategories()}
          onCancel={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            await refreshPublicCourses()
            await loadCategories()
          }}
        />
      </div>
    )
  }

  return (
    <div className="rn-app">
      <header className="rn-top">
        <div>
          <p className="rn-top__eyebrow">Admin</p>
          <h1>Dcapital</h1>
        </div>
        <div className="rn-top__actions">
          <Link to="/" className="rn-icon-btn" aria-label="Нүүр">
            ⌂
          </Link>
          <button type="button" className="rn-icon-btn" onClick={logout}>
            Гарах
          </button>
        </div>
      </header>

      <main className="rn-main">
        {tab === 'courses' && (
          <CoursesTab
            onCreate={() => setEditing('new')}
            onEdit={(c) => setEditing(c)}
            onChanged={() => void refreshPublicCourses()}
          />
        )}
        {tab === 'categories' && (
          <CategoriesTab
            categories={categories}
            onChanged={() => void loadCategories()}
          />
        )}
        {tab === 'payments' && <PaymentsTab />}
      </main>

      <nav className="rn-tabbar" aria-label="Admin tabs">
        <button
          type="button"
          className={tab === 'courses' ? 'is-active' : ''}
          onClick={() => setTab('courses')}
        >
          <span>▦</span>
          Сургалт
        </button>
        <button
          type="button"
          className={tab === 'categories' ? 'is-active' : ''}
          onClick={() => setTab('categories')}
        >
          <span>#</span>
          Ангилал
        </button>
        <button
          type="button"
          className={tab === 'payments' ? 'is-active' : ''}
          onClick={() => setTab('payments')}
        >
          <span>₮</span>
          Төлбөр
        </button>
      </nav>
    </div>
  )
}

function CoursesTab({
  onCreate,
  onEdit,
  onChanged,
}: {
  onCreate: () => void
  onEdit: (c: Course) => void
  onChanged: () => void
}) {
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      setCourses(await fetchAdminCourses())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа.')
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function onDelete(course: Course) {
    if (!window.confirm(`「${course.title}」 устгах уу?`)) return
    setBusyId(course.id)
    try {
      await deleteCourse(course.id)
      await refresh()
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Устгахад алдаа.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="rn-screen rn-screen--tab">
      <div className="rn-screen__head">
        <div>
          <h2>Сургалтууд</h2>
          <p>{courses.length} сургалт</p>
        </div>
        <button type="button" className="rn-fab-inline" onClick={onCreate}>
          + Шинэ
        </button>
      </div>

      {error && <p className="rn-banner rn-banner--error">{error}</p>}

      {courses.length === 0 ? (
        <div className="rn-empty">
          <p>Сургалт алга</p>
          <span>Эхний сургалтаа нэмээд хичээлүүддээ YouTube линк тавина уу</span>
          <button type="button" className="rn-dock__primary" onClick={onCreate}>
            Сургалт нэмэх
          </button>
        </div>
      ) : (
        <div className="rn-list">
          {courses.map((course) => (
            <article key={course.id} className="rn-course">
              <button type="button" className="rn-course__main" onClick={() => onEdit(course)}>
                <div className="rn-course__cover" style={{ background: course.accent }}>
                  {(course.coverLabel || course.title).split('\n')[0]}
                </div>
                <div className="rn-course__meta">
                  <small>{course.category}</small>
                  <b>{course.title}</b>
                  <span>
                    {course.lessons.length} хичээл · {formatPrice(course.price)}
                  </span>
                </div>
                <em>›</em>
              </button>
              <button
                type="button"
                className="rn-course__del"
                disabled={busyId === course.id}
                onClick={() => void onDelete(course)}
              >
                Устгах
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function CategoriesTab({
  categories,
  onChanged,
}: {
  categories: CategoryItem[]
  onChanged: () => void
}) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onAdd() {
    const n = name.trim()
    if (!n) {
      setError('Ангиллын нэр оруулна уу.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await createCategory(n)
      setName('')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Нэмж чадсангүй.')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(cat: CategoryItem) {
    if (cat.id.startsWith('c_')) {
      setError('Зөвхөн бүртгэлтэй ангиллыг устгана.')
      return
    }
    if (!window.confirm(`「${cat.name}」 устгах уу?`)) return
    setBusy(true)
    try {
      await deleteCategory(cat.id)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Устгахад алдаа.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rn-screen rn-screen--tab">
      <div className="rn-screen__head">
        <div>
          <h2>Ангилал</h2>
          <p>Сургалтуудыг бүлэглэнэ</p>
        </div>
      </div>

      {error && <p className="rn-banner rn-banner--error">{error}</p>}

      <div className="rn-group rn-group--row">
        <input
          className="rn-inline-input"
          value={name}
          placeholder="Жишээ: Маркетинг"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void onAdd()
            }
          }}
        />
        <button type="button" className="rn-btn-sm" disabled={busy} onClick={() => void onAdd()}>
          Нэмэх
        </button>
      </div>

      <div className="rn-group" style={{ marginTop: 14 }}>
        {categories.length === 0 ? (
          <div className="rn-empty" style={{ padding: 24 }}>
            <p>Ангилал алга</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="rn-cell rn-cell--between">
              <span className="rn-cat-name">#{cat.name}</span>
              {!cat.id.startsWith('c_') && (
                <button
                  type="button"
                  className="rn-text-danger"
                  disabled={busy}
                  onClick={() => void onDelete(cat)}
                >
                  Устгах
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function PaymentsTab() {
  const [filter, setFilter] = useState<PayFilter>('pending')
  const [orders, setOrders] = useState<PaymentOrder[]>([])
  const [allOrders, setAllOrders] = useState<PaymentOrder[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const all = await listPayments()
      setAllOrders(all)
      setOrders(filter === 'pending' ? all.filter((o) => o.status === 'pending') : all)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Жагсаалт авахад алдаа гарлаа.')
    }
  }, [filter])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function onReview(id: string, status: Extract<PaymentStatus, 'approved' | 'rejected'>) {
    setBusyId(id)
    try {
      await updatePaymentStatus(id, status)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Шинэчлэхэд алдаа гарлаа.')
    } finally {
      setBusyId(null)
    }
  }

  const pendingCount = allOrders.filter((o) => o.status === 'pending').length

  return (
    <div className="rn-screen rn-screen--tab">
      <div className="rn-screen__head">
        <div>
          <h2>Төлбөр</h2>
          <p>{pendingCount} хүлээгдэж буй</p>
        </div>
        <button type="button" className="rn-btn-sm" onClick={() => void refresh()}>
          Шинэчлэх
        </button>
      </div>

      {error && <p className="rn-banner rn-banner--error">{error}</p>}

      <div className="rn-segment" style={{ marginBottom: 14 }}>
        <button
          type="button"
          className={filter === 'pending' ? 'is-active' : ''}
          onClick={() => setFilter('pending')}
        >
          Хүлээгдэж буй
        </button>
        <button
          type="button"
          className={filter === 'all' ? 'is-active' : ''}
          onClick={() => setFilter('all')}
        >
          Бүгд
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="rn-empty">
          <p>Хүсэлт алга</p>
          <span>Шинэ шилжүүлэг ирэхэд энд гарна</span>
        </div>
      ) : (
        <div className="rn-list">
          {orders.map((order) => (
            <article key={order.id} className="rn-pay">
              <div className="rn-pay__top">
                <span className={`rn-pill is-${order.status}`}>{statusLabel(order.status)}</span>
                <time>{new Date(order.createdAt).toLocaleString('mn-MN')}</time>
              </div>
              <b>{formatPrice(order.amount)}</b>
              <p>{order.ref}</p>
              <small>
                {order.userName} · {displayUserPhone(order.phone)}
              </small>
              <small>{order.titles.join(', ')}</small>
              {order.status === 'pending' && (
                <div className="rn-pay__actions">
                  <button
                    type="button"
                    className="rn-dock__primary"
                    disabled={busyId === order.id}
                    onClick={() => void onReview(order.id, 'approved')}
                  >
                    Баталгаажуулах
                  </button>
                  <button
                    type="button"
                    className="rn-dock__ghost"
                    disabled={busyId === order.id}
                    onClick={() => void onReview(order.id, 'rejected')}
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
  )
}

function statusLabel(status: PaymentStatus) {
  if (status === 'pending') return 'Хүлээгдэж буй'
  if (status === 'approved') return 'Баталгаажсан'
  return 'Татгалзсан'
}

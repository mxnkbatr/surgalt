import { Router } from 'express'
import { adminRequired } from '../auth.js'
import { Course, type LessonDoc } from '../models/Course.js'

export const coursesRouter = Router()

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `course-${Date.now().toString(36)}`
}

function serialize(doc: {
  _id: { toString(): string }
  slug: string
  title: string
  subtitle: string
  description: string
  learnings: string[]
  instructor: string
  instructorRole: string
  lessons: LessonDoc[]
  price: number
  originalPrice: number
  students: number
  rating: number
  accent: string
  accentSoft: string
  coverLabel: string
  tag: string
  category: string
  published?: boolean
}) {
  const lessons = [...(doc.lessons ?? [])].sort((a, b) => a.order - b.order)
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    subtitle: doc.subtitle,
    description: doc.description,
    learnings: doc.learnings ?? [],
    instructor: doc.instructor,
    instructorRole: doc.instructorRole,
    lessons,
    price: doc.price,
    originalPrice: doc.originalPrice,
    students: doc.students,
    rating: doc.rating,
    accent: doc.accent,
    accentSoft: doc.accentSoft,
    coverLabel: doc.coverLabel,
    tag: doc.tag,
    category: doc.category,
    published: doc.published !== false,
  }
}

function normalizeLessons(raw: unknown): LessonDoc[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item, index) => {
    const l = item as Partial<LessonDoc>
    const resources = Array.isArray(l.resources)
      ? l.resources
          .map((r) => ({
            label: String(r?.label ?? '').trim() || 'Линк',
            url: String(r?.url ?? '').trim(),
          }))
          .filter((r) => r.url)
      : []
    const quiz = Array.isArray(l.quiz)
      ? l.quiz
          .map((q) => {
            const options = Array.isArray(q?.options)
              ? q.options.map((o) => String(o).trim()).filter(Boolean)
              : []
            return {
              question: String(q?.question ?? '').trim(),
              options,
              correctIndex: Math.max(
                0,
                Math.min(Number(q?.correctIndex) || 0, Math.max(options.length - 1, 0)),
              ),
            }
          })
          .filter((q) => q.question && q.options.length >= 2)
      : []

    return {
      id: String(l.id || `l_${Date.now().toString(36)}_${index}`),
      order: Number.isFinite(Number(l.order)) ? Number(l.order) : index,
      title: String(l.title ?? '').trim() || `Хичээл ${index + 1}`,
      duration: String(l.duration ?? '').trim(),
      free: Boolean(l.free),
      videoUrl: String(l.videoUrl ?? '').trim(),
      resources,
      quiz,
    }
  })
}

/** Нийтэд: зөвхөн published */
coursesRouter.get('/', async (_req, res) => {
  try {
    const list = await Course.find({ published: true }).sort({ createdAt: -1 })
    res.json({ courses: list.map(serialize) })
  } catch (err) {
    console.error('[courses/list]', err)
    res.status(500).json({ error: 'Сургалт авахад алдаа гарлаа.' })
  }
})

coursesRouter.get('/admin/all', adminRequired, async (_req, res) => {
  try {
    const list = await Course.find().sort({ createdAt: -1 })
    res.json({ courses: list.map(serialize) })
  } catch (err) {
    console.error('[courses/admin]', err)
    res.status(500).json({ error: 'Алдаа гарлаа.' })
  }
})

coursesRouter.get('/:slug', async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, published: true })
    if (!course) {
      res.status(404).json({ error: 'Сургалт олдсонгүй.' })
      return
    }
    res.json({ course: serialize(course) })
  } catch (err) {
    console.error('[courses/get]', err)
    res.status(500).json({ error: 'Алдаа гарлаа.' })
  }
})

coursesRouter.post('/', adminRequired, async (req, res) => {
  try {
    const title = String(req.body?.title ?? '').trim()
    if (!title) {
      res.status(400).json({ error: 'Гарчиг оруулна уу.' })
      return
    }

    let slug = String(req.body?.slug ?? '').trim() || slugify(title)
    const exists = await Course.findOne({ slug })
    if (exists) slug = `${slug}-${Date.now().toString(36)}`

    const learnings = Array.isArray(req.body?.learnings)
      ? req.body.learnings.map(String).filter(Boolean)
      : String(req.body?.learningsText ?? '')
          .split('\n')
          .map((s: string) => s.trim())
          .filter(Boolean)

    const course = await Course.create({
      slug,
      title,
      subtitle: String(req.body?.subtitle ?? '').trim(),
      description: String(req.body?.description ?? '').trim(),
      learnings,
      instructor: String(req.body?.instructor ?? '').trim(),
      instructorRole: String(req.body?.instructorRole ?? '').trim(),
      lessons: normalizeLessons(req.body?.lessons),
      price: Number(req.body?.price) || 0,
      originalPrice: Number(req.body?.originalPrice) || 0,
      students: Number(req.body?.students) || 0,
      rating: Number(req.body?.rating) || 5,
      accent: String(req.body?.accent ?? '#1F6B4A'),
      accentSoft: String(req.body?.accentSoft ?? '#D8F3E5'),
      coverLabel: String(req.body?.coverLabel ?? title.slice(0, 12).toUpperCase()),
      tag: String(req.body?.tag ?? 'Шинэ').trim() || 'Шинэ',
      category: String(req.body?.category ?? 'Бусад').trim() || 'Бусад',
      published: req.body?.published !== false,
    })

    res.status(201).json({ course: serialize(course) })
  } catch (err) {
    console.error('[courses/create]', err)
    res.status(500).json({ error: 'Үүсгэхэд алдаа гарлаа.' })
  }
})

coursesRouter.put('/:id', adminRequired, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      res.status(404).json({ error: 'Сургалт олдсонгүй.' })
      return
    }

    const title = String(req.body?.title ?? course.title).trim()
    if (!title) {
      res.status(400).json({ error: 'Гарчиг оруулна уу.' })
      return
    }

    if (req.body?.slug) {
      const nextSlug = String(req.body.slug).trim()
      if (nextSlug && nextSlug !== course.slug) {
        const clash = await Course.findOne({ slug: nextSlug, _id: { $ne: course._id } })
        if (clash) {
          res.status(409).json({ error: 'Энэ slug аль хэдийн байна.' })
          return
        }
        course.slug = nextSlug
      }
    }

    course.title = title
    course.subtitle = String(req.body?.subtitle ?? course.subtitle).trim()
    course.description = String(req.body?.description ?? course.description).trim()
    if (Array.isArray(req.body?.learnings)) {
      course.learnings = req.body.learnings.map(String).filter(Boolean)
    } else if (typeof req.body?.learningsText === 'string') {
      course.learnings = req.body.learningsText
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean)
    }
    course.instructor = String(req.body?.instructor ?? course.instructor).trim()
    course.instructorRole = String(
      req.body?.instructorRole ?? course.instructorRole,
    ).trim()
    if (req.body?.lessons !== undefined) {
      course.lessons = normalizeLessons(req.body.lessons)
    }
    if (req.body?.price !== undefined) course.price = Number(req.body.price) || 0
    if (req.body?.originalPrice !== undefined) {
      course.originalPrice = Number(req.body.originalPrice) || 0
    }
    if (req.body?.students !== undefined) course.students = Number(req.body.students) || 0
    if (req.body?.rating !== undefined) course.rating = Number(req.body.rating) || 5
    if (req.body?.accent) course.accent = String(req.body.accent)
    if (req.body?.accentSoft) course.accentSoft = String(req.body.accentSoft)
    if (req.body?.coverLabel !== undefined) {
      course.coverLabel = String(req.body.coverLabel)
    }
    if (req.body?.tag !== undefined) course.tag = String(req.body.tag).trim() || 'Шинэ'
    if (req.body?.category !== undefined) {
      course.category = String(req.body.category).trim() || 'Бусад'
    }
    if (req.body?.published !== undefined) {
      course.published = Boolean(req.body.published)
    }

    await course.save()
    res.json({ course: serialize(course) })
  } catch (err) {
    console.error('[courses/update]', err)
    res.status(500).json({ error: 'Шинэчлэхэд алдаа гарлаа.' })
  }
})

coursesRouter.delete('/:id', adminRequired, async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id)
    if (!deleted) {
      res.status(404).json({ error: 'Сургалт олдсонгүй.' })
      return
    }
    res.json({ ok: true })
  } catch (err) {
    console.error('[courses/delete]', err)
    res.status(500).json({ error: 'Устгахад алдаа гарлаа.' })
  }
})

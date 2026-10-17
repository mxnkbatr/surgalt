import { Router } from 'express'
import { adminRequired } from '../auth.js'
import { Category } from '../models/Category.js'
import { Course } from '../models/Course.js'

export const categoriesRouter = Router()

const DEFAULTS = ['Санхүү', 'Дизайн', 'Контент']

export async function ensureCategories() {
  const count = await Category.countDocuments()
  if (count > 0) return
  await Category.insertMany(DEFAULTS.map((name, order) => ({ name, order })))
  console.log(`[seed] ${DEFAULTS.length} ангилал орууллаа`)
}

categoriesRouter.get('/', async (_req, res) => {
  try {
    let list = await Category.find().sort({ order: 1, name: 1 })
    if (list.length === 0) {
      await ensureCategories()
      list = await Category.find().sort({ order: 1, name: 1 })
    }
    const fromCourses = await Course.distinct('category')
    const names = [
      ...new Set([
        ...list.map((c) => c.name),
        ...fromCourses.filter(Boolean),
      ]),
    ]
    res.json({
      categories: names.map((name, i) => {
        const row = list.find((c) => c.name === name)
        return {
          id: row?._id?.toString() ?? `c_${i}`,
          name,
          order: row?.order ?? i,
        }
      }),
    })
  } catch (err) {
    console.error('[categories/list]', err)
    res.status(500).json({ error: 'Ангилал авахад алдаа гарлаа.' })
  }
})

categoriesRouter.post('/', adminRequired, async (req, res) => {
  try {
    const name = String(req.body?.name ?? '').trim()
    if (!name) {
      res.status(400).json({ error: 'Ангиллын нэр оруулна уу.' })
      return
    }
    const exists = await Category.findOne({
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    })
    if (exists) {
      res.status(409).json({ error: 'Энэ ангилал аль хэдийн байна.' })
      return
    }
    const max = await Category.findOne().sort({ order: -1 })
    const cat = await Category.create({
      name,
      order: (max?.order ?? -1) + 1,
    })
    res.status(201).json({
      category: { id: cat._id.toString(), name: cat.name, order: cat.order },
    })
  } catch (err) {
    console.error('[categories/create]', err)
    res.status(500).json({ error: 'Ангилал үүсгэхэд алдаа гарлаа.' })
  }
})

categoriesRouter.delete('/:id', adminRequired, async (req, res) => {
  try {
    const id = req.params.id
    if (id.startsWith('c_')) {
      res.status(400).json({ error: 'Энэ ангиллыг устгах боломжгүй.' })
      return
    }
    const cat = await Category.findByIdAndDelete(id)
    if (!cat) {
      res.status(404).json({ error: 'Ангилал олдсонгүй.' })
      return
    }
    res.json({ ok: true })
  } catch (err) {
    console.error('[categories/delete]', err)
    res.status(500).json({ error: 'Устгахад алдаа гарлаа.' })
  }
})

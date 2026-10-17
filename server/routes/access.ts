import { Router } from 'express'
import { authRequired, getAuthUser } from '../auth.js'
import { User } from '../models/User.js'

export const accessRouter = Router()

accessRouter.get('/unlocked', authRequired, async (req, res) => {
  try {
    const { sub } = getAuthUser(req)
    const user = await User.findById(sub).select('unlockedSlugs')
    if (!user) {
      res.status(401).json({ error: 'Хэрэглэгч олдсонгүй.' })
      return
    }
    res.json({ unlocked: user.unlockedSlugs ?? [] })
  } catch (err) {
    console.error('[access/unlocked]', err)
    res.status(500).json({ error: 'Алдаа гарлаа.' })
  }
})

/** Карт демо — нэвтэрсэн хэрэглэгчийн сургалт нээх */
accessRouter.post('/unlock', authRequired, async (req, res) => {
  try {
    const { sub } = getAuthUser(req)
    const slugs = Array.isArray(req.body?.slugs)
      ? req.body.slugs.map(String).filter(Boolean)
      : []
    if (slugs.length === 0) {
      res.status(400).json({ error: 'slug шаардлагатай.' })
      return
    }

    const user = await User.findByIdAndUpdate(
      sub,
      { $addToSet: { unlockedSlugs: { $each: slugs } } },
      { new: true },
    ).select('unlockedSlugs')

    if (!user) {
      res.status(401).json({ error: 'Хэрэглэгч олдсонгүй.' })
      return
    }

    res.json({ unlocked: user.unlockedSlugs ?? [] })
  } catch (err) {
    console.error('[access/unlock]', err)
    res.status(500).json({ error: 'Алдаа гарлаа.' })
  }
})

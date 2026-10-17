import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { authRequired, getAuthUser, signToken } from '../auth.js'
import { User } from '../models/User.js'
import { normalizePhone } from '../phone.js'

const ADMIN_PHONE = process.env.ADMIN_PHONE || '90000000'

export const authRouter = Router()

function publicUser(u: {
  _id: { toString(): string }
  name: string
  phone: string
  isAdmin?: boolean
  unlockedSlugs?: string[]
}) {
  return {
    id: u._id.toString(),
    name: u.name,
    phone: u.phone,
    isAdmin: Boolean(u.isAdmin),
    unlockedSlugs: u.unlockedSlugs ?? [],
  }
}

authRouter.post('/signup', async (req, res) => {
  try {
    const name = String(req.body?.name ?? '').trim()
    const phone = normalizePhone(String(req.body?.phone ?? ''))
    const password = String(req.body?.password ?? '')

    if (name.length < 2) {
      res.status(400).json({ error: 'Нэрээ оруулна уу.' })
      return
    }
    if (!phone) {
      res.status(400).json({
        error: 'Утасны дугаар 8 оронтой байх ёстой (жишээ: 9911 2233).',
      })
      return
    }
    if (phone === ADMIN_PHONE) {
      res.status(400).json({ error: 'Энэ дугаарыг ашиглах боломжгүй.' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Нууц үг хамгийн багадаа 6 тэмдэгт байна.' })
      return
    }

    const exists = await User.findOne({ phone })
    if (exists) {
      res.status(409).json({ error: 'Энэ дугаар аль хэдийн бүртгэлтэй байна.' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      phone,
      passwordHash,
      isAdmin: false,
      unlockedSlugs: [],
    })

    const token = signToken(user)
    res.status(201).json({ token, user: publicUser(user) })
  } catch (err) {
    console.error('[auth/signup]', err)
    res.status(500).json({ error: 'Бүртгэл амжилтгүй. Дахин оролдоно уу.' })
  }
})

authRouter.post('/login', async (req, res) => {
  try {
    const phone = normalizePhone(String(req.body?.phone ?? ''))
    const password = String(req.body?.password ?? '')

    if (!phone) {
      res.status(400).json({ error: 'Утасны дугаараа зөв оруулна уу (8 орон).' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Нууц үг хамгийн багадаа 6 тэмдэгт байна.' })
      return
    }

    const user = await User.findOne({ phone })
    if (!user) {
      res.status(401).json({ error: 'Энэ дугаараар бүртгэл олдсонгүй.' })
      return
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      res.status(401).json({ error: 'Нууц үг буруу байна.' })
      return
    }

    const token = signToken(user)
    res.json({ token, user: publicUser(user) })
  } catch (err) {
    console.error('[auth/login]', err)
    res.status(500).json({ error: 'Нэвтрэх амжилтгүй. Дахин оролдоно уу.' })
  }
})

authRouter.get('/me', authRequired, async (req, res) => {
  try {
    const { sub } = getAuthUser(req)
    const user = await User.findById(sub)
    if (!user) {
      res.status(401).json({ error: 'Хэрэглэгч олдсонгүй.' })
      return
    }
    res.json({ user: publicUser(user) })
  } catch (err) {
    console.error('[auth/me]', err)
    res.status(500).json({ error: 'Алдаа гарлаа.' })
  }
})

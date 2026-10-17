import { Router } from 'express'
import { adminRequired, authRequired, getAuthUser } from '../auth.js'
import { Payment } from '../models/Payment.js'
import { User } from '../models/User.js'

export const paymentsRouter = Router()

function serialize(p: {
  _id: { toString(): string }
  ref: string
  userId: string
  userName: string
  phone: string
  slugs: string[]
  titles: string[]
  amount: number
  status: string
  createdAt: Date
  reviewedAt?: Date
}) {
  return {
    id: p._id.toString(),
    ref: p.ref,
    userId: p.userId,
    userName: p.userName,
    phone: p.phone,
    slugs: p.slugs,
    titles: p.titles,
    amount: p.amount,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    reviewedAt: p.reviewedAt?.toISOString(),
  }
}

paymentsRouter.get('/', authRequired, async (req, res) => {
  try {
    const auth = getAuthUser(req)
    const filter = auth.isAdmin ? {} : { userId: auth.sub }
    const list = await Payment.find(filter).sort({ createdAt: -1 }).limit(200)
    res.json({ payments: list.map(serialize) })
  } catch (err) {
    console.error('[payments/list]', err)
    res.status(500).json({ error: 'Жагсаалт авахад алдаа гарлаа.' })
  }
})

paymentsRouter.post('/', authRequired, async (req, res) => {
  try {
    const auth = getAuthUser(req)
    const ref = String(req.body?.ref ?? '').trim()
    const slugs = Array.isArray(req.body?.slugs)
      ? req.body.slugs.map(String)
      : []
    const titles = Array.isArray(req.body?.titles)
      ? req.body.titles.map(String)
      : []
    const amount = Number(req.body?.amount)

    if (!ref || slugs.length === 0 || !Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: 'Төлбөрийн мэдээлэл буруу байна.' })
      return
    }

    const user = await User.findById(auth.sub)
    if (!user) {
      res.status(401).json({ error: 'Хэрэглэгч олдсонгүй.' })
      return
    }

    const payment = await Payment.create({
      ref,
      userId: auth.sub,
      userName: user.name,
      phone: user.phone,
      slugs,
      titles,
      amount,
      status: 'pending',
    })

    res.status(201).json({ payment: serialize(payment) })
  } catch (err) {
    console.error('[payments/create]', err)
    res.status(500).json({ error: 'Хүсэлт үүсгэхэд алдаа гарлаа.' })
  }
})

paymentsRouter.patch('/:id', adminRequired, async (req, res) => {
  try {
    const status = String(req.body?.status ?? '')
    if (status !== 'approved' && status !== 'rejected') {
      res.status(400).json({ error: 'status approved|rejected байх ёстой.' })
      return
    }

    const payment = await Payment.findById(req.params.id)
    if (!payment) {
      res.status(404).json({ error: 'Хүсэлт олдсонгүй.' })
      return
    }
    if (payment.status !== 'pending') {
      res.status(400).json({ error: 'Энэ хүсэлтийг аль хэдийн шийдсэн.' })
      return
    }

    payment.status = status
    payment.reviewedAt = new Date()
    await payment.save()

    if (status === 'approved') {
      await User.findByIdAndUpdate(payment.userId, {
        $addToSet: { unlockedSlugs: { $each: payment.slugs } },
      })
    }

    res.json({ payment: serialize(payment) })
  } catch (err) {
    console.error('[payments/patch]', err)
    res.status(500).json({ error: 'Шинэчлэхэд алдаа гарлаа.' })
  }
})

import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { connectDb } from './db.js'
import { ensureAdmin } from './seed.js'
import { ensureCourses } from './seedCourses.js'
import { authRouter } from './routes/auth.js'
import { paymentsRouter } from './routes/payments.js'
import { accessRouter } from './routes/access.js'
import { coursesRouter } from './routes/courses.js'
import { categoriesRouter, ensureCategories } from './routes/categories.js'

const PORT = Number(process.env.PORT || 4000)
const MONGODB_URI = process.env.MONGODB_URI

async function main() {
  if (!MONGODB_URI) {
    console.error(
      '[server] MONGODB_URI байхгүй. .env файлд Atlas connection string тавина уу.',
    )
    process.exit(1)
  }

  await connectDb(MONGODB_URI)
  await ensureAdmin()
  await ensureCategories()
  await ensureCourses()

  const app = express()
  app.use(cors({ origin: true }))
  app.use(express.json({ limit: '2mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/payments', paymentsRouter)
  app.use('/api/access', accessRouter)
  app.use('/api/courses', coursesRouter)
  app.use('/api/categories', categoriesRouter)

  app.listen(PORT, () => {
    console.log(`[server] http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error('[server] эхлүүлэхэд алдаа:', err)
  process.exit(1)
})

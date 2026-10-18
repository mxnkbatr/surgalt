import cors from 'cors'
import express, { type Express } from 'express'
import { ensureDb, hasMongoUri } from './db.js'
import { ensureAdmin } from './seed.js'
import { ensureCourses } from './seedCourses.js'
import { authRouter } from './routes/auth.js'
import { paymentsRouter } from './routes/payments.js'
import { accessRouter } from './routes/access.js'
import { coursesRouter } from './routes/courses.js'
import { categoriesRouter, ensureCategories } from './routes/categories.js'

let bootPromise: Promise<void> | null = null

async function bootDb() {
  if (!bootPromise) {
    bootPromise = (async () => {
      await ensureDb()
      // Seed алдаа login-ийг бүрэн зогсоохгүй
      try {
        await ensureAdmin()
        await ensureCategories()
        await ensureCourses()
      } catch (seedErr) {
        console.error('[api] seed warning', seedErr)
      }
    })().catch((err) => {
      bootPromise = null
      throw err
    })
  }
  await bootPromise
}

export function createApp(options?: { lazyDb?: boolean }): Express {
  const app = express()
  app.use(cors({ origin: true }))
  app.use(express.json({ limit: '2mb' }))

  // Health — DB шаардахгүй (Vercel шалгалт)
  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      mongoUriConfigured: hasMongoUri(),
    })
  })

  if (options?.lazyDb) {
    app.use(async (req, res, next) => {
      if (req.path === '/api/health' || req.path === '/health') {
        next()
        return
      }
      try {
        await bootDb()
        next()
      } catch (err) {
        console.error('[api] db boot failed', err)
        const missing = !hasMongoUri()
        const detail = err instanceof Error ? err.message : String(err)
        res.status(503).json({
          error: missing
            ? 'MONGODB_URI Vercel дээр тохируулаагүй байна. Settings → Environment Variables → MONGODB_URI нэмээд Redeploy хийнэ үү.'
            : 'Database холбогдож чадсангүй. Atlas Network Access-д 0.0.0.0/0 байгаа эсэх, MONGODB_URI зөв эсэхийг шалгаад Redeploy хийнэ үү.',
          mongoUriConfigured: !missing,
          detail,
        })
      }
    })
  }

  app.use('/api/auth', authRouter)
  app.use('/api/payments', paymentsRouter)
  app.use('/api/access', accessRouter)
  app.use('/api/courses', coursesRouter)
  app.use('/api/categories', categoriesRouter)

  return app
}

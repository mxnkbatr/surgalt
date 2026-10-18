import cors from 'cors'
import express, { type Express } from 'express'
import { ensureDb } from './db.js'
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
      await ensureAdmin()
      await ensureCategories()
      await ensureCourses()
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

  if (options?.lazyDb) {
    app.use(async (_req, res, next) => {
      try {
        await bootDb()
        next()
      } catch (err) {
        console.error('[api] db boot failed', err)
        res.status(503).json({
          error:
            'Database холбогдож чадсангүй. Vercel Environment Variables (MONGODB_URI) болон Atlas Network Access-ээ шалгана уу.',
        })
      }
    })
  }

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/payments', paymentsRouter)
  app.use('/api/access', accessRouter)
  app.use('/api/courses', coursesRouter)
  app.use('/api/categories', categoriesRouter)

  return app
}

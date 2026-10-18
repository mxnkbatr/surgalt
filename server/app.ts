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

async function bootDb(options?: { seed?: boolean }) {
  if (!bootPromise) {
    bootPromise = (async () => {
      await ensureDb()
      if (options?.seed !== false) {
        try {
          await ensureAdmin()
          await ensureCategories()
          await ensureCourses()
        } catch (seedErr) {
          console.error('[api] seed warning', seedErr)
        }
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
  // Express 5 + serverless body: socket.readable=false үед json() hang болдог
  app.use((req, _res, next) => {
    const socket = req.socket as { readable?: boolean } | null
    if (socket && socket.readable === false) {
      socket.readable = true
    }
    next()
  })
  app.use(express.json({ limit: '2mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      mongoUriConfigured: hasMongoUri(),
    })
  })


  if (options?.lazyDb) {
    // Vercel: зөвхөн холбоно, seed хийхгүй (timeout-оос зайлсхийх)
    app.use(async (req, res, next) => {
      if (req.path === '/api/health' || req.path === '/health') {
        next()
        return
      }
      try {
        await bootDb({ seed: false })
        next()
      } catch (err) {
        console.error('[api] db boot failed', err)
        const missing = !hasMongoUri()
        const detail = err instanceof Error ? err.message : String(err)
        res.status(503).json({
          error: missing
            ? 'MONGODB_URI Vercel дээр тохируулаагүй байна. Settings → Environment Variables → MONGODB_URI нэмээд Redeploy хийнэ үү.'
            : 'Database холбогдож чадсангүй. Atlas Network Access 0.0.0.0/0 болон Redeploy шалгана уу.',
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

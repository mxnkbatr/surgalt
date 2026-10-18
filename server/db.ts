import mongoose from 'mongoose'

declare global {
  // Vercel serverless дээр холболтыг дахин ашиглана
  // eslint-disable-next-line no-var
  var __dcapitalDbPromise: Promise<typeof mongoose> | undefined
}

export function hasMongoUri() {
  return Boolean(process.env.MONGODB_URI?.trim())
}

export async function ensureDb(attempts = 3) {
  // Vercel дээр заримдаа "..." хашилттай paste хийгддэг
  const uri = process.env.MONGODB_URI?.trim().replace(/^["']+|["']+$/g, '')
  if (!uri) {
    throw new Error('MONGODB_URI байхгүй — Vercel Environment Variables-д нэмнэ үү')
  }

  mongoose.set('strictQuery', true)

  if (mongoose.connection.readyState === 1) return mongoose

  if (!globalThis.__dcapitalDbPromise) {
    globalThis.__dcapitalDbPromise = (async () => {
      let lastError: unknown
      const strategies = [
        { label: 'ipv4', opts: { family: 4 as const, serverSelectionTimeoutMS: 15000 } },
        { label: 'auto', opts: { serverSelectionTimeoutMS: 15000 } },
      ]

      for (let i = 1; i <= attempts; i++) {
        for (const strategy of strategies) {
          try {
            if (mongoose.connection.readyState !== 0) {
              await mongoose.disconnect().catch(() => undefined)
            }
            await mongoose.connect(uri, {
              bufferCommands: false,
              ...strategy.opts,
            })
            console.log(`[db] MongoDB холбогдлоо (${strategy.label})`)
            return mongoose
          } catch (err) {
            lastError = err
            console.error(
              `[db] холболт амжилтгүй (${i}/${attempts}, ${strategy.label})`,
              err instanceof Error ? err.message : err,
            )
          }
        }
        if (i < attempts) {
          await new Promise((r) => setTimeout(r, 1500))
        }
      }
      globalThis.__dcapitalDbPromise = undefined
      throw lastError
    })()
  }

  return globalThis.__dcapitalDbPromise
}

/** Локал серверийн хуучин нэр */
export async function connectDb(uri: string, attempts = 5) {
  if (!process.env.MONGODB_URI) process.env.MONGODB_URI = uri
  await ensureDb(attempts)
}

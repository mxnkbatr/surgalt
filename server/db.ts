import mongoose from 'mongoose'

declare global {
  // Vercel serverless дээр холболтыг дахин ашиглана
  // eslint-disable-next-line no-var
  var __dcapitalDbPromise: Promise<typeof mongoose> | undefined
}

export async function ensureDb(attempts = 3) {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI байхгүй')
  }

  mongoose.set('strictQuery', true)

  if (mongoose.connection.readyState === 1) return mongoose

  if (!globalThis.__dcapitalDbPromise) {
    globalThis.__dcapitalDbPromise = (async () => {
      let lastError: unknown
      for (let i = 1; i <= attempts; i++) {
        try {
          await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000,
            bufferCommands: false,
          })
          console.log('[db] MongoDB холбогдлоо')
          return mongoose
        } catch (err) {
          lastError = err
          console.error(`[db] холболт амжилтгүй (${i}/${attempts})`)
          if (i < attempts) {
            await new Promise((r) => setTimeout(r, 1500))
          }
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

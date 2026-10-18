import mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line no-var
  var __dcapitalDbPromise: Promise<typeof mongoose> | undefined
}

export function hasMongoUri() {
  return Boolean(process.env.MONGODB_URI?.trim())
}

export async function ensureDb() {
  const uri = process.env.MONGODB_URI?.trim().replace(/^["']+|["']+$/g, '')
  if (!uri) {
    throw new Error('MONGODB_URI байхгүй — Vercel Environment Variables-д нэмнэ үү')
  }

  mongoose.set('strictQuery', true)

  if (mongoose.connection.readyState === 1) return mongoose

  if (!globalThis.__dcapitalDbPromise) {
    globalThis.__dcapitalDbPromise = mongoose
      .connect(uri, {
        // Vercel Hobby ~10s limit — хурдан fail/success
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        bufferCommands: false,
        family: 4,
      })
      .then((m) => {
        console.log('[db] MongoDB холбогдлоо')
        return m
      })
      .catch((err) => {
        globalThis.__dcapitalDbPromise = undefined
        throw err
      })
  }

  return globalThis.__dcapitalDbPromise
}

export async function connectDb(uri: string) {
  if (!process.env.MONGODB_URI) process.env.MONGODB_URI = uri
  await ensureDb()
}

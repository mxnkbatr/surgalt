import 'dotenv/config'
import { createApp } from './app.js'
import { ensureDb } from './db.js'
import { ensureAdmin } from './seed.js'
import { ensureCourses } from './seedCourses.js'
import { ensureCategories } from './routes/categories.js'

const PORT = Number(process.env.PORT || 4000)

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error(
      '[server] MONGODB_URI байхгүй. .env файлд Atlas connection string тавина уу.',
    )
    process.exit(1)
  }

  await ensureDb()
  await ensureAdmin()
  await ensureCategories()
  await ensureCourses()

  const app = createApp({ lazyDb: false })
  app.listen(PORT, () => {
    console.log(`[server] http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error('[server] эхлүүлэхэд алдаа:', err)
  process.exit(1)
})

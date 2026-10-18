import { createApp } from '../server/app.js'

// Vercel Node runtime: Express app-аа шууд export (serverless-http + Express 5 hang үүсгэдэг)
const app = createApp({ lazyDb: true })

export default app

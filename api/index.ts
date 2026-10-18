import { createApp } from '../server/app.js'

/** Vercel serverless entry — /api/* */
export default createApp({ lazyDb: true })

import serverless from 'serverless-http'
import { createApp } from '../server/app.js'

const app = createApp({ lazyDb: true })

/** Vercel / AWS Lambda-д Express зөв ажиллуулах wrapper */
export default serverless(app, {
  binary: false,
})

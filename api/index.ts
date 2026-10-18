import serverless from 'serverless-http'
import { createApp } from '../server/app.js'

const app = createApp({ lazyDb: true })

export default serverless(app)

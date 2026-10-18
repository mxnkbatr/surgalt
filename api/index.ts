import { createApp } from '../server/app.js'

const app = createApp({ lazyDb: true })

/** Vercel serverless — Express-ийг request handler болгоно */
export default function handler(
  req: Parameters<typeof app>[0],
  res: Parameters<typeof app>[1],
) {
  return app(req, res)
}

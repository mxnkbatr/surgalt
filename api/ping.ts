export default function handler(
  _req: { method?: string },
  res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b: string) => void },
) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ ok: true, ping: true }))
}

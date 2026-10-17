import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { Types } from 'mongoose'

const JWT_SECRET = process.env.JWT_SECRET || 'dcapital-dev-secret-change-me'

export type JwtPayload = {
  sub: string
  phone: string
  isAdmin: boolean
}

export function signToken(user: {
  _id: Types.ObjectId | string
  phone: string
  isAdmin?: boolean
}) {
  const payload: JwtPayload = {
    sub: String(user._id),
    phone: user.phone,
    isAdmin: Boolean(user.isAdmin),
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    res.status(401).json({ error: 'Нэвтэрнэ үү.' })
    return
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    ;(req as Request & { user: JwtPayload }).user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Session дууссан. Дахин нэвтэрнэ үү.' })
  }
}

export function adminRequired(req: Request, res: Response, next: NextFunction) {
  authRequired(req, res, () => {
    const user = (req as Request & { user?: JwtPayload }).user
    if (!user?.isAdmin) {
      res.status(403).json({ error: 'Админ эрх шаардлагатай.' })
      return
    }
    next()
  })
}

export function getAuthUser(req: Request): JwtPayload {
  return (req as Request & { user: JwtPayload }).user
}

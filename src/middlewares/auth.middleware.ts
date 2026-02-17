import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../lib/supabase'

const JWT_SECRET = process.env.EXTERNAL_JWT_SECRET!
const MOCK_USER_ID = 'b33f534c-3cf4-4bbc-942f-fd2cdb899270'


interface JwtPayload {
  sub: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        role: string
      }
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

    if (!decoded.sub || !decoded.role) {
      return res.status(401).json({ error: 'Invalid token payload' })
    }

    req.user = {
      userId: decoded.sub,
      role: decoded.role,
    }

    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireAuthForAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = auth.split(' ')[1]
    jwt.verify(token, JWT_SECRET)


    req.user = {
      userId: MOCK_USER_ID,
      role: 'client',
    }

    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' })
  }
  next()
}
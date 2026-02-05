import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.EXTERNAL_JWT_SECRET!

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as any

    if (!decoded.sub || !decoded.role) {
      return res.status(401).json({ error: 'Invalid token payload' })
    }

    // 🔑 THIS IS THE IMPORTANT LINE
    req.user = {
      userId: decoded.sub,   // ← map sub → userId
      role: decoded.role,
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
import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

const JWT_SECRET = process.env.EXTERNAL_JWT_SECRET as string

if (!JWT_SECRET) {
  throw new Error('EXTERNAL_JWT_SECRET is not defined')
}

function extractToken(req: Request): string | null {
  // Authorization: Bearer <token>
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]
  }

  // Cookies
  if (req.cookies?.token) {
    return req.cookies.token
  }

  return null
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = extractToken(req)

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

    if (!decoded.userId || !decoded.role) {
      return res.status(401).json({ error: 'Invalid token payload' })
    }

    req.user = {
      userId: decoded.userId,
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
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  next()
}

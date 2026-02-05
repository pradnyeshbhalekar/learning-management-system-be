import { Request, Response } from 'express'
import { signDevToken } from '../utils/jwt'

export function generateDevToken(req: Request, res: Response) {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.ALLOW_DEV_TOOLS !== 'true'
  ) {
    return res.status(403).json({ error: 'Dev tools disabled' })
  }

  const { role } = req.body

  if (role !== 'admin' && role !== 'client') {
    return res.status(400).json({ error: 'Invalid role' })
  }

  const token = signDevToken(role)

  res.json({ token })
}
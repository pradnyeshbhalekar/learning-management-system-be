import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = process.env.EXTERNAL_JWT_SECRET!

const DEV_SUBS = {
  admin: '00000000-0000-0000-0000-000000000001',
  client: '00000000-0000-0000-0000-000000000002',
} as const

type Role = keyof typeof DEV_SUBS // 'admin' | 'client'

router.post('/generate-token', (req: Request, res: Response) => {
  const { role } = req.body as { role?: Role }

  if (!role || !(role in DEV_SUBS)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  const token = jwt.sign(
    {
      sub: DEV_SUBS[role],
      role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({ token })
})

export default router
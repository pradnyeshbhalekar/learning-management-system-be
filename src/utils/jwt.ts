import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.EXTERNAL_JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error('EXTERNAL_JWT_SECRET missing')
}

export type UserRole = 'admin' | 'client'

export function signDevToken(role: UserRole) {
  return jwt.sign(
    {
      sub: '00000000-0000-0000-0000-000000000001', // dev user
      role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    sub: string
    role: UserRole
  }
}
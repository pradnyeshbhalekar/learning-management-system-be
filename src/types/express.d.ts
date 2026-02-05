import 'express'

declare global {
  namespace Express {
    interface User {
      userId: string
      role: 'admin' | 'client'
    }

    interface Request {
      user?: User
    }
  }
}

export {}
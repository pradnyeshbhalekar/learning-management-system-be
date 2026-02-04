import { Request, Response, NextFunction } from 'express'

export function devAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // Hardcoded dev user
  req.user = {
    userId: '57a0ee51-8a23-4b3a-8c2f-9e41d7d81284',
    role: 'admin',
  }

  next()
}

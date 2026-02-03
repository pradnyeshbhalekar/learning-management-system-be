import { Request, Response, NextFunction } from 'express'

export function devAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // Hardcoded dev user
  req.user = {
    userId: '00000000-0000-0000-0000-000000000001',
    role: 'admin',
  }

  next()
}

import { Request, Response, NextFunction } from 'express'

export function devAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // Hardcoded dev user
  req.user = {
    userId: 'dev-user-123',
    role: 'admin',
  }

  next()
}

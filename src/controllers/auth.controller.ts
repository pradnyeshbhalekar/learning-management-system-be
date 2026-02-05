import { Request, Response } from 'express'

export function me(req: Request, res: Response) {
  res.json({
    authenticated: true,
    user: req.user,
  })
}
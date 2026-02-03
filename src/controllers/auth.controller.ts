import { Request, Response } from 'express'
import * as AuthService from '../services/auth.service'

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    const result = await AuthService.loginUser(email, password)

    res.json(result)
  } catch (err: any) {
    res.status(401).json({ error: err.message })
  }
}



export async function me(req: Request, res: Response) {
  const userId = req.user!.userId

  const user = await AuthService.getCurrentUser(userId)

  if (!user) {
    return res.status(404).json({
      message: 'User not found (expected until Supabase access is ready)',
    })
  }

  res.json(user)
}
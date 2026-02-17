import { Router } from 'express'
import { getDashboardStats } from '../controllers/dashboard.controller'
import { requireAuthForAnalytics } from '../middlewares/auth.middleware'

const router = Router()

router.get('/me', requireAuthForAnalytics, getDashboardStats)

export default router
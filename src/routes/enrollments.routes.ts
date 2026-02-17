import { Router } from 'express'
import {
  enroll,
  getMyEnrollments,
} from '../controllers/enrollments.controller'
import { requireAuth,requireAuthForAnalytics } from '../middlewares/auth.middleware'

const router = Router()

router.post('/', requireAuthForAnalytics, enroll)
router.get('/me', requireAuth, getMyEnrollments)

export default router

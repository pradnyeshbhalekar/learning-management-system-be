import { Router } from 'express'
import {
  enroll,
  getMyEnrollments,
} from '../controllers/enrollments.controller'
import { requireAuth } from '../middlewares/auth.middleware'

const router = Router()

router.post('/', requireAuth, enroll)
router.get('/me', requireAuth, getMyEnrollments)

export default router

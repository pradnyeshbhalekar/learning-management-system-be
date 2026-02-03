import { Router } from 'express'
import {
  enroll,
  getMyEnrollments,
} from '../controllers/enrollments.controller'
import { devAuth } from '../middlewares/devAuth.middleware'

const router = Router()

router.post('/', devAuth, enroll)
router.get('/me', devAuth, getMyEnrollments)

export default router

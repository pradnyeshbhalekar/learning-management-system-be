import { Router } from 'express'
import {
  getCourseLabs,
  updateCourseLabs,
} from '../controllers/labs.controller'
import { requireAdmin } from '../middlewares/auth.middleware'
import { devAuth } from '../middlewares/devAuth.middleware'

const router = Router()


router.get('/courses/:id/labs', getCourseLabs)


router.post(
  '/courses/:id/labs',
  devAuth,
  requireAdmin,
  updateCourseLabs
)

export default router
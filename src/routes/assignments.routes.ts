import { Router } from 'express'
import {
  getAssignmentByCourse,
  submitAssignment,
} from '../controllers/assignments.controller'
import { requireAuthForAnalytics } from '../middlewares/auth.middleware'
import { upload } from '../middlewares/upload.middleware'

const router = Router()

router.get(
  '/course/:courseId',
  requireAuthForAnalytics,
  getAssignmentByCourse
)

router.post(
  '/:assignmentId/submit',
  requireAuthForAnalytics,
  upload.single('file'),
  submitAssignment
)

export default router
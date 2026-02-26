import { Router } from 'express'
import {
  getAssignmentByCourse,
  submitAssignment,
} from '../controllers/assignments.controller'
import { requireAuthForAnalytics } from '../middlewares/auth.middleware'
import { upload } from '../middlewares/upload.middleware'

const router = Router()

// Get assignment for a course
router.get(
  '/course/:courseId',
  requireAuthForAnalytics,
  getAssignmentByCourse
)

// Submit assignment
router.post(
  '/:assignmentId/submit',
  requireAuthForAnalytics,
  upload.single('file'),
  submitAssignment
)

export default router
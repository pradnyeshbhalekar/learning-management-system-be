import { Router } from 'express'
import {
  getAssignmentByTopic,
  submitAssignment,
} from '../controllers/assignments.controller'
import { requireAuthForAnalytics } from '../middlewares/auth.middleware'
import { upload } from '../middlewares/upload.middleware'

const router = Router()

// Get assignment for a topic
router.get(
  '/topic/:topicId',
  requireAuthForAnalytics,
  getAssignmentByTopic
)

// Submit assignment
router.post(
  '/:assignmentId/submit',
  requireAuthForAnalytics,
  upload.single('file'),
  submitAssignment
)

export default router
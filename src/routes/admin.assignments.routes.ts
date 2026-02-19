import { Router } from 'express'
import {
  createAssignment,
  updateAssignment, deleteAssignment
} from '../controllers/admin.assignments.controller'
import {
  getSubmissionsByAssignment,
  evaluateSubmission,
} from '../controllers/admin.assignments.controller'
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

router.post('/', requireAuth, requireAdmin, createAssignment)
router.put('/:assignmentId', requireAuth, requireAdmin, updateAssignment)
router.delete('/:assignmentId', requireAuth, requireAdmin, deleteAssignment)

router.get(
  '/:assignmentId/submissions',
  requireAuth,
  requireAdmin,
  getSubmissionsByAssignment
)

router.post(
  '/submissions/:submissionId/evaluate',
  requireAuth,
  requireAdmin,
  evaluateSubmission
)

export default router
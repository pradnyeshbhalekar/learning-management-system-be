import { Router } from 'express'
import {
  listLabs,
  getLab,
  createLab,
  updateLab,
  deleteLab,
  getLabsForCourse,
  updateCourseLabs,
} from '../controllers/labs.controller'
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

// Labs CRUD
router.get('/', listLabs)
router.get('/:id', getLab)
router.post('/', requireAuth, requireAdmin, createLab)
router.put('/:id', requireAuth, requireAdmin, updateLab)
router.delete('/:id', requireAuth, requireAdmin, deleteLab)

// Course ↔ Labs
router.get('/courses/:courseId/labs', getLabsForCourse)
router.post(
  '/courses/:courseId/labs',
  requireAuth,
  requireAdmin,
  updateCourseLabs
)

export default router
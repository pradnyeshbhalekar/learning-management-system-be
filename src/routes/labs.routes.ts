import { Router } from 'express'
import {
  listLabs,
  getLab,
  createLab,
  updateLab,
  deleteLab,
  getCourseLabs,
  updateCourseLabs,
} from '../controllers/labs.controller'
import { devAuth } from '../middlewares/devAuth.middleware'
import { requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', listLabs)
router.get('/:id', getLab)
router.get('/courses/:id/labs', getCourseLabs)

router.post('/', devAuth, requireAdmin, createLab)
router.put('/:id', devAuth, requireAdmin, updateLab)
router.delete('/:id', devAuth, requireAdmin, deleteLab)

router.post(
  '/courses/:id/labs',
  devAuth,
  requireAdmin,
  updateCourseLabs
)

export default router

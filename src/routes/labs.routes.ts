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
import { requireAdmin,requireAuth } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', listLabs)
router.get('/:id', getLab)
router.get('/courses/:id/labs', getCourseLabs)

router.post('/', requireAuth, requireAdmin, createLab)
router.put('/:id', requireAuth, requireAdmin, updateLab)
router.delete('/:id', requireAuth, requireAdmin, deleteLab)
router.post('/courses/:id/labs', requireAuth, requireAdmin, updateCourseLabs)

router.post(
  '/courses/:id/labs',

  requireAdmin,
  updateCourseLabs
)

export default router

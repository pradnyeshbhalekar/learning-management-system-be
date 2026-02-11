import { Router } from 'express'
import {
  createVideo,
  streamVideo,
  updateVideo,
} from '../controllers/video.controller'
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', streamVideo)
router.post('/', requireAuth, requireAdmin, createVideo)
router.put('/:id', requireAuth, requireAdmin, updateVideo)

export default router
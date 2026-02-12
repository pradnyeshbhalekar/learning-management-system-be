import { Router } from 'express'
import {
  createVideo,
  streamVideo,
  updateVideo,uploadVideo
} from '../controllers/video.controller'
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware'
import { upload } from '../middlewares/upload.middleware'


const router = Router()

router.get('/', streamVideo)
router.post('/', requireAuth, requireAdmin, createVideo)
router.put('/:id', requireAuth, requireAdmin, updateVideo)
router.post(
  '/upload',
  requireAuth,
  requireAdmin,
  upload.single('file'), 
  uploadVideo
)

export default router
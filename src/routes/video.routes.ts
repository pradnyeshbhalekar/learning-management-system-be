import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware'
import { streamVideo, getSignedUrl, createVideo } from '../controllers/video.controller'

const router = Router()

router.get('/', streamVideo)
router.get('/signed-url', requireAuth, getSignedUrl)
router.post('/', requireAuth, requireAdmin, createVideo)

export default router
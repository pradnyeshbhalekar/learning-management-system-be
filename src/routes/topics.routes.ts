import { Router } from 'express'
import { createTopic,getTopicsByCourse } from '../controllers/topics.controller'
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

// Create topic (Admin)
router.post('/', requireAuth, requireAdmin, createTopic)
router.get('/course/:courseId', getTopicsByCourse)

export default router
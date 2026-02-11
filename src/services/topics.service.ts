import { Router } from 'express'
import { createTopic } from '../controllers/topics.controller'
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

// Create topic (Admin)
router.post('/', requireAuth, requireAdmin, createTopic)

export default router
import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware'
import {
  createTopic,
  getTopicsByCourse,
  getTopicById,
  updateTopic,
  deleteTopic,
} from '../controllers/topics.controller'

const router = Router()

router.get('/course/:courseId', getTopicsByCourse)
router.get('/:id', getTopicById)

router.post('/', requireAuth, requireAdmin, createTopic)
router.put('/:id', requireAuth, requireAdmin, updateTopic)
router.delete('/:id', requireAuth, requireAdmin, deleteTopic)

export default router
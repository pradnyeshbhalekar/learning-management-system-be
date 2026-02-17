import { Router } from 'express'
import { requireAuth, requireAdmin,requireAuthForAnalytics } from '../middlewares/auth.middleware'
import {
  createTopic,
  getTopicsByCourse,
  getTopicById,
  updateTopic,
  deleteTopic,completeTopic
} from '../controllers/topics.controller'

const router = Router()

router.get('/course/:courseId', getTopicsByCourse)
router.get('/:id', getTopicById)

router.post('/', requireAuth, requireAdmin, createTopic)
router.put('/:id', requireAuth, requireAdmin, updateTopic)
router.delete('/:id', requireAuth, requireAdmin, deleteTopic)
router.post('/:topicId/complete', requireAuthForAnalytics, completeTopic)


export default router
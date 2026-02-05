import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import {
  getQuizByTopic,
  submitQuiz,
  getMyQuizAttempts,
} from '../controllers/quiz.user.controller'

const router = Router()


router.get('/topic/:topicId', getQuizByTopic)


router.post('/submit', requireAuth, submitQuiz)
router.get('/my-attempts', requireAuth, getMyQuizAttempts)

export default router
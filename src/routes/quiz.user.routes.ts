import { Router } from 'express'
import { devAuth } from '../middlewares/devAuth.middleware'
import {
  getQuizByTopic,
  submitQuiz,
  getMyQuizAttempts,
} from '../controllers/quiz.user.controller'

const router = Router()


router.get('/topic/:topicId', devAuth, getQuizByTopic)


router.post('/submit', devAuth, submitQuiz)


router.get('/my-attempts', devAuth, getMyQuizAttempts)

export default router
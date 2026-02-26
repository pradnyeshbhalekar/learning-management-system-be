import { Router } from 'express'
import { requireAuthForAnalytics } from '../middlewares/auth.middleware'
import {
  getQuizByCourse,
  submitQuiz,
  getMyQuizAttempts,
} from '../controllers/quiz.user.controller'

const router = Router()

router.get('/course/:courseId', requireAuthForAnalytics, getQuizByCourse)
router.post('/course/:courseId/submit', requireAuthForAnalytics, submitQuiz)
router.get('/my-attempts', requireAuthForAnalytics, getMyQuizAttempts)

export default router
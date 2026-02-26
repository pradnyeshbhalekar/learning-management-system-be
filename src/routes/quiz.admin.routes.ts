import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware'
import {
  getQuestions,
  createQuestion,
  updateQuestion,createQuiz,
  deleteQuestion,getQuizByCourse
} from '../controllers/quiz.admin.controller'

const router = Router()

router.use(requireAuth, requireAdmin)
router.post('/', createQuiz)
router.get('/course/:courseId',getQuizByCourse)

/* QUESTIONS */
router.get('/questions', getQuestions)
router.post('/questions', createQuestion)
router.put('/questions/:id', updateQuestion)
router.delete('/questions/:id', deleteQuestion)

export default router
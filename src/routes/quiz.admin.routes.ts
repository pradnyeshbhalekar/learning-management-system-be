import { Router } from 'express'
import { devAuth } from '../middlewares/devAuth.middleware'
import { requireAdmin,requireAuth } from '../middlewares/auth.middleware'
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestions,updateQuizQuestion
} from '../controllers/quiz.admin.controller'

const router = Router()


router.use(requireAuth, requireAdmin)

router.get('/', getQuestions)
router.post('/', createQuestion)
router.put('/:id', updateQuizQuestion)
router.delete('/:id', deleteQuestion)


export default router
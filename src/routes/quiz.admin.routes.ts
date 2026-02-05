import { Router } from 'express'
import { devAuth } from '../middlewares/devAuth.middleware'
import { requireAdmin,requireAuth } from '../middlewares/auth.middleware'
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestions,
} from '../controllers/quiz.admin.controller'

const router = Router()


router.use(requireAuth, requireAdmin)

router.get('/', getQuestions)
router.post('/', createQuestion)
router.put('/:id', updateQuestion)
router.delete('/:id', deleteQuestion)
export default router
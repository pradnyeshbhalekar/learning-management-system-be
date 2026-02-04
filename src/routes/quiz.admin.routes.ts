import { Router } from 'express'
import { devAuth } from '../middlewares/devAuth.middleware'
import { requireAdmin } from '../middlewares/auth.middleware'
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestions,
} from '../controllers/quiz.admin.controller'

const router = Router()


router.get('/', devAuth, requireAdmin, getQuestions)


router.post('/', devAuth, requireAdmin, createQuestion)


router.put('/:id', devAuth, requireAdmin, updateQuestion)


router.delete('/:id', devAuth, requireAdmin, deleteQuestion)

export default router
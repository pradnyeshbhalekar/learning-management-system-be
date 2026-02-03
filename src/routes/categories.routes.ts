import { Router } from 'express'
import {
  getCategories,
  createCategory, updateCategory,deleteCategory
} from '../controllers/categories.controller'
import { devAuth } from '../middlewares/devAuth.middleware'
import { requireAdmin } from '../middlewares/auth.middleware'

const router = Router()


router.get('/', getCategories)
router.post('/', devAuth, requireAdmin, createCategory)
router.put('/:id', devAuth, requireAdmin, updateCategory)
router.delete('/:id', devAuth, requireAdmin, deleteCategory)

export default router
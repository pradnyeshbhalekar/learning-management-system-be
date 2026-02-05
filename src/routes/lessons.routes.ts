import { Router } from 'express'
import {
  getLessonsForCourse,
  completeLesson,
} from '../controllers/lessons.controller'
import { requireAuth } from '../middlewares/auth.middleware'


const router = Router()


router.get('/course/:id', getLessonsForCourse)


router.post('/:id/complete', requireAuth, completeLesson)
export default router

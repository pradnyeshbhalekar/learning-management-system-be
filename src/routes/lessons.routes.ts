import { Router } from 'express'
import { devAuth } from '../middlewares/devAuth.middleware'
import {
  getLessonsForCourse,
  completeLesson,
} from '../controllers/lessons.controller'

const router = Router()


router.get('/course/:id', getLessonsForCourse)


router.post('/:id/complete', devAuth, completeLesson)

export default router

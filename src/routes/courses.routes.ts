import { Router } from 'express'
import * as CoursesController from '../controllers/courses.controller'

const router = Router()

router.get('/', CoursesController.getCourses)
router.get('/:id', CoursesController.getCourse)

export default router

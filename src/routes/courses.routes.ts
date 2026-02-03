import { Router } from 'express'
import * as CoursesController from '../controllers/courses.controller'
import { getLessonsForCourse } from '../controllers/lessons.controller'


const router = Router()

router.get('/', CoursesController.getCourses)
router.get('/:id', CoursesController.getCourse)
router.get('/:id/lessons', getLessonsForCourse)


export default router

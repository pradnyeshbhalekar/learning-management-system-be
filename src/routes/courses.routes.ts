import { Router } from 'express'
import * as CoursesController from '../controllers/courses.controller'
import { getLessonsForCourse } from '../controllers/lessons.controller'
import { devAuth } from '../middlewares/devAuth.middleware'
import { requireAdmin } from '../middlewares/auth.middleware'



const router = Router()

router.get('/', CoursesController.getCourses)
router.post('/', devAuth, requireAdmin, CoursesController.createCourse)
router.get('/:id', CoursesController.getCourse)
router.get('/:id/details', devAuth,CoursesController.getCourseDetails)
router.delete('/:id', devAuth, requireAdmin, CoursesController.deleteCourse)





export default router

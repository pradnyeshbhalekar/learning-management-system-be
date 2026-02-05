import { Router } from 'express'
import * as CoursesController from '../controllers/courses.controller'
import { getLessonsForCourse } from '../controllers/lessons.controller'

import { requireAuth, requireAdmin } from '../middlewares/auth.middleware'



const router = Router()



router.post('/', requireAuth, requireAdmin, CoursesController.createCourse)
router.delete('/:id', requireAuth, requireAdmin, CoursesController.deleteCourse)

router.get('/', CoursesController.getCourses)
router.get('/:id', CoursesController.getCourse)
router.get('/:id/details', CoursesController.getCourseDetails)



export default router

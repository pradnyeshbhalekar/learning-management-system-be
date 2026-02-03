import { Request, Response } from 'express'
import * as CoursesService from '../services/courses.service'

export async function getCourses(_req: Request, res: Response) {
  const courses = await CoursesService.getAllCourses()
  res.json(courses)
}

export async function getCourse(req: Request, res: Response) {
  const course = await CoursesService.getCourseById(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id)
  res.json(course)
}

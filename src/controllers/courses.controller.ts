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

export async function getCourseDetails(
  req: Request,
  res: Response
) {
  const courseId = String(req.params.id)

  const result = await CoursesService.getCourseWithTopics(courseId)
  res.json(result)
}

export async function deleteCourse(
  req: Request,
  res: Response
) {
  const courseId = String(req.params.id)

  await CoursesService.deleteCourse(courseId)
  res.json({ success: true })
}
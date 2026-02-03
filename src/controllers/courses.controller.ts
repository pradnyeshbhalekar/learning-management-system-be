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


export async function createCourse(
  req: Request,
  res: Response
) {
  const userId = req.user!.userId
  const { title, description, category_id } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Title is required' })
  }

  const course = await CoursesService.createCourse({
    title,
    description,
    category_id,
    instructor_id: userId,
  })

  res.status(201).json(course)
}
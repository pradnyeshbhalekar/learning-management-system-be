import { Request, Response } from 'express'
import * as LessonsService from '../services/lessons.service'


export async function getLessonsForCourse(
  req: Request,
  res: Response
) {
  const courseId = String(req.params.id)

  const lessons = await LessonsService.getLessonsByCourse(courseId)
  res.json(lessons)
}


export async function completeLesson(
  req: Request,
  res: Response
) {
  const userId = req.user!.userId
  const lessonId = String(req.params.id)

  await LessonsService.markLessonComplete({
    user_id: userId,
    lesson_id: lessonId,
  })

  res.status(201).json({
    message: 'Lesson marked as complete',
  })
}

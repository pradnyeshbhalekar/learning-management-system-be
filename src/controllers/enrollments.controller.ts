import { Request, Response } from 'express'
import * as EnrollmentService from '../services/enrollments.service'

export async function enroll(req: Request, res: Response) {
  const userId = req.user!.userId
  const { courseId } = req.body

  await EnrollmentService.createEnrollment({
    user_id: userId,
    course_id: courseId,
  })

  res.status(201).json({ message: 'Enrolled successfully' })
}

export async function getMyEnrollments(req: Request, res: Response) {
  const userId = req.user!.userId

  const enrollments = await EnrollmentService.getUserEnrollments(userId)
  res.json(enrollments)
}

import { Request, Response } from 'express'
import * as EnrollmentService from '../services/enrollments.service'

export async function enroll(req: Request, res: Response) {
  const userId = req.user!.userId
  const { course_id } = req.body

  if (!course_id) {
    return res.status(400).json({ message: 'course_id is required' })
  }

  await EnrollmentService.createEnrollment(userId, course_id)

  res.status(201).json({ message: 'Enrolled successfully' })
}

export async function getMyEnrollments(req: Request, res: Response) {
  const userId = req.user!.userId

  const enrollments = await EnrollmentService.getUserEnrollments(userId)
  res.json(enrollments)
}
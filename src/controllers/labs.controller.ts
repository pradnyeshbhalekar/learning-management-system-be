import { Request, Response } from 'express'
import * as LabsService from '../services/labs.service'

export async function getCourseLabs(
  req: Request,
  res: Response
) {
  const courseId = String(req.params.id)
  const labs = await LabsService.getLabsForCourse(courseId)
  res.json(labs)
}

export async function updateCourseLabs(
  req: Request,
  res: Response
) {
  const courseId = String(req.params.id)
  const { labIds } = req.body

  if (!Array.isArray(labIds)) {
    return res.status(400).json({ error: 'labIds must be an array' })
  }

  await LabsService.updateCourseLabs(courseId, labIds)

  res.json({ success: true, message: 'Labs updated' })
}
import { Request, Response } from 'express'
import * as CourseLabsService from '../services/course-labs.service'
import * as LabsService from '../services/labs.service'

export async function listLabs(
  _req: Request,
  res: Response
) {
  const labs = await LabsService.getAllLabs()
  res.json(labs)
}

export async function getLab(
  req: Request,
  res: Response
) {
  const lab = await LabsService.getLabById(String(req.params.id))
  res.json(lab)
}

export async function createLab(
  req: Request,
  res: Response
) {
  const { name, code, description } = req.body

  if (!name || !code) {
    return res.status(400).json({
      error: 'Name and code are required',
    })
  }

  const lab = await LabsService.createLab({
    name,
    code,
    description,
  })

  res.status(201).json(lab)
}

export async function updateLab(
  req: Request,
  res: Response
) {
  const lab = await LabsService.updateLab(
    String(req.params.id),
    req.body
  )

  res.json(lab)
}

export async function deleteLab(
  req: Request,
  res: Response
) {
  await LabsService.deleteLab(String(req.params.id))
  res.json({ success: true })
}

export async function getCourseLabs(
  req: Request,
  res: Response
) {
  const courseId = String(req.params.id)
  const labs = await CourseLabsService.getLabsForCourse(courseId)
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

  await CourseLabsService.updateCourseLabs(courseId, labIds)

  res.json({ success: true, message: 'Labs updated' })
}
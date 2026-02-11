import { Request, Response } from 'express'
import * as LabsService from '../services/labs.service'
import * as CourseLabsService from '../services/course-labs.service'

/* =========================
   LIST ALL LABS (PUBLIC)
========================= */
export async function listLabs(
  _req: Request,
  res: Response
) {
  try {
    const labs = await LabsService.getAllLabs()
    res.json(labs)
  } catch (err) {
    console.error('listLabs error:', err)
    res.status(500).json({ error: 'Failed to fetch labs' })
  }
}

/* =========================
   GET SINGLE LAB (PUBLIC)
========================= */
export async function getLab(
  req: Request,
  res: Response
) {
  try {
    const labId = String(req.params.id)
    const lab = await LabsService.getLabById(labId)
    res.json(lab)
  } catch (err) {
    console.error('getLab error:', err)
    res.status(500).json({ error: 'Failed to fetch lab' })
  }
}

/* =========================
   CREATE LAB (ADMIN)
========================= */
export async function createLab(
  req: Request,
  res: Response
) {
  try {
    const { name, code, description } = req.body

    if (!name || !code) {
      return res.status(400).json({
        error: 'name and code are required',
      })
    }

    const lab = await LabsService.createLab({
      name,
      code,
      description,
    })

    res.status(201).json(lab)
  } catch (err) {
    console.error('createLab error:', err)
    res.status(500).json({ error: 'Failed to create lab' })
  }
}

/* =========================
   UPDATE LAB (ADMIN)
========================= */
export async function updateLab(
  req: Request,
  res: Response
) {
  try {
    const labId = String(req.params.id)
    const lab = await LabsService.updateLab(labId, req.body)
    res.json(lab)
  } catch (err) {
    console.error('updateLab error:', err)
    res.status(500).json({ error: 'Failed to update lab' })
  }
}

/* =========================
   DELETE LAB (ADMIN)
========================= */
export async function deleteLab(
  req: Request,
  res: Response
) {
  try {
    const labId = String(req.params.id)
    await LabsService.deleteLab(labId)
    res.json({ success: true })
  } catch (err) {
    console.error('deleteLab error:', err)
    res.status(500).json({ error: 'Failed to delete lab' })
  }
}

/* =========================
   GET LABS FOR COURSE (PUBLIC)
========================= */
export async function getLabsForCourse(
  req: Request,
  res: Response
) {
  try {
    const courseId = String(req.params.courseId)

    const { data, error } =
      await CourseLabsService.getLabsForCourse(courseId)

    if (error) {
      console.error('getLabsForCourse error:', error)
      return res.status(500).json({ error: 'Failed to fetch labs' })
    }

    // IMPORTANT: flatten join result
    const labs = (data ?? [])
      .map((row: any) => row.labs)
      .filter(Boolean)

    res.json(labs)
  } catch (err) {
    console.error('getLabsForCourse crashed:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/* =========================
   ASSIGN LABS TO COURSE (ADMIN)
========================= */
export async function updateCourseLabs(
  req: Request,
  res: Response
) {
  try {
    const courseId = String(req.params.courseId)
    const { labIds } = req.body

    if (!Array.isArray(labIds)) {
      return res.status(400).json({
        error: 'labIds must be an array',
      })
    }

    await CourseLabsService.assignLabsToCourse(courseId, labIds)

    res.json({
      success: true,
      message: 'Labs updated',
    })
  } catch (err) {
    console.error('updateCourseLabs error:', err)
    res.status(500).json({ error: 'Failed to update labs' })
  }
}
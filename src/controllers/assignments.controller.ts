import { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import * as AssignmentService from '../services/assignment.service'

export async function getAssignmentByCourse(req: Request, res: Response) {
  const courseIdParam = req.params.courseId
  const courseId = Array.isArray(courseIdParam)
    ? courseIdParam[0]
    : courseIdParam

  if (!courseId) {
    return res.status(400).json({ error: 'courseId is required' })
  }

  const { data, error } = await supabaseAdmin
    .from('assignments')
    .select('*')
    .eq('course_id', courseId)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Assignment not found' })
  }

  res.json(data)
}

export async function submitAssignment(req:Request,res:Response){
    const userId = req.user!.userId

    const assignmentIdParam = req.params.assignmentId
    const assignmentId =
    Array.isArray(assignmentIdParam)
      ? assignmentIdParam[0]
      : assignmentIdParam

  if (!assignmentId) {
    return res.status(400).json({ error: 'assignmentId is required' })
  }

  const file = req.file

  if (!file) {
    return res.status(400).json({ error: 'Assignment file is required' })
  }

  const fileUrl = await AssignmentService.uploadAssignmentFile(
    assignmentId,
    userId,
    file
  )

  const { error } = await supabaseAdmin
    .from('assignment_submissions')
    .insert({
      assignment_id: assignmentId,
      user_id: userId,
      file_url: fileUrl,
    })

  if (error) {
    console.error(error)
    return res
      .status(500)
      .json({ error: 'Assignment already submitted or failed' })
  }

  res.status(201).json({
    message: 'Assignment submitted successfully',
  })
}


export async function deleteAssignment(req: Request, res: Response) {
  const assignmentIdParam = req.params.assignmentId
  const assignmentId = Array.isArray(assignmentIdParam)
    ? assignmentIdParam[0]
    : assignmentIdParam

  if (!assignmentId) {
    return res.status(400).json({ error: 'assignmentId is required' })
  }

  const { error } = await supabaseAdmin
    .from('assignments')
    .delete()
    .eq('id', assignmentId)

  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete assignment' })
  }

  res.json({ message: 'Assignment deleted successfully' })
}
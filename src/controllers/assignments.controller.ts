import { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import * as AssignmentService from '../services/assignment.service'

export async function getAssignmentByCourse(req: Request, res: Response) {
  const courseId = Array.isArray(req.params.courseId)
    ? req.params.courseId[0]
    : req.params.courseId

  if (!courseId) {
    return res.status(400).json({ error: 'courseId is required' })
  }

  const { data, error } = await supabaseAdmin
    .from('assignments')
    .select(`
      id,
      course_id,
      title,
      description,
      max_marks,
      passing_marks
    `)
    .eq('course_id', courseId)
    .single()

  if (error || !data) {
    return res.json(null)
  }

  res.json(data)
}

export async function submitAssignment(req: Request, res: Response) {
  const userId = req.user!.userId

  const assignmentId = Array.isArray(req.params.assignmentId)
    ? req.params.assignmentId[0]
    : req.params.assignmentId

  if (!assignmentId) {
    return res.status(400).json({ error: 'assignmentId is required' })
  }

  const file = req.file
  if (!file) {
    return res.status(400).json({ error: 'Assignment file is required' })
  }

  // 1️⃣ CHECK FIRST (this is what you were missing)
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('assignment_submissions')
    .select('id')
    .eq('assignment_id', assignmentId)
    .eq('user_id', userId)
    .maybeSingle()

  if (checkError) {
    console.error(checkError)
    return res.status(500).json({ error: 'Failed to check submission' })
  }

  if (existing) {
    return res.status(409).json({
      error: 'You have already submitted this assignment',
    })
  }

  // 2️⃣ UPLOAD FILE
  const fileUrl = await AssignmentService.uploadAssignmentFile(
    assignmentId,
    userId,
    file
  )

  // 3️⃣ INSERT SUBMISSION
  const { error: insertError } = await supabaseAdmin
    .from('assignment_submissions')
    .insert({
      assignment_id: assignmentId,
      user_id: userId,
      file_url: fileUrl,
    })

  if (insertError) {
    console.error(insertError)
    return res.status(500).json({ error: 'Failed to submit assignment' })
  }

  res.status(201).json({
    message: 'Assignment submitted successfully',
  })
}
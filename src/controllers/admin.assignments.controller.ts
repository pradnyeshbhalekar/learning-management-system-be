import { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase'

/**
 * CREATE ASSIGNMENT (ADMIN)
 * One assignment per course
 */
export async function createAssignment(req: Request, res: Response) {
  const { course_id, title, description, max_marks, passing_marks } = req.body

  if (!course_id || !title || max_marks == null || passing_marks == null) {
    return res.status(400).json({
      error: 'course_id, title, max_marks and passing_marks are required',
    })
  }

  if (passing_marks > max_marks) {
    return res.status(400).json({
      error: 'passing_marks cannot be greater than max_marks',
    })
  }

  const { data, error } = await supabaseAdmin
    .from('assignments')
    .insert({
      course_id,
      title,
      description,
      max_marks,
      passing_marks,
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    return res.status(500).json({
      error: 'Assignment already exists for this course or insert failed',
    })
  }

  res.status(201).json(data)
}

/**
 * UPDATE ASSIGNMENT (ADMIN)
 */
export async function updateAssignment(req: Request, res: Response) {
  const assignmentId = req.params.assignmentId

  const { title, description, max_marks, passing_marks } = req.body

  if (
    max_marks != null &&
    passing_marks != null &&
    passing_marks > max_marks
  ) {
    return res.status(400).json({
      error: 'passing_marks cannot be greater than max_marks',
    })
  }

  const { data, error } = await supabaseAdmin
    .from('assignments')
    .update({
      ...(title && { title }),
      ...(description && { description }),
      ...(max_marks != null && { max_marks }),
      ...(passing_marks != null && { passing_marks }),
    })
    .eq('id', assignmentId)
    .select()
    .single()

  if (error || !data) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to update assignment' })
  }

  res.json(data)
}

/**
 * DELETE ASSIGNMENT (ADMIN)
 */
export async function deleteAssignment(req: Request, res: Response) {
  const assignmentId = req.params.assignmentId

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

/**
 * GET SUBMISSIONS (ADMIN)
 */
export async function getSubmissionsByAssignment(
  req: Request,
  res: Response
) {
  const assignmentId = req.params.assignmentId

  const { data, error } = await supabaseAdmin
    .from('assignment_submissions')
    .select(`
      id,
      user_id,
      file_url,
      submitted_at,
      marks_awarded,
      status
    `)
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch submissions' })
  }

  res.json(data)
}

/**
 * EVALUATE SUBMISSION (ADMIN)
 */
export async function evaluateSubmission(req: Request, res: Response) {
  const submissionId = req.params.submissionId
  const { marks_awarded } = req.body

  const { data: submission } = await supabaseAdmin
    .from('assignment_submissions')
    .select(`
      id,
      user_id,
      assignments (
        max_marks,
        passing_marks
      )
    `)
    .eq('id', submissionId)
    .single()

  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' })
  }

  if (marks_awarded > submission.assignments[0].max_marks) {
    return res.status(400).json({ error: 'Marks exceed max marks' })
  }

  const status =
    marks_awarded >= submission.assignments[0].passing_marks
      ? 'evaluated'
      : 'rejected'

  await supabaseAdmin
    .from('assignment_submissions')
    .update({
      marks_awarded,
      evaluated_at: new Date().toISOString(),
      status,
    })
    .eq('id', submissionId)

  res.json({ message: 'Submission evaluated', status })
}
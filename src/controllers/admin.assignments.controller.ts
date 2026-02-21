import { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase'

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
    return res.status(500).json({ error: 'Failed to create assignment' })
  }

  res.status(201).json(data)
}

export async function updateAssignment(req: Request, res: Response) {
  const assignmentIdParam = req.params.assignmentId
  const assignmentId = Array.isArray(assignmentIdParam)
    ? assignmentIdParam[0]
    : assignmentIdParam

  if (!assignmentId) {
    return res.status(400).json({ error: 'assignmentId is required' })
  }

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

export async function getSubmissionsByAssignment(
  req: Request,
  res: Response
) {
  const assignmentIdParam = req.params.assignmentId
  const assignmentId = Array.isArray(assignmentIdParam)
    ? assignmentIdParam[0]
    : assignmentIdParam

  if (!assignmentId) {
    return res.status(400).json({ error: 'assignmentId is required' })
  }

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

export async function evaluateSubmission(
  req: Request,
  res: Response
) {
  const submissionIdParam = req.params.submissionId
  const submissionId = Array.isArray(submissionIdParam)
    ? submissionIdParam[0]
    : submissionIdParam

  const { marks_awarded } = req.body

  if (!submissionId || marks_awarded == null) {
    return res.status(400).json({
      error: 'submissionId and marks_awarded are required',
    })
  }

  // fetch assignment to validate marks
  const { data: submission, error: fetchError } = await supabaseAdmin
    .from('assignment_submissions')
    .select(`
      id,
      user_id,
      assignment_id,
      assignments (
        max_marks,
        passing_marks
      )
    `)
    .eq('id', submissionId)
    .single()

  if (fetchError || !submission) {
    return res.status(404).json({ error: 'Submission not found' })
  }

  if (marks_awarded > (submission.assignments as any).max_marks) {
    return res.status(400).json({
      error: 'Marks exceed max marks',
    })
  }

  const status =
    marks_awarded >= (submission.assignments as any).passing_marks
      ? 'evaluated'
      : 'rejected'

  const { error } = await supabaseAdmin
    .from('assignment_submissions')
    .update({
      marks_awarded,
      evaluated_at: new Date().toISOString(),
      status,
    })
    .eq('id', submissionId)

  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to evaluate submission' })
  }

  // Trigger certificate generation if passed
  if (status === 'evaluated') {
    const { generateCertificateInternal } = require('./certificate.controller')
    // We need courseId from submission
    const { data: submissionFull } = await supabaseAdmin
      .from('assignment_submissions')
      .select(`
            assignments (course_id)
        `)
      .eq('id', submissionId)
      .single();

    if (submissionFull && submissionFull.assignments) {
      generateCertificateInternal(submission.user_id, (submissionFull.assignments as any).course_id)
    }
  }

  res.json({
    message: 'Submission evaluated',
    status,
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
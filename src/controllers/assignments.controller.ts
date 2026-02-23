import { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import * as AssignmentService from '../services/assignment.service'


export async function getAssignmentByTopic(req: Request, res: Response) {
  const topicId = Array.isArray(req.params.topicId)
    ? req.params.topicId[0]
    : req.params.topicId

  if (!topicId) {
    return res.status(400).json({ error: 'topicId is required' })
  }

  const { data, error } = await supabaseAdmin
    .from('assignments')
    .select(`
      id,
      topic_id,
      title,
      description,
      max_marks,
      passing_marks
    `)
    .eq('topic_id', topicId)
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
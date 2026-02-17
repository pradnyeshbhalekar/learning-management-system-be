import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '../lib/supabase'
import * as TopicCompletionService from '../services/topics.service'


interface Topic {
  id: string
  title: string
  course_id: string
  order_index: number
  created_at: string
  updated_at: string
}



export async function createTopic(req: Request, res: Response) {
  try {
    const { title, courseId, orderIndex } = req.body

    if (!title || !courseId) {
      return res.status(400).json({ error: 'title and courseId required' })
    }

    const { count } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)

    const { data, error } = await supabase
      .from('topics')
      .insert({
        title,
        course_id: courseId,
        order_index: orderIndex ?? (count ?? 0) + 1,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('createTopic error:', error)
      return res.status(500).json({ error: 'Failed to create topic' })
    }

    res.status(201).json(data)
  } catch (err) {
    console.error('createTopic crashed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getTopicsByCourse(req: Request, res: Response) {
  const { courseId } = req.params

  const { data, error } = await supabase
    .from('topics')
    .select(`
      id,
      title,
      order_index,
      created_at,
      updated_at,
      videos (
        id,
        title,
        video_path
      )
    `)
    .eq('course_id', courseId)
    .order('order_index')

  if (error) {
    console.error('getTopicsByCourse error:', error)
    return res.status(500).json({ error: 'Failed to fetch topics' })
  }

  res.json(data ?? [])
}

// PUT /api/topics/:id
export async function updateTopic(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { title, order_index } = req.body

    if (!title && order_index === undefined) {
      return res.status(400).json({ error: 'Nothing to update' })
    }

    const { data, error } = await supabase
      .from('topics')
      .update({
        ...(title && { title }),
        ...(order_index !== undefined && { order_index }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      console.error('updateTopic error:', error)
      return res.status(500).json({ error: 'Failed to update topic' })
    }

    res.json(data)
  } catch (err) {
    console.error('updateTopic crashed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/topics/:id
export async function deleteTopic(req: Request, res: Response) {
  const { id } = req.params

  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deleteTopic error:', error)
    return res.status(500).json({ error: 'Failed to delete topic' })
  }

  res.json({ success: true })
}

// GET /api/topics/:id
export async function getTopicById(req: Request, res: Response) {
  const { id } = req.params

  const { data, error } = await supabase
    .from('topics')
    .select(`
      id,
      title,
      course_id,
      order_index,
      created_at,
      updated_at,
      videos (
        id,
        title,
        video_path
      ),
      quiz_questions (
        id,
        question_text,
        question_order
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Topic not found' })
  }

  res.json(data)
}



  export async function completeTopic(req: Request, res: Response) {
  const userId = req.user!.userId
  const { topicId } = req.params
  const { course_id, watch_duration_seconds } = req.body

    if (typeof topicId !== 'string') {
    return res.status(400).json({ error: 'Invalid topicId' })
  }

  if (!course_id) {
    return res.status(400).json({ error: 'course_id is required' })
  }

  await TopicCompletionService.completeTopic(
    userId,
    topicId,
    course_id,
    watch_duration_seconds ?? 0
  )

  res.json({ message: 'Topic completed' })
}

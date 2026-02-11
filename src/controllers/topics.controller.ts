import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '../lib/supabase'

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
      console.error(error)
      return res.status(500).json({ error: 'Failed to create topic' })
    }

    res.status(201).json(data)
  } catch (err) {
    console.error('createTopic crashed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// GET /api/topics/course/:courseId
export async function getTopicsByCourse(req: Request, res: Response) {
  const { courseId } = req.params

  const { data, error } = await supabase
    .from('topics')
    .select(`
      id,
      title,
      order_index,
      videos (
        id,
        title,
        video_path
      )
    `)
    .eq('course_id', courseId)
    .order('order_index')

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch topics' })
  }

  res.json(data)
}
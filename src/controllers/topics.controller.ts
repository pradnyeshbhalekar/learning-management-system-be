import { Request, Response } from 'express'
import * as TopicsService from '../services/topics.service'

/**
 * Create a topic under a course
 * Admin only
 */
export async function createTopic(req: Request, res: Response) {
  try {
    const { title, courseId } = req.body

    if (!title || !courseId) {
      return res.status(400).json({
        error: 'title and courseId are required',
      })
    }

    const { data, error } = await TopicsService.createTopic({
      title,
      course_id: courseId,
    })

    if (error || !data) {
      console.error('Create topic error:', error)
      return res.status(500).json({ error: 'Failed to create topic' })
    }

    res.status(201).json(data)
  } catch (err) {
    console.error('createTopic crashed:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
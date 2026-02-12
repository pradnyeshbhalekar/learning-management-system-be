import { Request, Response } from 'express'
import * as CoursesService from '../services/courses.service'
import { supabase } from '../lib/supabase'
import { supabaseAdmin } from '../lib/supabase'


export async function getCourses(_req: Request, res: Response) {
  const courses = await CoursesService.getAllCourses()
  res.json(courses)
}

export async function getCourse(req: Request, res: Response) {
  const course = await CoursesService.getCourseById(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id)
  res.json(course)
}

export async function getCourseDetails(req: Request, res: Response) {
  const courseId = req.params.id


  const { data, error } = await supabaseAdmin
    .from('courses')
    .select(`
      id,
      title,
      description,
      category_id,
      is_published,
      topics (
        id,
        title,
        description,
        order_index,
        videos (
          id,
          video_path
        ),
        quiz_questions!quiz_questions_topic_id_fkey (
          id,
          question_text,
          question_order,
          question_type
        )
      )
    `)
    .eq('id', courseId)
    .maybeSingle()



  if (!data) {
    return res.status(404).json({ error: 'Course not found' })
  }

  res.json(data)
}



export async function deleteCourse(
  req: Request,
  res: Response
) {
  const courseId = String(req.params.id)

  await CoursesService.deleteCourse(courseId)
  res.json({ success: true })
}


export async function createCourse(
  req: Request,
  res: Response
) {
  const userId = req.user!.userId
  const { title, description, category_id } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Title is required' })
  }

  const course = await CoursesService.createCourse({
    title,
    description,
    category_id,
    instructor_id: userId,
  })

  res.status(201).json(course)
}

export async function updateCourse(req: Request, res: Response) {
  try {
    const courseId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    const { title, description, category_id } = req.body

    // 1. Validate input
    if (!title && !description && !category_id) {
      return res.status(400).json({ error: 'Nothing to update' })
    }

    // 2. Perform update (DO NOT trust returned data)
    const { error } = await CoursesService.updateCourse(courseId, {
      ...(title && { title }),
      ...(description && { description }),
      ...(category_id && { category_id }),
    })

    if (error) {
      console.error('Update course error:', error)
      return res.status(500).json({ error: 'Failed to update course' })
    }

    // 3. Fetch fresh course from DB (source of truth)
    const updatedCourse = await CoursesService.getCourseById(courseId)

    if (!updatedCourse) {
      return res.status(404).json({ error: 'Course not found after update' })
    }

    // 4. Return updated course
    return res.json(updatedCourse)

  } catch (err) {
    console.error('updateCourse crashed:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
import { supabase } from '../lib/supabase'
import { supabaseAdmin } from '../lib/supabase'

export async function getAllCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getCourseById(courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (error) throw new Error('Course not found')
  return data
}


export async function getCourseWithTopics(courseId: string) {
  // 1. Course
  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (courseError) {
    throw new Error(courseError.message)
  }

  if (!course) {
    const err: any = new Error('Course not found')
    err.status = 404
    throw err
  }


  const { data: topics, error: topicsError } = await supabaseAdmin
    .from('topics')
    .select('*, quiz_questions(*)')
    .eq('course_id', courseId)
    .order('order_index')

  if (topicsError) {
    console.error('Error fetching topics:', topicsError.message)
  }

  return {
    ...course,
    topics: topics || [],
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('courses')
    .delete()
    .eq('id', courseId)

  if (error) {
    throw new Error(error.message)
  }
}
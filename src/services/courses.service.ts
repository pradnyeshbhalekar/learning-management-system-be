import { supabase } from '../lib/supabase'
import { supabaseAdmin } from '../lib/supabase'


interface UpdateCourseInput {
  title?: string
  description?: string
  category_id?: string
  is_published?: boolean
  updated_by?: string
}

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

export async function createCourse(input: {
  title: string
  description?: string
  category_id?: string | null
  instructor_id: string
}) {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert({
      title: input.title,
      description: input.description,
      category_id: input.category_id ?? null,
      instructor_id: input.instructor_id,
      is_published: true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}


export async function updateCourse(
  courseId: string,
  data: UpdateCourseInput
) {
  const { data: course, error } = await supabase
    .from('courses')
    .update(data)
    .eq('id', courseId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return course
}
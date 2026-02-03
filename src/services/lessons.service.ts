import { supabase } from '../lib/supabase'
import { Lesson } from '../models/lesson.model'
import {
  CreateLessonCompletionDTO,
} from '../models/lessonCompletion.model'


export async function getLessonsByCourse(
  courseId: string
): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index')

  if (error) {
    throw new Error(error.message)
  }

  return data as Lesson[]
}


export async function markLessonComplete(
  payload: CreateLessonCompletionDTO
): Promise<void> {
  const { error } = await supabase
    .from('lesson_completions')
    .insert(payload)

  if (error) {
    throw new Error(error.message)
  }
}

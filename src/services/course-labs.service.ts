import { supabase } from '../lib/supabase'

/**
 * Get labs assigned to a course
 */
export async function getLabsForCourse(courseId: string) {
  return supabase
    .from('course_labs')
    .select(`
      labs (
        id,
        name,
        code
      )
    `)
    .eq('course_id', courseId)
}

/**
 * Assign labs to a course (replace existing)
 */
export async function assignLabsToCourse(
  courseId: string,
  labIds: string[]
) {
  // 1. Remove existing mappings
  const { error: deleteError } = await supabase
    .from('course_labs')
    .delete()
    .eq('course_id', courseId)

  if (deleteError) {
    throw deleteError
  }

  // 2. Insert new mappings
  if (labIds.length === 0) {
    return { data: [] }
  }

  const rows = labIds.map(labId => ({
    course_id: courseId,
    lab_id: labId,
  }))

  const { data, error } = await supabase
    .from('course_labs')
    .insert(rows)

  if (error) {
    throw error
  }

  return { data }
}
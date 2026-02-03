import { supabase, supabaseAdmin } from '../lib/supabase'
import { Lab } from '../models/lab.model'

export async function getLabsForCourse(
  courseId: string
): Promise<Lab[]> {
  const { data, error } = await supabase
    .from('course_labs')
    .select(`
      labs (*)
    `)
    .eq('course_id', courseId)

  if (error) {
    throw new Error(error.message)
  }


  return data.map((row: any) => row.labs)
}


export async function updateCourseLabs(
  courseId: string,
  labIds: string[]
): Promise<void> {
  const { error: deleteError } = await supabaseAdmin
    .from('course_labs')
    .delete()
    .eq('course_id', courseId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  // 2. Insert new mappings
  if (labIds.length > 0) {
    const rows = labIds.map((labId) => ({
      course_id: courseId,
      lab_id: labId,
    }))

    const { error: insertError } = await supabaseAdmin
      .from('course_labs')
      .insert(rows)

    if (insertError) {
      throw new Error(insertError.message)
    }
  }
}
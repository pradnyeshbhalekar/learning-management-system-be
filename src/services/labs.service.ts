import { supabaseAdmin,supabase} from '../lib/supabase'
import { Lab } from '../models/lab.model'

export async function getAllLabs(): Promise<Lab[]> {
  const { data, error } = await supabaseAdmin
    .from('labs')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Lab[]
}

export async function getLabById(id: string): Promise<Lab> {
  const { data, error } = await supabaseAdmin
    .from('labs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Lab
}

export async function createLab(input: {
  name: string
  code: string
  description?: string
}): Promise<Lab> {
  const { data, error } = await supabaseAdmin
    .from('labs')
    .insert({
      name: input.name,
      code: input.code,
      description: input.description ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Lab
}

export async function updateLab(
  id: string,
  payload: Partial<Omit<Lab, 'id' | 'created_at' | 'updated_at'>>
): Promise<Lab> {
  const { data, error } = await supabaseAdmin
    .from('labs')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Lab
}

export async function deleteLab(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('labs')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

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

export async function assignLabsToCourse(
  courseId: string,
  labIds: string[]
) {
  // 1. Delete existing
  await supabase
    .from('course_labs')
    .delete()
    .eq('course_id', courseId)

  // 2. Insert new
  if (labIds.length === 0) return { data: [] }

  const rows = labIds.map(labId => ({
    course_id: courseId,
    lab_id: labId,
  }))

  return supabase
    .from('course_labs')
    .insert(rows)
}
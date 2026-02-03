import { supabase } from '../lib/supabase'
import { CreateEnrollmentDTO, Enrollment } from '../models/enrollment.model'

export async function createEnrollment(
  payload: CreateEnrollmentDTO
): Promise<void> {
  const { error } = await supabase
    .from('enrollments')
    .insert(payload)

  if (error) {
    throw new Error(error.message)
  }
}

export async function getUserEnrollments(
  userId: string
): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }

  return data as Enrollment[]
}

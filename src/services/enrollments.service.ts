import { supabaseAdmin } from '../lib/supabase'
import { Enrollment } from '../models/enrollment.model'

export async function createEnrollment(
  userId: string,
  courseId: string
): Promise<void> {
  // 1. Check duplicate
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  if (existing) {
    throw new Error('Already enrolled')
  }

  // 2. Insert
  const { error: insertError } = await supabaseAdmin
    .from('enrollments')
    .insert({
      user_id: userId,
      course_id: courseId,
    })

  if (insertError) {
    throw new Error(insertError.message)
  }
}

export async function getUserEnrollments(
  userId: string
): Promise<Enrollment[]> {
  const { data, error } = await supabaseAdmin
    .from('enrollments')
    .select('id, course_id, enrolled_at, completed_at')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data as Enrollment[]
}

export async function getEnrollmentCount(userId: string) {
  const { count, error } = await supabaseAdmin
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count ?? 0
}
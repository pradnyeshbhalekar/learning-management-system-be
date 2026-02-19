import { supabaseAdmin } from '../lib/supabase'

export async function isEligibleForCertificate(
  userId: string,
  courseId: string
): Promise<boolean> {
  const { data: enrollment } = await supabaseAdmin
    .from('enrollments')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (!enrollment || !enrollment.completed_at) {
    return false
  }

  const { data: submission } = await supabaseAdmin
    .from('assignment_submissions')
    .select(`
      status,
      marks_awarded,
      assignments (passing_marks)
    `)
    .eq('user_id', userId)
    .eq('assignments.course_id', courseId)
    .single()

  if (
    !submission ||
    submission.status !== 'evaluated' ||
    submission.marks_awarded == null ||
    submission.marks_awarded < submission.assignments.passing_marks
  ) {
    return false
  }

  return true
}
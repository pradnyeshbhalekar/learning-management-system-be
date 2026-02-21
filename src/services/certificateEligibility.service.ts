import { supabaseAdmin } from '../lib/supabase'

export async function isEligibleForCertificate(
  userId: string,
  courseId: string
): Promise<boolean> {
  // 1. Enrollment check (all topics completed)
  const { data: enrollment } = await supabaseAdmin
    .from('enrollments')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (!enrollment || !enrollment.completed_at) {
    return false
  }

  // 2. Assignment check (admin approved and passed)
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
    submission.marks_awarded < (submission.assignments as any).passing_marks
  ) {
    return false
  }

  // 3. Final Exam check (passed final exam)
  const { data: quizScore } = await supabaseAdmin
    .from('quiz_scores')
    .select('passed')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('is_final_exam', true)
    .eq('passed', true)
    .maybeSingle()

  if (!quizScore) {
    return false
  }

  return true
}
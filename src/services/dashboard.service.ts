import { supabaseAdmin } from '../lib/supabase'

export async function getEnrollmentCount(userId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count ?? 0
}

export async function getCompletedTopicCount(userId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('topic_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count ?? 0
}

export async function getCompletedCourseCount(userId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('completed_at', 'is', null)

  if (error) throw error
  return count ?? 0
}

export async function getTotalWatchTime(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('topic_completions')
    .select('watch_duration_seconds')
    .eq('user_id', userId)

  if (error) throw error

  return (
    data?.reduce(
      (sum, row) => sum + (row.watch_duration_seconds ?? 0),
      0
    ) ?? 0
  )
}
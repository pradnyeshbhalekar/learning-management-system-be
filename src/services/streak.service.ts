import { supabaseAdmin } from '../lib/supabase'

export async function getCurrentStreak(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('topic_completions')
    .select('completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) throw error
  if (!data || data.length === 0) return 0

  // Extract unique activity dates (YYYY-MM-DD)
  const activityDates = Array.from(
    new Set(
      data.map(row =>
        new Date(row.completed_at).toISOString().slice(0, 10)
      )
    )
  )

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const dateStr of activityDates) {
    const activityDate = new Date(dateStr)
    activityDate.setHours(0, 0, 0, 0)

    const diffDays =
      (currentDate.getTime() - activityDate.getTime()) /
      (1000 * 60 * 60 * 24)

    if (diffDays === 0 || diffDays === 1) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
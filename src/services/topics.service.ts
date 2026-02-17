import { supabase, supabaseAdmin } from '../lib/supabase'

export async function createTopicService(
  title: string,
  courseId: string,
  orderIndex?: number
) {
  const { count } = await supabase
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)

  const { data, error } = await supabaseAdmin
    .from('topics')
    .insert({
      title,
      course_id: courseId,
      order_index: orderIndex ?? (count ?? 0) + 1,
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error('Failed to create topic')
  }

  return data
}

export async function getTopicsByCourseService(courseId: string) {
  const { data, error } = await supabase
    .from('topics')
    .select(`
      id,
      title,
      order_index,
      created_at,
      updated_at,
      videos (
        id,
        title,
        video_path
      )
    `)
    .eq('course_id', courseId)
    .order('order_index')

  if (error) {
    throw new Error('Failed to fetch topics')
  }

  return data ?? []
}

export async function getTopicByIdService(id: string) {
  const { data, error } = await supabase
    .from('topics')
    .select(`
      id,
      title,
      course_id,
      order_index,
      created_at,
      updated_at,
      videos (
        id,
        title,
        video_path
      ),
      quiz_questions (
        id,
        question_text,
        question_order
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    throw new Error('Topic not found')
  }

  return data
}

export async function updateTopicService(
  id: string,
  updates: { title?: string; order_index?: number }
) {
  const { data, error } = await supabaseAdmin
    .from('topics')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    throw new Error('Failed to update topic')
  }

  return data
}

export async function deleteTopicService(id: string) {
  const { error } = await supabaseAdmin
    .from('topics')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete topic')
  }
}

export async function completeTopic(
  userId: string,
  topicId: string,
  courseId: string,
  watchDurationSeconds = 0
) {
  // 1️⃣ insert topic completion (idempotent)
  const { error: insertError } = await supabaseAdmin
    .from('topic_completions')
    .insert({
      user_id: userId,
      topic_id: topicId,
      course_id: courseId,
      watch_duration_seconds: watchDurationSeconds,
    })

  if (insertError && !insertError.message.includes('duplicate')) {
    throw insertError
  }

  // 2️⃣ count total topics in course
  const { count: totalTopics } = await supabaseAdmin
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)

  // 3️⃣ count completed topics for user in this course
  const { count: completedTopics } = await supabaseAdmin
    .from('topic_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('course_id', courseId)

  // 4️⃣ if all topics done → mark enrollment completed
  if (
    totalTopics &&
    completedTopics &&
    completedTopics >= totalTopics
  ) {
    await supabaseAdmin
      .from('enrollments')
      .update({
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .is('completed_at', null)
  }
}

export async function getCompletedTopicCount(userId: string) {
  const { count, error } = await supabaseAdmin
    .from('topic_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count ?? 0
}
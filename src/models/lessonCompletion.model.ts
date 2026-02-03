export interface LessonCompletion {
  id: string
  user_id: string
  lesson_id: string
  completed_at: string
}

export interface CreateLessonCompletionDTO {
  user_id: string
  lesson_id: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string | null
  video_url: string
  duration: number | null
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

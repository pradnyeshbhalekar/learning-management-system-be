export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
  completedAt: string | null;
}

export interface CreateEnrollmentDTO {
  user_id: string
  course_id: string
}
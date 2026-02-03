export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  videoUrl: string;
  duration: number | null;
  orderIndex: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

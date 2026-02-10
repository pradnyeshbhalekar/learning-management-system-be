// src/models/course.model.ts

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  level: CourseLevel | null;
  instructor_id: string | null;
  thumbnail_url: string | null;
  rating: number | null;
  total_students: number | null;
  created_at: string;
  updated_at: string;
}
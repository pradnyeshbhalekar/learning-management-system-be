import { supabase } from "../lib/supabase";
import { Course } from "../models/course.model";

export async function getAllCourses(
  category?: string
): Promise<Course[]> {
  let query = supabase
    .from("courses")
    .select("*")
    .eq("is_published", true);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    level: row.level,
    instructorId: row.instructor_id,
    thumbnailUrl: row.thumbnail_url,
    rating: row.rating,
    totalStudents: row.total_students,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}
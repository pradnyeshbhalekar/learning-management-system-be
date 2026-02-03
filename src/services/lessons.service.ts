import { supabase } from "../lib/supabase";
import { Lesson } from "../models/lesson.model";

export async function getLessonsByCourse(courseId: string) {
  const { data, error } = await supabase
    .from("labs")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Supabase lessons error:", error);
    throw error;
  }

  return data ?? [];
}

export async function completeLesson(
  userId: string,
  lessonId: string
): Promise<void> {
  const { error } = await supabase
    .from("lesson_completions")
    .insert({
      user_id: userId,
      lesson_id: lessonId
    });

  if (error && error.code !== "23505") {
    // 23505 = unique violation (already completed)
    throw new Error(error.message);
  }
}


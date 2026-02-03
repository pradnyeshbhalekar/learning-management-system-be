import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { supabase } from "../lib/supabase";

export async function markLessonComplete(
  req: AuthRequest,
  res: Response
) {
  try {
    const rawLessonId = req.params.lessonId;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!rawLessonId) {
      return res.status(400).json({ error: "lessonId is required" });
    }

    const lessonId = Array.isArray(rawLessonId)
      ? rawLessonId[0]
      : rawLessonId;

    const { error } = await supabase
      .from("lesson_completions")
      .insert({
        user_id: userId,
        lesson_id: lessonId,
      });

    if (error && error.code !== "23505") {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Lesson completion error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

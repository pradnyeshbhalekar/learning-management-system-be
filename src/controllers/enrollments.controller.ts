import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { supabase } from "../lib/supabase";

export async function enrollInCourse(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;
    const { courseId } = req.body;

    console.log("AUTH USER:", req.user);

    if (!userId || !email) {
      return res.status(401).json({ error: "Invalid auth user" });
    }

    if (!courseId) {
      return res.status(400).json({ error: "courseId is required" });
    }

    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .single();

    if (!course) {
      return res.status(400).json({ error: "Course not found" });
    }

    // ✅ correct user sync
    const { error: userError } = await supabase
      .from("users")
      .upsert(
        { id: userId, email },
        { onConflict: "id" }
      );

    if (userError) {
      console.error("Failed to upsert user:", userError);
      return res.status(400).json({ error: "Failed to create user profile" });
    }

    const { data, error } = await supabase
      .from("enrollments")
      .insert({
        user_id: userId,
        course_id: courseId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.json({ success: true });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error("Enrollment error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

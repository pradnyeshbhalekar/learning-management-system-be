import { Request, Response } from "express";
import { getAllCourses } from "../services/courses.service";

export async function fetchCourses(
  req: Request,
  res: Response
) {
  try {
    const category = req.query.category as string | undefined;

    const courses = await getAllCourses(category);

    res.json(courses);
  } catch (error) {
    console.error("Fetch courses error:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
}

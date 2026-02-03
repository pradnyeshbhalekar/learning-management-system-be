import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { enrollInCourse } from "../controllers/enrollments.controller";

const router = Router();

router.post("/", requireAuth, enrollInCourse);

export default router;

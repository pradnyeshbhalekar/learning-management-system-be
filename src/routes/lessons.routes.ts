import { Router } from "express";
import {

  markLessonComplete
} from "../controllers/lessons.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/:lessonId/complete", requireAuth, markLessonComplete);

export default router;

import { Router } from "express";
import { fetchCourses } from "../controllers/courses.controller";
import { devAuth } from '../middlewares/devAuth.middleware'


const router = Router();

router.get('/', devAuth, fetchCourses)


export default router;

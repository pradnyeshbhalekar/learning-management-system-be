import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import coursesRoutes from "./routes/courses.routes";
import lessonsRoutes from "./routes/lessons.routes";
import enrollmentsRoutes from "./routes/enrollments.routes";
import userQuizRoutes from "./routes/quiz.user.routes";
import adminQuizRoutes from "./routes/quiz.admin.routes";
import devRouter from "./routes/dev.routes"
import labsRoutes from './routes/labs.routes'
import categoriesRoutes from './routes/categories.routes'
import topicsRoutes from './routes/topics.routes'
import dashboardRoutes from './routes/dashboard.routes'
import videoRoutes from './routes/video.routes'
import AssignmentRoutes from './routes/assignments.routes'
import adminAssignmentsRoutes from './routes/admin.assignments.routes'
import certificateRoutes from './routes/certificate.routes'




const app = express();


app.use(cors({
  origin: ["http://localhost:3000", "https://lms-849i90cjg-siddhantas-techs-projects.vercel.app", "https://lmsss-git-main-siddhantas-techs-projects.vercel.app"],
  credentials: true
}));

app.use(express.json());
app.use('/certificates', express.static('public/certificates'));


app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});



app.use('/api/auth', authRoutes)
app.use("/api/courses", coursesRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use('/api/labs', labsRoutes)
app.use("/api/dev", devRouter)
app.use('/api/categories', categoriesRoutes)
app.use('/api/quiz', userQuizRoutes)
app.use('/api/admin/quiz', adminQuizRoutes)
app.use('/api/video', videoRoutes)
app.use('/api/topics', topicsRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/assignments', AssignmentRoutes)
app.use('/api/admin/assignments', adminAssignmentsRoutes)
app.use('/api/certificates', certificateRoutes)

export default app;

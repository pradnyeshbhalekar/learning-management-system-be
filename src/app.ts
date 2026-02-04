import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import coursesRoutes from "./routes/courses.routes";
import lessonsRoutes from "./routes/lessons.routes";
import enrollmentsRoutes from "./routes/enrollments.routes";
import userQuizRoutes from "./routes/quiz.user.routes";
import  adminQuizRoutes from "./routes/quiz.admin.routes";
import devRouter from "./routes/dev.routes"
import labsRoutes from './routes/labs.routes'
import categoriesRoutes from './routes/categories.routes'





const app = express();


app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());


app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});



app.use('/api/auth', authRoutes)
app.use("/api/courses", coursesRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/enrollments", enrollmentsRoutes);

app.use('/api/labs', labsRoutes)
app.use("/",devRouter)
app.use('/api/categories', categoriesRoutes)
app.use('/api/quiz', userQuizRoutes)
app.use('/api/admin/quiz', adminQuizRoutes)



export default app;

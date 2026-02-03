export interface QuizScore {
  id: string;
  userId: string;
  lessonId: string | null;
  isFinalExam: boolean;
  score: number;
  passed: boolean;
  attemptedAt: string;
  timeTakenSeconds: number | null;
}

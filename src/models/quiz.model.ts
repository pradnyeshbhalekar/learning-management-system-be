export interface QuizQuestion {
  id: string;
  lessonId: string | null;
  isFinalExam: boolean;
  questionText: string;
  correctAnswerIndex: number;
  questionOrder: number;
}

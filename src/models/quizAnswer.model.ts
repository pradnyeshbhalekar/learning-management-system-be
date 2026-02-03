export interface QuizAnswer {
  id: string;
  scoreId: string;
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  answeredAt: string;
}

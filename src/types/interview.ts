import type { Question } from './question';

export interface Answer {
  questionId: number;
  questionText: string;
  userAnswer: string;
  timeSpentSeconds: number;
  hintUsed: boolean;
}

export interface InterviewSession {
  role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Technical' | 'Behavioral';
  questions: Question[];
  answers: Answer[];
  activeQuestionIndex: number;
  timerSeconds: number;
  isCompleted: boolean;
}

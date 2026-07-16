import type { Question } from './question';

export interface Answer {
  questionId: string;
  questionText: string;
  userAnswer: string;
  timeSpentSeconds: number;
  hintUsed: boolean;
  visited: boolean;
  lastEdited: string; // ISO date string
}

export interface InterviewSession {
  role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Technical' | 'Behavioral';
  questions: Question[];
  answers: Record<string, Answer>; // Keyed by questionId
  activeQuestionIndex: number;
  timerSeconds: number;
  isCompleted: boolean;
}

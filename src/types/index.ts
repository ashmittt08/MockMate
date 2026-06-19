export interface Question {
  id: number;
  text: string;
  role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Technical' | 'Behavioral';
  category: string;
  modelAnswer: string;
  tips: string[];
}

export interface User {
  name: string;
  email: string;
  targetRole: string;
  bio: string;
  joinedDate: string;
  interviewsCompleted: number;
}

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

export interface FeedbackReport {
  id: string;
  role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Technical' | 'Behavioral';
  date: string;
  overallScore: number;
  accuracyScore: number;
  communicationScore: number;
  completenessScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: {
    questionId: number;
    questionText: string;
    userAnswer: string;
    modelAnswer: string;
    feedbackText: string;
    score: number;
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

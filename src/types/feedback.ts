export interface FeedbackSuggestion {
  questionId: number;
  questionText: string;
  userAnswer: string;
  modelAnswer: string;
  feedbackText: string;
  score: number;
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
  suggestions: FeedbackSuggestion[];
}

import type { Question } from '../types';
import { mockQuestions } from '../data/questions';

export const questionService = {
  getQuestions: async (): Promise<Question[]> => {
    return Promise.resolve(mockQuestions);
  },

  getQuestionsForSession: async (
    role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
    difficulty: 'Easy' | 'Medium' | 'Hard',
    type: 'Technical' | 'Behavioral'
  ): Promise<Question[]> => {
    // Filter questions matching criteria
    let filtered = mockQuestions.filter(
      (q) => q.role === role && q.difficulty === difficulty && q.type === type
    );

    // If no exact match, relax difficulty constraint first
    if (filtered.length === 0) {
      filtered = mockQuestions.filter((q) => q.role === role && q.type === type);
    }

    // If still empty, relax role constraint (use default questions)
    if (filtered.length === 0) {
      filtered = mockQuestions.filter((q) => q.type === type);
    }

    // Take up to 3 questions
    return Promise.resolve(filtered.slice(0, 3));
  }
};

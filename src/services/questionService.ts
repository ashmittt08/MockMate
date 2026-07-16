import type { Question } from '../types';
import { interviewTemplateService } from './interviewTemplateService';

export const questionService = {
  /**
   * Fetches all questions from the first available template as a fallback.
   */
  async getQuestions(): Promise<Question[]> {
    try {
      const templates = await interviewTemplateService.getInterviewTemplates();
      if (templates.length === 0) return [];
      return await interviewTemplateService.getInterviewQuestions(templates[0].id);
    } catch (error) {
      console.error('Failed to get questions from backend:', error);
      return [];
    }
  },

  /**
   * Fetches questions for a session based on the selected track and difficulty from the backend templates.
   */
  async getQuestionsForSession(
    role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
    difficulty: 'Easy' | 'Medium' | 'Hard',
    type: 'Technical' | 'Behavioral'
  ): Promise<Question[]> {
    try {
      const templates = await interviewTemplateService.getInterviewTemplates();
      if (templates.length === 0) {
        throw new Error("No interview templates found in the database.");
      }

      // Try to find a template that matches the selected role and difficulty
      let matchedTemplate = templates.find((t) => {
        const titleLower = t.title.toLowerCase();
        const roleLower = role.toLowerCase();
        const diffLower = difficulty.toLowerCase();

        return titleLower.includes(roleLower) && titleLower.includes(diffLower);
      });

      // If not found, try to match by role only
      if (!matchedTemplate) {
        matchedTemplate = templates.find((t) => t.title.toLowerCase().includes(role.toLowerCase()));
      }

      // If still not found, check if type is behavioral and load HR template
      if (!matchedTemplate && type === 'Behavioral') {
        matchedTemplate = templates.find((t) => t.title.toLowerCase().includes('hr'));
      }

      // Fallback to the first template if still no match
      if (!matchedTemplate) {
        matchedTemplate = templates[0];
      }

      const allQuestions = await interviewTemplateService.getInterviewQuestions(matchedTemplate.id);
      
      // Return up to 3 questions for the session (maintains consistent session size)
      return allQuestions.slice(0, 3);
    } catch (error) {
      console.error('Failed to get session questions from backend:', error);
      throw error;
    }
  }
};

export const promptBuilder = {
  /**
   * Constructs the structured evaluation prompt string for the LLM evaluation.
   */
  buildEvaluationPrompt(role: string, difficulty: string, type: string, questionsAndAnswers: any[]): string {
    return `Evaluate this mock interview session for a ${difficulty} level ${role} role (focus: ${type}).
    Here are the questions, expected answers, and candidate's answers:
    ${questionsAndAnswers.map((qa, index) => `
    Question ${index + 1}: ${qa.question}
    Expected Answer: ${qa.expectedAnswer}
    Candidate Answer: ${qa.userAnswer}
    `).join('\n')}
    
    Provide scoring and constructive feedback in JSON format.`;
  }
};

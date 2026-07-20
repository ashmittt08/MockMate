import { EvaluationRequest } from './providers/aiProvider.interface';

export const promptBuilder = {
  /**
   * Constructs the structured evaluation prompt string for the LLM evaluation.
   * Can accept either an EvaluationRequest object or legacy individual parameters.
   */
  buildEvaluationPrompt(
    requestOrRole: EvaluationRequest | string,
    difficulty?: string,
    type?: string,
    questionsAndAnswers?: any[]
  ): string {
    let roleStr = '';
    let difficultyStr = '';
    let titleStr = '';
    let qaList: Array<{
      questionId: string;
      question: string;
      expectedAnswer: string;
      userAnswer: string;
      status: string;
      hintUsed: boolean;
      timeSpentSeconds: number;
    }> = [];

    if (typeof requestOrRole === 'object' && requestOrRole.session) {
      const session = requestOrRole.session;
      roleStr = session.interviewTemplate?.role || 'Software Engineer';
      difficultyStr = session.interviewTemplate?.difficulty || 'Medium';
      titleStr = session.interviewTemplate?.title || 'Technical Interview';
      
      qaList = (session.answers || []).map((ans) => ({
        questionId: ans.questionId,
        question: ans.question?.question || 'Interview Question',
        expectedAnswer: ans.question?.expectedAnswer || 'N/A',
        userAnswer: ans.userAnswer || (ans.status === 'SKIPPED' ? 'SKIPPED' : ''),
        status: ans.status || 'ANSWERED',
        hintUsed: !!ans.hintUsed,
        timeSpentSeconds: ans.timeSpentSeconds || 0
      }));
    } else {
      roleStr = requestOrRole as string;
      difficultyStr = difficulty || 'Medium';
      titleStr = type || 'Technical Interview';
      qaList = (questionsAndAnswers || []).map((qa, index) => ({
        questionId: qa.questionId || `q_${index + 1}`,
        question: qa.question || '',
        expectedAnswer: qa.expectedAnswer || 'N/A',
        userAnswer: qa.userAnswer || '',
        status: qa.userAnswer?.toLowerCase().includes('skipped') ? 'SKIPPED' : 'ANSWERED',
        hintUsed: !!qa.hintUsed,
        timeSpentSeconds: qa.timeSpentSeconds || 0
      }));
    }

    return `You are an expert technical interviewer evaluating a candidate's performance in a mock interview on MockMate.

### Interview Context:
- Target Role: ${roleStr}
- Difficulty Level: ${difficultyStr}
- Category / Title: ${titleStr}

### Candidate Question & Response Breakdown:
${qaList.map((qa, idx) => `
--- Question ${idx + 1} ---
Question ID: ${qa.questionId}
Question: ${qa.question}
Expected Model Solution: ${qa.expectedAnswer}
Candidate Response: ${qa.userAnswer}
Status: ${qa.status}
Hint Used: ${qa.hintUsed ? 'Yes' : 'No'}
Time Spent: ${qa.timeSpentSeconds} seconds
`).join('\n')}

### Scoring & Feedback Rubric:
Evaluate the candidate thoroughly according to the following dimensions (all scores are 0-100 integers):
1. **accuracyScore**: Evaluates technical correctness, precision, keyword matching, and accuracy relative to expected model solutions.
2. **communicationScore**: Evaluates articulation, structure, clarity, and effective use of structured frameworks (e.g., STAR method for behavioral prompts, system architecture principles for technical prompts).
3. **completenessScore**: Evaluates depth, edge case handling, and thoroughness of answers given time spent. Penalty applies if questions were skipped or required hints.
4. **overallScore**: Holistic weighted score combining accuracy, communication, and completeness.
5. **strengths**: Array of 2 to 4 concise bullet points highlighting key candidate strengths.
6. **weaknesses**: Array of 2 to 4 concise bullet points highlighting specific areas needing improvement.
7. **suggestions**: Array containing an evaluation object for EVERY question provided in the input:
   - "questionId": Must strictly match the exact input Question ID.
   - "questionText": The text of the question.
   - "userAnswer": The candidate's response.
   - "modelAnswer": Ideal, high-quality reference solution / model answer blueprint.
   - "feedbackText": Clear, constructive coaching feedback explaining what was good and how to improve.
   - "score": Question-specific score (0 to 100).

### Output Requirements:
You MUST return ONLY a single valid JSON object. Do not include markdown code block syntax (like \`\`\`json) or additional text outside the JSON.

Expected JSON Format:
{
  "overallScore": 85,
  "accuracyScore": 80,
  "communicationScore": 90,
  "completenessScore": 85,
  "strengths": [
    "Clear explanation of core technical concepts.",
    "Good problem decomposition."
  ],
  "weaknesses": [
    "Did not cover edge cases in detail.",
    "Relied on a hint for question 2."
  ],
  "suggestions": [
    {
      "questionId": "...",
      "questionText": "...",
      "userAnswer": "...",
      "modelAnswer": "...",
      "feedbackText": "...",
      "score": 85
    }
  ]
}`;
  }
};

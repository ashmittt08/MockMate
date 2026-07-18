import { IAIProvider, EvaluationRequest, EvaluationResponse } from './aiProvider.interface';

export class MockAIProvider implements IAIProvider {
  async evaluateSession(request: EvaluationRequest): Promise<EvaluationResponse> {
    const { session } = request;
    const answers = session.answers || [];
    
    let accumulatedScore = 0;
    let accuracyTotal = 0;
    let communicationTotal = 0;
    let completenessTotal = 0;

    const suggestions = answers.map((ans) => {
      const questionText = ans.question?.question || 'Interview Question';
      const modelAnswer = ans.question?.expectedAnswer || '';
      const userAnswer = ans.userAnswer || '';
      const answerLength = userAnswer.trim().length;

      let score = 70;
      let feedback = '';

      if (userAnswer.toLowerCase().includes('skipped') || userAnswer.trim() === '') {
        score = 0;
        feedback = 'This question was skipped. Preparing structured frameworks is key to building candidate profile scores.';
      } else if (answerLength < 30) {
        score = 45;
        feedback = 'Your response was too brief. Try elaborating with concrete operational details, technical components, or the STAR framework (Situation, Task, Action, Result) for behavioral prompts.';
      } else {
        score = 70 + Math.min(Math.floor(answerLength / 40), 20); // Length bonus
        if (ans.hintUsed) score -= 8;
        if (ans.timeSpentSeconds > 180) score -= 3;

        // Simulating keyword matches
        const keywordMatches = modelAnswer
          ? modelAnswer.split(' ').filter(word => 
              word.length > 5 && userAnswer.toLowerCase().includes(word.toLowerCase().replace(/[^a-zA-Z]/g, ''))
            ).length
          : 0;

        if (keywordMatches > 3) {
          score += 5;
        }

        score = Math.min(score, 98);

        if (score >= 88) {
          feedback = `Excellent articulation! You matched critical concepts from the model solution, notably highlighting the core criteria. Your breakdown is structured and technically sound.`;
        } else if (score >= 75) {
          feedback = `Solid answer covering the core concepts. To push this to a senior level, include more practical examples from your past projects, and mention how you'd manage scaling constraints.`;
        } else {
          feedback = `Reasonable baseline answer, but it lacks depth in technical details. Make sure you cover the actual inner mechanics. Review the model answer and focus on explaining the "why" and "how".`;
        }
      }

      accumulatedScore += score;
      
      const acc = Math.max(25, score + (ans.hintUsed ? -10 : Math.floor(Math.random() * 6) - 3));
      const comm = Math.max(30, score + (answerLength < 100 ? -8 : Math.floor(Math.random() * 8) - 4));
      const comp = Math.max(20, Math.min(99, Math.floor(answerLength / 6) + (ans.hintUsed ? 5 : 0)));
      
      accuracyTotal += acc;
      communicationTotal += comm;
      completenessTotal += Math.min(comp, 95);

      return {
        questionId: ans.questionId,
        questionText,
        userAnswer,
        modelAnswer,
        feedbackText: feedback,
        score
      };
    });

    const totalQuestions = answers.length || 1;
    const overallScore = Math.round(accumulatedScore / totalQuestions);
    const accuracyScore = Math.round(accuracyTotal / totalQuestions);
    const communicationScore = Math.round(communicationTotal / totalQuestions);
    const completenessScore = Math.round(completenessTotal / totalQuestions);

    const strengths = [
      'Structured response breakdown.',
      'Clear concept mapping and terminology usage.'
    ];
    const weaknesses = [
      'Elaboration on edge cases and failure modes could be improved.',
      'Avoid dependency on hints for higher accuracy scores.'
    ];

    return {
      overallScore,
      accuracyScore,
      communicationScore,
      completenessScore,
      strengths,
      weaknesses,
      suggestions
    };
  }
}

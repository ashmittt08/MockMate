import type { FeedbackReport, InterviewSession, FeedbackSuggestion } from '../types';
import { ROLE_STRENGTHS, ROLE_WEAKNESSES } from '../data/mockFeedback';

export const feedbackService = {
  generateFeedbackReport: async (
    session: InterviewSession
  ): Promise<FeedbackReport> => {
    return new Promise((resolve) => {
      // Simulate AI analysis delay
      setTimeout(() => {
        const newReportId = `report_${Date.now()}`;
        const totalQuestions = session.questions.length;
        
        let accumulatedScore = 0;
        let accuracyTotal = 0;
        let communicationTotal = 0;
        let completenessTotal = 0;

        const suggestions: FeedbackSuggestion[] = session.questions.map((q, idx) => {
          const ans = session.answers[idx] || { userAnswer: '', timeSpentSeconds: 60, hintUsed: false };
          const answerLength = ans.userAnswer.trim().length;

          let score: number;
          let feedback: string;

          if (ans.userAnswer.includes('skipped') || ans.userAnswer.includes('skipped by candidate')) {
            score = 0;
            feedback = 'This question was skipped. Preparing structured frameworks is key to building candidate profile scores.';
          } else if (answerLength < 30) {
            score = 45;
            feedback = 'Your response was too brief. Try elaborating with concrete operational details, technical components, or the STAR framework (Situation, Task, Action, Result) for behavioral prompts.';
          } else {
            // High-fidelity content-based evaluation simulation
            score = 70 + Math.min(Math.floor(answerLength / 40), 20); // Length bonus
            if (ans.hintUsed) score -= 8; // Deduct for hints
            if (ans.timeSpentSeconds > 180) score -= 3; // Slight penalty for taking > 3 mins

            const keywordMatches = q.modelAnswer.split(' ').filter(word => 
              word.length > 5 && ans.userAnswer.toLowerCase().includes(word.toLowerCase().replace(/[^a-zA-Z]/g, ''))
            ).length;

            if (keywordMatches > 3) {
              score += 5;
            }

            score = Math.min(score, 98); // Cap score

            if (score >= 88) {
              feedback = `Excellent articulation! You matched critical concepts from the model solution, notably highlighting "${q.category}". Your breakdown is structured and technically sound.`;
            } else if (score >= 75) {
              feedback = `Solid answer covering the core concepts of ${q.category}. To push this to a senior level, include more practical examples from your past projects, and mention how you'd manage scaling constraints.`;
            } else {
              feedback = `Reasonable baseline answer, but it lacks depth in technical details. Make sure you cover the actual inner mechanics. Review the model answer and focus on explaining the "why" and "how".`;
            }
          }

          accumulatedScore += score;
          
          // Calculate split values
          const acc = Math.max(25, score + (ans.hintUsed ? -10 : Math.floor(Math.random() * 6) - 3));
          const comm = Math.max(30, score + (answerLength < 100 ? -8 : Math.floor(Math.random() * 8) - 4));
          const comp = Math.max(20, Math.min(99, Math.floor(answerLength / 6) + (ans.hintUsed ? 5 : 0)));
          
          accuracyTotal += acc;
          communicationTotal += comm;
          completenessTotal += Math.min(comp, 95);

          return {
            questionId: q.id,
            questionText: q.text,
            userAnswer: ans.userAnswer,
            modelAnswer: q.modelAnswer,
            feedbackText: feedback,
            score
          };
        });

        const overallScore = Math.round(accumulatedScore / totalQuestions);
        const accuracyScore = Math.round(accuracyTotal / totalQuestions);
        const communicationScore = Math.round(communicationTotal / totalQuestions);
        const completenessScore = Math.round(completenessTotal / totalQuestions);

        // Contextual strengths & weaknesses based on role/scores
        const strengths: string[] = [];
        const weaknesses: string[] = [];

        const roleStrengths = ROLE_STRENGTHS[session.role] || [];
        const roleWeaknesses = ROLE_WEAKNESSES[session.role] || [];

        strengths.push(...roleStrengths);
        if (overallScore > 80 && session.role === 'Frontend') {
          strengths.push('Excellent ability to link functional state hooks with real DOM synchronization.');
        }
        
        weaknesses.push(...roleWeaknesses);

        const newReport: FeedbackReport = {
          id: newReportId,
          role: session.role,
          difficulty: session.difficulty,
          type: session.type,
          date: new Date().toISOString().split('T')[0],
          overallScore,
          accuracyScore,
          communicationScore,
          completenessScore,
          strengths,
          weaknesses,
          suggestions
        };

        resolve(newReport);
      }, 800);
    });
  }
};

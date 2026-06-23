import type { InterviewSession, Answer } from '../types';
import { questionService } from './questionService';

export const interviewService = {
  createSession: async (
    role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
    difficulty: 'Easy' | 'Medium' | 'Hard',
    type: 'Technical' | 'Behavioral'
  ): Promise<InterviewSession> => {
    const questions = await questionService.getQuestionsForSession(role, difficulty, type);
    return {
      role,
      difficulty,
      type,
      questions,
      answers: [],
      activeQuestionIndex: 0,
      timerSeconds: 0,
      isCompleted: false
    };
  },

  submitAnswer: (
    session: InterviewSession,
    answerText: string,
    timeSpentSeconds: number,
    hintUsed: boolean
  ): InterviewSession => {
    const currentQuestion = session.questions[session.activeQuestionIndex];
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      userAnswer: answerText,
      timeSpentSeconds,
      hintUsed
    };

    const updatedAnswers = [...session.answers, newAnswer];
    const nextIndex = session.activeQuestionIndex + 1;
    const isCompleted = nextIndex >= session.questions.length;

    return {
      ...session,
      answers: updatedAnswers,
      activeQuestionIndex: nextIndex,
      isCompleted
    };
  },

  skipQuestion: (session: InterviewSession): InterviewSession => {
    return interviewService.submitAnswer(session, 'Question skipped by candidate.', 10, false);
  }
};

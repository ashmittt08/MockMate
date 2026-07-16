import type { InterviewSession, Answer } from '../types';
import { questionService } from './questionService';

export const interviewService = {
  createSession: async (
    role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
    difficulty: 'Easy' | 'Medium' | 'Hard',
    type: 'Technical' | 'Behavioral'
  ): Promise<InterviewSession> => {
    const questions = await questionService.getQuestionsForSession(role, difficulty, type);
    const answers: Record<string, Answer> = {};
    
    questions.forEach((q) => {
      answers[q.id] = {
        questionId: q.id,
        questionText: q.text,
        userAnswer: '',
        timeSpentSeconds: 0,
        hintUsed: false,
        visited: false,
        lastEdited: new Date().toISOString()
      };
    });

    if (questions.length > 0) {
      answers[questions[0].id].visited = true;
    }

    return {
      role,
      difficulty,
      type,
      questions,
      answers,
      activeQuestionIndex: 0,
      timerSeconds: 0,
      isCompleted: false
    };
  },

  saveAnswer: (
    session: InterviewSession,
    questionId: string,
    answerText: string,
    timeSpentSeconds: number,
    hintUsed: boolean
  ): InterviewSession => {
    const currentQuestion = session.questions.find(q => q.id === questionId);
    if (!currentQuestion) return session;

    const previousAnswer = session.answers[questionId];

    const updatedAnswer: Answer = {
      questionId,
      questionText: currentQuestion.text,
      userAnswer: answerText,
      timeSpentSeconds,
      hintUsed: hintUsed || (previousAnswer ? previousAnswer.hintUsed : false),
      visited: true,
      lastEdited: new Date().toISOString()
    };

    return {
      ...session,
      answers: {
        ...session.answers,
        [questionId]: updatedAnswer
      }
    };
  },

  skipQuestion: (
    session: InterviewSession,
    questionId: string,
    timeSpentSeconds: number
  ): InterviewSession => {
    const currentQuestion = session.questions.find(q => q.id === questionId);
    if (!currentQuestion) return session;

    const updatedAnswer: Answer = {
      questionId,
      questionText: currentQuestion.text,
      userAnswer: 'Question skipped by candidate.',
      timeSpentSeconds,
      hintUsed: false,
      visited: true,
      lastEdited: new Date().toISOString()
    };

    return {
      ...session,
      answers: {
        ...session.answers,
        [questionId]: updatedAnswer
      }
    };
  }
};

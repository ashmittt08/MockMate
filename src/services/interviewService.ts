import type { InterviewSession, Answer } from '../types';
import { questionService } from './questionService';
import apiClient from '../api/apiClient';

export const interviewService = {
  createSession: async (
    role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
    difficulty: 'Easy' | 'Medium' | 'Hard',
    type: 'Technical' | 'Behavioral'
  ): Promise<InterviewSession> => {
    const { questions, templateId } = await questionService.getQuestionsForSession(role, difficulty, type);
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
      templateId,
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
  },

  // Backend API persistent session integrations
  async createBackendSession(
    firebaseUid: string,
    templateId: string
  ): Promise<{ id: string; startedAt: string; interviewTemplate?: { duration: number } }> {
    const response = await apiClient.post<{ success: boolean; data: any }>('/api/interview-sessions', {
      firebaseUid,
      templateId,
    });
    return response.data.data;
  },

  async saveBackendAnswer(
    sessionId: string,
    data: {
      questionId: string;
      userAnswer: string;
      status: 'ANSWERED' | 'SKIPPED';
      timeSpentSeconds: number;
      hintUsed: boolean;
      visited: boolean;
    }
  ): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      `/api/interview-sessions/${sessionId}/answers`,
      data
    );
    return response.data;
  },

  async completeBackendSession(sessionId: string, totalTime: number): Promise<any> {
    const response = await apiClient.patch<{ success: boolean; data: any }>(
      `/api/interview-sessions/${sessionId}/complete`,
      { totalTime }
    );
    return response.data;
  },

  async getBackendSession(sessionId: string): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/api/interview-sessions/${sessionId}`
    );
    return response.data.data;
  },

  async getActiveSession(firebaseUid: string): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      '/api/interview-sessions/active',
      { params: { firebaseUid } }
    );
    return response.data.data;
  },

  async abandonSession(sessionId: string): Promise<any> {
    const response = await apiClient.patch<{ success: boolean; data: any }>(
      `/api/interview-sessions/${sessionId}/abandon`
    );
    return response.data;
  },

  async getBackendEvaluation(sessionId: string): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/api/interview-sessions/${sessionId}/evaluation`
    );
    return response.data.data;
  }
};

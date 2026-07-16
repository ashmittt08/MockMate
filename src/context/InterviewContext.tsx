import React, { createContext, useContext, useState, useEffect } from 'react';
import type { InterviewSession, Answer } from '../types';
import { interviewService } from '../services/interviewService';
import { feedbackService } from '../services/feedbackService';
import { useApp } from './AppContext';
import { interviewTemplateService } from '../services/interviewTemplateService';

interface InterviewContextType {
  currentSession: InterviewSession | null;
  activeQuestionIndex: number;
  currentQuestionTimeSpent: number;
  progressPercent: number;
  isLoading: boolean;
  startSession: (
    role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
    difficulty: 'Easy' | 'Medium' | 'Hard',
    type: 'Technical' | 'Behavioral'
  ) => Promise<void>;
  startSessionFromTemplate: (templateId: string) => Promise<void>;
  saveAnswer: (questionId: string, answerText: string, hintUsed: boolean) => void;
  updateDraftAnswer: (questionId: string, answerText: string) => void;
  skipQuestion: (questionId: string) => void;
  goToQuestion: (index: number, currentAnswerText: string, hintUsed: boolean) => void;
  nextQuestion: (currentAnswerText: string, hintUsed: boolean) => void;
  prevQuestion: (currentAnswerText: string, hintUsed: boolean) => void;
  completeSession: (finalAnswerText: string, finalHintUsed: boolean) => Promise<string>;
  resetSession: () => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addFeedbackReport } = useApp();

  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(() => {
    const stored = localStorage.getItem('mockmate_current_session');
    return stored ? JSON.parse(stored) : null;
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [currentQuestionTimeSpent, setCurrentQuestionTimeSpent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Keep activeQuestionIndex and timer in sync with currentSession.activeQuestionIndex
  useEffect(() => {
    if (currentSession) {
      setActiveQuestionIndex(currentSession.activeQuestionIndex);
      const activeQuestion = currentSession.questions[currentSession.activeQuestionIndex];
      if (activeQuestion) {
        const savedAnswer = currentSession.answers[activeQuestion.id];
        setCurrentQuestionTimeSpent(savedAnswer?.timeSpentSeconds || 0);
      }
    }
  }, [currentSession?.activeQuestionIndex]);

  // Sync session to localStorage on change
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('mockmate_current_session', JSON.stringify(currentSession));
    } else {
      localStorage.removeItem('mockmate_current_session');
    }
  }, [currentSession]);

  // Stopwatch timer logic inside the provider
  useEffect(() => {
    if (!currentSession || currentSession.isCompleted) return;

    const interval = setInterval(() => {
      setCurrentQuestionTimeSpent((prev) => prev + 1);
      setCurrentSession((prevSession) => {
        if (!prevSession) return null;
        
        const updatedTimerSeconds = prevSession.timerSeconds + 1;
        const activeQuestion = prevSession.questions[prevSession.activeQuestionIndex];
        if (!activeQuestion) return prevSession;
        
        const existingAns = prevSession.answers[activeQuestion.id];
        const updatedAns: Answer = existingAns ? {
          ...existingAns,
          timeSpentSeconds: existingAns.timeSpentSeconds + 1
        } : {
          questionId: activeQuestion.id,
          questionText: activeQuestion.text,
          userAnswer: '',
          timeSpentSeconds: 1,
          hintUsed: false,
          visited: true,
          lastEdited: new Date().toISOString()
        };

        return {
          ...prevSession,
          timerSeconds: updatedTimerSeconds,
          answers: {
            ...prevSession.answers,
            [activeQuestion.id]: updatedAns
          }
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession === null, currentSession?.activeQuestionIndex, currentSession?.isCompleted]);

  const startSession = async (
    role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
    difficulty: 'Easy' | 'Medium' | 'Hard',
    type: 'Technical' | 'Behavioral'
  ) => {
    setIsLoading(true);
    try {
      const session = await interviewService.createSession(role, difficulty, type);
      setCurrentSession(session);
      setActiveQuestionIndex(0);
      setCurrentQuestionTimeSpent(0);
    } finally {
      setIsLoading(false);
    }
  };

  const startSessionFromTemplate = async (templateId: string) => {
    setIsLoading(true);
    try {
      const template = await interviewTemplateService.getInterviewTemplate(templateId);
      const questions = await interviewTemplateService.getInterviewQuestions(templateId);
      
      const sessionType = (template.title.toLowerCase().includes('hr') || questions.some(q => q.type.toLowerCase().includes('behavioral'))) ? 'Behavioral' : 'Technical';
      
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

      const session: InterviewSession = {
        role: template.role as 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
        difficulty: template.difficulty as 'Easy' | 'Medium' | 'Hard',
        type: sessionType as 'Technical' | 'Behavioral',
        questions,
        answers,
        activeQuestionIndex: 0,
        timerSeconds: 0,
        isCompleted: false
      };
      
      setCurrentSession(session);
      setActiveQuestionIndex(0);
      setCurrentQuestionTimeSpent(0);
    } catch (error) {
      console.error('Failed to start session from template:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnswer = (questionId: string, answerText: string, hintUsed: boolean) => {
    setCurrentSession((prev) => {
      if (!prev) return null;
      return interviewService.saveAnswer(prev, questionId, answerText, currentQuestionTimeSpent, hintUsed);
    });
  };

  const updateDraftAnswer = (questionId: string, answerText: string) => {
    setCurrentSession((prev) => {
      if (!prev) return null;
      const ans = prev.answers[questionId];
      if (!ans) return prev;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: {
            ...ans,
            userAnswer: answerText,
            lastEdited: new Date().toISOString()
          }
        }
      };
    });
  };

  const skipQuestion = (questionId: string) => {
    setCurrentSession((prev) => {
      if (!prev) return null;
      const updated = interviewService.skipQuestion(prev, questionId, currentQuestionTimeSpent);
      
      const currentIndex = prev.activeQuestionIndex;
      const nextIndex = currentIndex + 1;
      
      if (prev.questions[currentIndex]?.id === questionId && nextIndex < prev.questions.length) {
        const targetQuestion = updated.questions[nextIndex];
        if (targetQuestion) {
          const targetAns = updated.answers[targetQuestion.id];
          updated.answers[targetQuestion.id] = {
            ...targetAns,
            visited: true
          };
        }
        return {
          ...updated,
          activeQuestionIndex: nextIndex
        };
      }
      return updated;
    });
  };

  const goToQuestion = (index: number, currentAnswerText: string, hintUsed: boolean) => {
    setCurrentSession((prev) => {
      if (!prev) return null;
      
      const currentQuestion = prev.questions[prev.activeQuestionIndex];
      let updatedSession = prev;
      
      if (currentQuestion) {
        updatedSession = interviewService.saveAnswer(
          prev,
          currentQuestion.id,
          currentAnswerText,
          currentQuestionTimeSpent,
          hintUsed
        );
      }

      const targetQuestion = updatedSession.questions[index];
      if (targetQuestion) {
        const targetAns = updatedSession.answers[targetQuestion.id];
        updatedSession.answers[targetQuestion.id] = {
          ...targetAns,
          visited: true
        };
      }

      return {
        ...updatedSession,
        activeQuestionIndex: index
      };
    });
  };

  const nextQuestion = (currentAnswerText: string, hintUsed: boolean) => {
    if (!currentSession) return;
    const nextIndex = activeQuestionIndex + 1;
    if (nextIndex < currentSession.questions.length) {
      goToQuestion(nextIndex, currentAnswerText, hintUsed);
    }
  };

  const prevQuestion = (currentAnswerText: string, hintUsed: boolean) => {
    if (!currentSession) return;
    const prevIndex = activeQuestionIndex - 1;
    if (prevIndex >= 0) {
      goToQuestion(prevIndex, currentAnswerText, hintUsed);
    }
  };

  const completeSession = async (finalAnswerText: string, finalHintUsed: boolean): Promise<string> => {
    if (!currentSession) return '';
    setIsLoading(true);
    try {
      const activeQuestion = currentSession.questions[activeQuestionIndex];
      let finalSession = currentSession;
      
      if (activeQuestion) {
        finalSession = interviewService.saveAnswer(
          currentSession,
          activeQuestion.id,
          finalAnswerText,
          currentQuestionTimeSpent,
          finalHintUsed
        );
      }

      const report = await feedbackService.generateFeedbackReport(finalSession);
      addFeedbackReport(report, finalSession);

      setCurrentSession(null);
      localStorage.removeItem('mockmate_current_session');
      return report.id;
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    setCurrentSession(null);
    localStorage.removeItem('mockmate_current_session');
  };

  // Calculate overall completion progress based on questions that have non-empty or skipped answers
  const progressPercent = (() => {
    if (!currentSession) return 0;
    const total = currentSession.questions.length;
    if (total === 0) return 0;
    const answeredCount = Object.values(currentSession.answers).filter(
      (ans) => ans.userAnswer.trim().length > 0
    ).length;
    return Math.round((answeredCount / total) * 100);
  })();

  return (
    <InterviewContext.Provider
      value={{
        currentSession,
        activeQuestionIndex,
        currentQuestionTimeSpent,
        progressPercent,
        isLoading,
        startSession,
        startSessionFromTemplate,
        saveAnswer,
        updateDraftAnswer,
        skipQuestion,
        goToQuestion,
        nextQuestion,
        prevQuestion,
        completeSession,
        resetSession
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};

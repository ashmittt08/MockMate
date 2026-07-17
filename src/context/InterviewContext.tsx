import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  syncStatus: 'idle' | 'saving' | 'saved' | 'error';
  apiError: string | null;
  clearApiError: () => void;
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
  const { addFeedbackReport, user } = useApp();

  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(() => {
    const stored = localStorage.getItem('mockmate_current_session');
    return stored ? JSON.parse(stored) : null;
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [currentQuestionTimeSpent, setCurrentQuestionTimeSpent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);

  const saveDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSessionRef = useRef<InterviewSession | null>(null);
  const syncQueueRef = useRef<{
    sessionId: string;
    answerData: {
      questionId: string;
      userAnswer: string;
      status: 'ANSWERED' | 'SKIPPED';
      timeSpentSeconds: number;
      hintUsed: boolean;
      visited: boolean;
    };
  }[]>([]);

  // Keep ref up to date
  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  const clearApiError = () => setApiError(null);

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

  // Queue and Retry synchronization helpers
  const addToSyncQueue = (item: { sessionId: string; answerData: any }) => {
    syncQueueRef.current = syncQueueRef.current.filter(
      (q) => !(q.sessionId === item.sessionId && q.answerData.questionId === item.answerData.questionId)
    );
    syncQueueRef.current.push(item);
  };

  const processSyncQueue = async () => {
    if (syncQueueRef.current.length === 0) return;
    setSyncStatus('saving');
    
    const queue = [...syncQueueRef.current];
    syncQueueRef.current = [];
    const failedItems: typeof queue = [];

    for (const item of queue) {
      try {
        await interviewService.saveBackendAnswer(item.sessionId, item.answerData);
      } catch (err) {
        console.error("Failed to sync queue item:", err);
        failedItems.push(item);
      }
    }

    if (failedItems.length > 0) {
      syncQueueRef.current = [...failedItems, ...syncQueueRef.current];
      setSyncStatus('error');
      setApiError("Failed to sync changes with the cloud database. Retrying on reconnect/focus.");
    } else {
      setSyncStatus('saved');
      setApiError(null);
    }
  };

  // Event-driven retries
  useEffect(() => {
    const triggerQueueSync = () => {
      if (syncQueueRef.current.length > 0) {
        processSyncQueue();
      }
    };

    window.addEventListener('online', triggerQueueSync);
    window.addEventListener('focus', triggerQueueSync);

    return () => {
      window.removeEventListener('online', triggerQueueSync);
      window.removeEventListener('focus', triggerQueueSync);
    };
  }, []);

  // Async answer persistence
  const persistAnswerAsync = async (
    sessionId: string,
    answerData: {
      questionId: string;
      userAnswer: string;
      status: 'ANSWERED' | 'SKIPPED';
      timeSpentSeconds: number;
      hintUsed: boolean;
      visited: boolean;
    },
    retries = 3,
    delay = 1000
  ) => {
    try {
      setSyncStatus('saving');
      
      // If there are queued unsynced items, attempt to process them too
      if (syncQueueRef.current.length > 0) {
        await processSyncQueue();
      }

      await interviewService.saveBackendAnswer(sessionId, answerData);
      setSyncStatus('saved');
      setApiError(null);
    } catch (err) {
      console.error(`Failed to save answer for question ${answerData.questionId}. Retries left: ${retries}`, err);
      if (retries > 0) {
        setTimeout(() => {
          persistAnswerAsync(sessionId, answerData, retries - 1, delay * 2);
        }, delay);
      } else {
        setSyncStatus('error');
        setApiError("Could not sync response to the cloud database. Your answer is stored locally and will retry shortly.");
        addToSyncQueue({ sessionId, answerData });
      }
    }
  };

  // Sync / Resume Session from Backend
  const syncSessionWithBackend = async (sessionId: string) => {
    try {
      const backendSession = await interviewService.getBackendSession(sessionId);
      if (backendSession) {
        // Resume only ACTIVE sessions
        if (backendSession.status === 'ACTIVE') {
          setCurrentSession((prev) => {
            if (!prev || prev.id !== sessionId) return prev;
            
            const updatedAnswers = { ...prev.answers };
            backendSession.answers.forEach((ans: any) => {
              const q = prev.questions.find((quest) => quest.id === ans.questionId);
              updatedAnswers[ans.questionId] = {
                questionId: ans.questionId,
                questionText: q ? q.text : '',
                userAnswer: ans.userAnswer,
                timeSpentSeconds: ans.timeSpentSeconds,
                hintUsed: ans.hintUsed,
                visited: ans.visited,
                lastEdited: ans.lastEditedAt
              };
            });

            return {
              ...prev,
              timerSeconds: backendSession.totalTime || prev.timerSeconds,
              answers: updatedAnswers
            };
          });
          setSyncStatus('saved');
        } else {
          // Clear finished or inactive sessions from local storage cache
          console.warn(`Local session is ${backendSession.status} on backend. Clearing cache.`);
          setCurrentSession(null);
          localStorage.removeItem('mockmate_current_session');
        }
      }
    } catch (err) {
      console.warn("Failed to sync session with backend on mount. Using offline cache.", err);
    }
  };

  // Sync on startup
  useEffect(() => {
    if (currentSession?.id) {
      syncSessionWithBackend(currentSession.id);
    }
  }, []);

  const startSession = async (
    role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
    difficulty: 'Easy' | 'Medium' | 'Hard',
    type: 'Technical' | 'Behavioral'
  ) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const session = await interviewService.createSession(role, difficulty, type);
      
      if (user?.uid && session.templateId) {
        try {
          setSyncStatus('saving');
          const backendSessionId = await interviewService.createBackendSession(user.uid, session.templateId);
          session.id = backendSessionId;
          setSyncStatus('saved');
        } catch (err) {
          console.error("Failed to create session on backend:", err);
          setSyncStatus('error');
          setApiError("Failed to sync new session to backend. Your progress will be saved locally.");
        }
      }

      setCurrentSession(session);
      setActiveQuestionIndex(0);
      setCurrentQuestionTimeSpent(0);
    } finally {
      setIsLoading(false);
    }
  };

  const startSessionFromTemplate = async (templateId: string) => {
    setIsLoading(true);
    setApiError(null);
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
        templateId,
        role: template.role as 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
        difficulty: template.difficulty as 'Easy' | 'Medium' | 'Hard',
        type: sessionType as 'Technical' | 'Behavioral',
        questions,
        answers,
        activeQuestionIndex: 0,
        timerSeconds: 0,
        isCompleted: false
      };
      
      if (user?.uid) {
        try {
          setSyncStatus('saving');
          const backendSessionId = await interviewService.createBackendSession(user.uid, templateId);
          session.id = backendSessionId;
          setSyncStatus('saved');
        } catch (err) {
          console.error("Failed to create session on backend:", err);
          setSyncStatus('error');
          setApiError("Failed to sync new template session to backend. Your progress will be saved locally.");
        }
      }

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
    // Optimistic local state update
    setCurrentSession((prev) => {
      if (!prev) return null;
      return interviewService.saveAnswer(prev, questionId, answerText, currentQuestionTimeSpent, hintUsed);
    });

    if (currentSessionRef.current?.id) {
      if (saveDebounceTimeoutRef.current) {
        clearTimeout(saveDebounceTimeoutRef.current);
      }
      persistAnswerAsync(currentSessionRef.current.id, {
        questionId,
        userAnswer: answerText,
        status: answerText === 'Question skipped by candidate.' ? 'SKIPPED' : 'ANSWERED',
        timeSpentSeconds: currentQuestionTimeSpent,
        hintUsed,
        visited: true
      });
    }
  };

  const updateDraftAnswer = (questionId: string, answerText: string) => {
    // 1. Update local state immediately (Optimistic UI)
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

    // 2. Debounce backend save (750ms) to avoid request flooding
    if (currentSessionRef.current?.id) {
      if (saveDebounceTimeoutRef.current) {
        clearTimeout(saveDebounceTimeoutRef.current);
      }
      
      setSyncStatus('saving');

      const activeQuestion = currentSessionRef.current.questions[currentSessionRef.current.activeQuestionIndex];
      const isCurrent = activeQuestion?.id === questionId;
      const timeSpent = isCurrent ? currentQuestionTimeSpent : (currentSessionRef.current.answers[questionId]?.timeSpentSeconds || 0);
      const hintUsed = currentSessionRef.current.answers[questionId]?.hintUsed || false;

      saveDebounceTimeoutRef.current = setTimeout(() => {
        if (currentSessionRef.current?.id) {
          persistAnswerAsync(currentSessionRef.current.id, {
            questionId,
            userAnswer: answerText,
            status: answerText === 'Question skipped by candidate.' ? 'SKIPPED' : 'ANSWERED',
            timeSpentSeconds: timeSpent,
            hintUsed,
            visited: true
          });
        }
      }, 750);
    }
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

    if (currentSessionRef.current?.id) {
      if (saveDebounceTimeoutRef.current) {
        clearTimeout(saveDebounceTimeoutRef.current);
      }
      persistAnswerAsync(currentSessionRef.current.id, {
        questionId,
        userAnswer: 'Question skipped by candidate.',
        status: 'SKIPPED',
        timeSpentSeconds: currentQuestionTimeSpent,
        hintUsed: false,
        visited: true
      });
    }
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

        // Immediate persist on navigation (bypasses debounce)
        if (prev.id) {
          if (saveDebounceTimeoutRef.current) {
            clearTimeout(saveDebounceTimeoutRef.current);
          }
          persistAnswerAsync(prev.id, {
            questionId: currentQuestion.id,
            userAnswer: currentAnswerText,
            status: currentAnswerText === 'Question skipped by candidate.' ? 'SKIPPED' : 'ANSWERED',
            timeSpentSeconds: currentQuestionTimeSpent,
            hintUsed,
            visited: true
          });
        }
      }

      const targetQuestion = updatedSession.questions[index];
      if (targetQuestion) {
        const targetAns = updatedSession.answers[targetQuestion.id];
        updatedSession.answers[targetQuestion.id] = {
          ...targetAns,
          visited: true
        };

        // Persist navigation/visited state to backend
        if (prev.id) {
          persistAnswerAsync(prev.id, {
            questionId: targetQuestion.id,
            userAnswer: targetAns?.userAnswer || '',
            status: targetAns?.userAnswer === 'Question skipped by candidate.' ? 'SKIPPED' : 'ANSWERED',
            timeSpentSeconds: targetAns?.timeSpentSeconds || 0,
            hintUsed: targetAns?.hintUsed || false,
            visited: true
          });
        }
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
    setApiError(null);
    setSyncStatus('saving');
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

      if (finalSession.id) {
        if (saveDebounceTimeoutRef.current) {
          clearTimeout(saveDebounceTimeoutRef.current);
        }

        // Save final answer details
        if (activeQuestion) {
          await interviewService.saveBackendAnswer(finalSession.id, {
            questionId: activeQuestion.id,
            userAnswer: finalAnswerText,
            status: finalAnswerText === 'Question skipped by candidate.' ? 'SKIPPED' : 'ANSWERED',
            timeSpentSeconds: currentQuestionTimeSpent,
            hintUsed: finalHintUsed,
            visited: true
          });
        }

        // Sync any outstanding queue items
        if (syncQueueRef.current.length > 0) {
          await processSyncQueue();
        }

        // Finalize backend session
        await interviewService.completeBackendSession(finalSession.id, finalSession.timerSeconds);
      }

      const report = await feedbackService.generateFeedbackReport(finalSession);
      addFeedbackReport(report, finalSession);

      // Local state is cleared only AFTER successful server completion
      setCurrentSession(null);
      localStorage.removeItem('mockmate_current_session');
      setSyncStatus('idle');
      return report.id;
    } catch (error) {
      console.error('Failed to complete session on server:', error);
      setSyncStatus('error');
      setApiError('Failed to save assessment to server. Please check your internet connection and try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    if (saveDebounceTimeoutRef.current) {
      clearTimeout(saveDebounceTimeoutRef.current);
    }
    setCurrentSession(null);
    localStorage.removeItem('mockmate_current_session');
    setSyncStatus('idle');
    setApiError(null);
  };

  // Calculate overall completion progress based on questions that have non-empty or skipped answers
  const progressPercent = (() => {
    if (!currentSession) return 0;
    const total = currentSession.questions.length;
    if (total === 0) return 0;
    const answeredCount = Object.values(currentSession.answers).filter(
      (ans) => ans.userAnswer.trim().length > 0 && ans.userAnswer !== 'Question skipped by candidate.'
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
        syncStatus,
        apiError,
        clearApiError,
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

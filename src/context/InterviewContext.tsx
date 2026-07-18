import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { InterviewSession, Answer } from '../types';
import { interviewService } from '../services/interviewService';
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
  remainingSeconds: number;
  timerStatus: 'normal' | 'warning' | 'critical';
  autoSubmittedReportId: string | null;
  clearAutoSubmittedReportId: () => void;
  autoCompleteSession: () => Promise<string>;
  resumeSession: (sessionId: string) => Promise<void>;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();

  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(() => {
    const stored = localStorage.getItem('mockmate_current_session');
    return stored ? JSON.parse(stored) : null;
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [currentQuestionTimeSpent, setCurrentQuestionTimeSpent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);

  // Auto-submission and navigation state
  const isAutoSubmitting = useRef(false);
  const [autoSubmittedReportId, setAutoSubmittedReportId] = useState<string | null>(null);

  const clearAutoSubmittedReportId = () => setAutoSubmittedReportId(null);

  // Document visibility state to pause/resume the countdown
  const [isDocumentVisible, setIsDocumentVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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

  // Calculate remaining seconds directly using backend startedAt as the source of truth
  const getRemainingSeconds = (session: InterviewSession | null): number => {
    if (!session || !session.startedAt || !session.duration) return 0;
    const startedTime = new Date(session.startedAt).getTime();
    const durationMs = session.duration * 60 * 1000;
    const expirationTime = startedTime + durationMs;
    const now = Date.now();
    return Math.max(0, Math.floor((expirationTime - now) / 1000));
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => getRemainingSeconds(currentSession));

  useEffect(() => {
    setRemainingSeconds(getRemainingSeconds(currentSession));
  }, [currentSession?.id, currentSession?.startedAt, currentSession?.duration]);

  const timerStatus = (() => {
    if (remainingSeconds <= 60) return 'critical';
    if (remainingSeconds <= 300) return 'warning';
    return 'normal';
  })();

  // Live timer countdown and elapsed stopwatch tick logic
  useEffect(() => {
    if (!currentSession || currentSession.isCompleted) return;
    
    // Pause interval if document is hidden
    if (!isDocumentVisible) return;

    // Immediately update on mount/visibility restore
    const initialRemaining = getRemainingSeconds(currentSessionRef.current);
    setRemainingSeconds(initialRemaining);
    
    if (initialRemaining <= 0) {
      autoCompleteSession();
      return;
    }

    const interval = setInterval(() => {
      const calculatedRemaining = getRemainingSeconds(currentSessionRef.current);
      setRemainingSeconds(calculatedRemaining);

      if (calculatedRemaining <= 0) {
        clearInterval(interval);
        autoCompleteSession();
        return;
      }

      // Increment question and session elapsed stopwatch timers
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
  }, [
    currentSession === null,
    currentSession?.activeQuestionIndex,
    currentSession?.isCompleted,
    isDocumentVisible
  ]);

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
          const duration = backendSession.interviewTemplate?.duration || 30;
          const startedTime = new Date(backendSession.startedAt).getTime();
          const expirationTime = startedTime + duration * 60 * 1000;
          const isExpired = Date.now() >= expirationTime;

          const updatedAnswers: Record<string, Answer> = {};
          
          // Re-assemble questions if not locally stored
          const questions = backendSession.interviewTemplate?.questions?.map((q: any) => ({
            id: q.id,
            text: q.question,
            type: q.type,
            category: q.type,
            tips: [
              "Focus on key concepts and define important terminology.",
              "Provide a real-world scenario or project where you implemented this approach.",
              "Discuss any trade-offs, advantages, or limitations associated with this choice."
            ],
            order: q.order,
            modelAnswer: q.expectedAnswer
          })).slice(0, 3) || [];

          backendSession.answers.forEach((ans: any) => {
            const q = questions.find((quest: any) => quest.id === ans.questionId);
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

          // Fallback if questions are empty
          const localSession = currentSessionRef.current;
          const finalQuestions = questions.length > 0 ? questions : (localSession?.questions || []);
          
          if (finalQuestions.length > 0 && !updatedAnswers[finalQuestions[0].id]) {
            updatedAnswers[finalQuestions[0].id] = {
              questionId: finalQuestions[0].id,
              questionText: finalQuestions[0].text,
              userAnswer: '',
              timeSpentSeconds: 0,
              hintUsed: false,
              visited: true,
              lastEdited: new Date().toISOString()
            };
          }

          const session: InterviewSession = {
            id: sessionId,
            templateId: backendSession.interviewTemplateId,
            role: backendSession.interviewTemplate?.role || localSession?.role || 'Frontend',
            difficulty: backendSession.interviewTemplate?.difficulty || localSession?.difficulty || 'Medium',
            type: (backendSession.interviewTemplate?.title?.toLowerCase().includes('hr') || backendSession.answers.some((ans: any) => ans.question?.type?.toLowerCase().includes('behavioral'))) ? 'Behavioral' : 'Technical',
            questions: finalQuestions,
            answers: updatedAnswers,
            activeQuestionIndex: localSession?.activeQuestionIndex || 0,
            timerSeconds: backendSession.totalTime || localSession?.timerSeconds || 0,
            isCompleted: false,
            startedAt: backendSession.startedAt,
            duration: duration
          };

          setCurrentSession(session);
          setSyncStatus('saved');

          if (isExpired) {
            console.log("Resumed ACTIVE session is already expired. Auto-submitting...");
            await autoCompleteSessionWithObject(session);
          }
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

  const resumeSession = async (sessionId: string): Promise<void> => {
    setIsLoading(true);
    setApiError(null);
    try {
      const backendSession = await interviewService.getBackendSession(sessionId);
      if (!backendSession) {
        throw new Error('Session not found on backend');
      }

      // Restores all answers, progress, timer
      const duration = backendSession.interviewTemplate?.duration || 30;
      const startedTime = new Date(backendSession.startedAt).getTime();
      const expirationTime = startedTime + duration * 60 * 1000;
      const isExpired = Date.now() >= expirationTime;

      const updatedAnswers: Record<string, Answer> = {};
      
      const questions = backendSession.interviewTemplate?.questions?.map((q: any) => ({
        id: q.id,
        text: q.question,
        type: q.type,
        category: q.type,
        tips: [
          "Focus on key concepts and define important terminology.",
          "Provide a real-world scenario or project where you implemented this approach.",
          "Discuss any trade-offs, advantages, or limitations associated with this choice."
        ],
        order: q.order,
        modelAnswer: q.expectedAnswer
      })).sort((a: any, b: any) => a.order - b.order) || [];

      backendSession.answers.forEach((ans: any) => {
        const q = questions.find((quest: any) => quest.id === ans.questionId);
        updatedAnswers[ans.questionId] = {
          questionId: ans.questionId,
          questionText: q ? q.text : '',
          userAnswer: ans.userAnswer,
          timeSpentSeconds: ans.timeSpentSeconds,
          hintUsed: ans.hintUsed,
          visited: ans.visited,
          lastEdited: ans.lastEditedAt || ans.updatedAt
        };
      });

      // Restore progress: resume the last viewed question instead of the first unanswered question whenever possible.
      let restoredActiveIndex = 0;
      if (backendSession.answers && backendSession.answers.length > 0) {
        const sortedAnswers = [...backendSession.answers].sort((a: any, b: any) => {
          const timeA = new Date(a.lastEditedAt || a.updatedAt || 0).getTime();
          const timeB = new Date(b.lastEditedAt || b.updatedAt || 0).getTime();
          return timeB - timeA;
        });
        const lastActiveQuestionId = sortedAnswers[0]?.questionId;
        if (lastActiveQuestionId) {
          const foundIndex = questions.findIndex((q: any) => q.id === lastActiveQuestionId);
          if (foundIndex !== -1) {
            restoredActiveIndex = foundIndex;
          }
        }
      }

      // Ensure active question is marked as visited in restored state
      const activeQuestion = questions[restoredActiveIndex];
      if (activeQuestion) {
        const activeAns = updatedAnswers[activeQuestion.id];
        updatedAnswers[activeQuestion.id] = {
          ...(activeAns || {
            questionId: activeQuestion.id,
            questionText: activeQuestion.text,
            userAnswer: '',
            timeSpentSeconds: 0,
            hintUsed: false,
            lastEdited: new Date().toISOString()
          }),
          visited: true
        };
      }

      const session: InterviewSession = {
        id: sessionId,
        templateId: backendSession.interviewTemplateId,
        role: backendSession.interviewTemplate?.role || 'Frontend',
        difficulty: backendSession.interviewTemplate?.difficulty || 'Medium',
        type: (backendSession.interviewTemplate?.title?.toLowerCase().includes('hr') || backendSession.answers.some((ans: any) => ans.question?.type?.toLowerCase().includes('behavioral'))) ? 'Behavioral' : 'Technical',
        questions: questions,
        answers: updatedAnswers,
        activeQuestionIndex: restoredActiveIndex,
        timerSeconds: backendSession.totalTime || 0,
        isCompleted: false,
        startedAt: backendSession.startedAt,
        duration: duration
      };

      setCurrentSession(session);
      setActiveQuestionIndex(restoredActiveIndex);
      
      if (activeQuestion) {
        const savedAnswer = updatedAnswers[activeQuestion.id];
        setCurrentQuestionTimeSpent(savedAnswer?.timeSpentSeconds || 0);
      }

      setSyncStatus('saved');

      if (isExpired) {
        console.log("Resumed ACTIVE session is already expired. Auto-submitting...");
        await autoCompleteSessionWithObject(session);
      }
    } catch (err) {
      console.error("Failed to resume session:", err);
      setApiError("Failed to resume active session. Please check your internet connection.");
      throw err;
    } finally {
      setIsLoading(false);
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
          const backendDetails = await interviewService.createBackendSession(user.uid, session.templateId);
          session.id = backendDetails.id;
          session.startedAt = backendDetails.startedAt;
          session.duration = backendDetails.interviewTemplate?.duration;
          setSyncStatus('saved');
        } catch (err) {
          console.error("Failed to create session on backend:", err);
          setSyncStatus('error');
          setApiError("Failed to sync new session to backend. Your progress will be saved locally.");
        }
      }

      if (!session.startedAt) {
        session.startedAt = new Date().toISOString();
      }
      if (!session.duration) {
        session.duration = 30; // default to 30 mins
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
        isCompleted: false,
        duration: template.duration,
        startedAt: new Date().toISOString()
      };
      
      if (user?.uid) {
        try {
          setSyncStatus('saving');
          const backendDetails = await interviewService.createBackendSession(user.uid, templateId);
          session.id = backendDetails.id;
          session.startedAt = backendDetails.startedAt;
          session.duration = backendDetails.interviewTemplate?.duration || template.duration;
          setSyncStatus('saved');
        } catch (err) {
          console.error("Failed to create session on backend:", err);
          setSyncStatus('error');
          setApiError("Failed to sync new template session to backend. Your progress will be saved locally.");
        }
      }

      if (!session.startedAt) {
        session.startedAt = new Date().toISOString();
      }
      if (!session.duration) {
        session.duration = template.duration || 30;
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

        // Allow a brief grace period for network completion
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Finalize backend session
        await interviewService.completeBackendSession(finalSession.id, finalSession.timerSeconds);
      }

      // Local state is cleared only AFTER successful server completion
      const sessionId = finalSession.id || '';
      setCurrentSession(null);
      localStorage.removeItem('mockmate_current_session');
      setSyncStatus('idle');
      return sessionId;
    } catch (error) {
      console.error('Failed to complete session on server:', error);
      setSyncStatus('error');
      setApiError('Failed to save assessment to server. Please check your internet connection and try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Perform full auto-submission under context control
  const autoCompleteSessionWithObject = async (sessionToSubmit: InterviewSession | null): Promise<string> => {
    if (!sessionToSubmit || isAutoSubmitting.current) return '';
    isAutoSubmitting.current = true;
    setIsLoading(true);
    setApiError(null);
    setSyncStatus('saving');

    if (saveDebounceTimeoutRef.current) {
      clearTimeout(saveDebounceTimeoutRef.current);
      saveDebounceTimeoutRef.current = null;
    }

    try {
      const activeQuestion = sessionToSubmit.questions[sessionToSubmit.activeQuestionIndex];
      const activeAns = activeQuestion ? sessionToSubmit.answers[activeQuestion.id] : null;

      if (sessionToSubmit.id) {
        // 1. Flush the active question's draft answer immediately
        if (activeQuestion && activeAns) {
          try {
            await interviewService.saveBackendAnswer(sessionToSubmit.id, {
              questionId: activeQuestion.id,
              userAnswer: activeAns.userAnswer,
              status: activeAns.userAnswer === 'Question skipped by candidate.' ? 'SKIPPED' : 'ANSWERED',
              timeSpentSeconds: activeAns.timeSpentSeconds,
              hintUsed: activeAns.hintUsed,
              visited: true
            });
          } catch (err) {
            console.error("Failed to save final question draft in auto-submit:", err);
          }
        }

        // 2. Flush any outstanding queue items
        if (syncQueueRef.current.length > 0) {
          try {
            await processSyncQueue();
          } catch (err) {
            console.error("Failed to flush sync queue in auto-submit:", err);
          }
        }

        // 3. Grace period for any concurrent/pending network completion
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 4. Complete session on the backend
        await interviewService.completeBackendSession(sessionToSubmit.id, sessionToSubmit.timerSeconds);
      }

      // Local state is cleared only AFTER successful server completion
      const sessionId = sessionToSubmit.id || '';
      setCurrentSession(null);
      localStorage.removeItem('mockmate_current_session');
      setSyncStatus('idle');
      setAutoSubmittedReportId(sessionId);
      return sessionId;
    } catch (error) {
      console.error('Failed to auto-complete session:', error);
      setSyncStatus('error');
      setApiError('Auto-submit failed. Retrying in 3 seconds...');
      isAutoSubmitting.current = false;
      
      // Auto retry after 3 seconds
      setTimeout(() => {
        autoCompleteSessionWithObject(sessionToSubmit);
      }, 3000);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const autoCompleteSession = async (): Promise<string> => {
    return autoCompleteSessionWithObject(currentSessionRef.current);
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
        resetSession,
        remainingSeconds,
        timerStatus,
        autoSubmittedReportId,
        clearAutoSubmittedReportId,
        autoCompleteSession,
        resumeSession
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

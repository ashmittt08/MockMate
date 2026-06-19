import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, InterviewSession, FeedbackReport, Answer, Achievement } from '../types';
import { getQuestionsForSession, defaultAchievements } from '../data/mockQuestions';

interface AppContextType {
  user: User | null;
  interviews: FeedbackReport[];
  currentSession: InterviewSession | null;
  achievements: Achievement[];
  login: (email: string) => Promise<boolean>;
  signup: (name: string, email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, targetRole: string, bio: string) => void;
  startSession: (
    role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
    difficulty: 'Easy' | 'Medium' | 'Hard',
    type: 'Technical' | 'Behavioral'
  ) => void;
  submitAnswer: (answerText: string, timeSpentSeconds: number, hintUsed: boolean) => void;
  skipQuestion: () => void;
  completeSession: () => string; // Returns new report ID
  getReportById: (id: string) => FeedbackReport | undefined;
  resetSession: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial historical mock data to populate the dashboard instantly
const initialHistoricalInterviews: FeedbackReport[] = [
  {
    id: 'report_mock_1',
    role: 'Frontend',
    difficulty: 'Medium',
    type: 'Technical',
    date: '2026-06-15',
    overallScore: 82,
    accuracyScore: 85,
    communicationScore: 78,
    completenessScore: 83,
    strengths: [
      'Strong conceptual explanation of React state lifecycle and DOM paint intervals.',
      'Appropriately discussed list virtualization using react-window to optimize massive grids.'
    ],
    weaknesses: [
      'Communication lacked concise structuring; tended to repeat technical terms.',
      'Missed details on context selector optimizations to prevent unnecessary parent re-renders.'
    ],
    suggestions: [
      {
        questionId: 102,
        questionText: 'How would you optimize a slow React application that has heavy rendering loads and deep component trees?',
        userAnswer: 'I would use React.memo to cache my components and useMemo to save slow function calculations. Also, code-splitting with React.lazy is very good. And if I have a really big table, I would virtualize it.',
        modelAnswer: 'Optimizing a slow React app involves identifying and reducing unnecessary re-renders. Use React Profiler to find bottlenecks, useMemo and useCallback for reference stability, list virtualization for lists, lazy loading for route splitting, and optimize global states.',
        feedbackText: 'Great initial layout of terms. To advance your answer, explain how React context updates propagate and how state-splitting prevents global re-renders.',
        score: 82
      }
    ]
  },
  {
    id: 'report_mock_2',
    role: 'Frontend',
    difficulty: 'Easy',
    type: 'Technical',
    date: '2026-06-10',
    overallScore: 74,
    accuracyScore: 76,
    communicationScore: 70,
    completenessScore: 76,
    strengths: [
      'Correctly detailed the O(n) nature of React reconciliation.',
      'Solid identification of key props purpose.'
    ],
    weaknesses: [
      'Struggled with detailing how different component elements impact reconciliation tree pruning.',
      'Did not specify how fiber nodes manage update priorities.'
    ],
    suggestions: [
      {
        questionId: 101,
        questionText: 'Explain the concept of React Reconciliation and how the Virtual DOM works under the hood.',
        userAnswer: 'The virtual DOM is a Javascript copy of the HTML DOM. React makes changes on this copy first, then it does a diff to see what changes are needed, and puts it in the real DOM. That makes it faster.',
        modelAnswer: 'React reconciliation is the process through which React updates the DOM. When a component’s state or props change, React builds a new Virtual DOM tree, diffs it in O(n) complexity, and applies patches to the browser DOM.',
        feedbackText: 'Clear baseline explanation. You should describe key-driven diffing algorithms and explain why O(n) is used instead of traditional O(n^3) tree comparisons.',
        score: 74
      }
    ]
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('mockmate_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [interviews, setInterviews] = useState<FeedbackReport[]>(() => {
    const stored = localStorage.getItem('mockmate_interviews');
    return stored ? JSON.parse(stored) : initialHistoricalInterviews;
  });

  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(() => {
    const stored = localStorage.getItem('mockmate_current_session');
    return stored ? JSON.parse(stored) : null;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const stored = localStorage.getItem('mockmate_achievements');
    if (stored) return JSON.parse(stored);
    
    // Evaluate initial achievements based on initialHistoricalInterviews
    const initial = [...defaultAchievements];
    const totalInterviews = initialHistoricalInterviews.length;
    if (totalInterviews > 0) {
      initial[0].isUnlocked = true; // First step
      initial[0].unlockedAt = new Date('2026-06-10').toISOString();
    }
    if (totalInterviews >= 3) {
      initial[1].isUnlocked = true; // Consistency
      initial[1].unlockedAt = new Date().toISOString();
    }
    return initial;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('mockmate_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mockmate_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('mockmate_interviews', JSON.stringify(interviews));
  }, [interviews]);

  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('mockmate_current_session', JSON.stringify(currentSession));
    } else {
      localStorage.removeItem('mockmate_current_session');
    }
  }, [currentSession]);

  useEffect(() => {
    localStorage.setItem('mockmate_achievements', JSON.stringify(achievements));
  }, [achievements]);

  const login = async (email: string): Promise<boolean> => {
    // Simulating login API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const dummyUser: User = {
          name: 'Sarah Connor',
          email: email,
          targetRole: 'Frontend Engineer',
          bio: 'Passionate UI Architect focusing on scalable state architectures, performance, and CSS variables.',
          joinedDate: '2026-06-01',
          interviewsCompleted: interviews.length
        };
        setUser(dummyUser);
        resolve(true);
      }, 800);
    });
  };

  const signup = async (name: string, email: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dummyUser: User = {
          name: name,
          email: email,
          targetRole: 'Software Engineer',
          bio: 'Eager developer practicing core technical and behavioral rounds to secure a dream role.',
          joinedDate: new Date().toISOString().split('T')[0],
          interviewsCompleted: 0
        };
        setUser(dummyUser);
        // Clear default history for a fresh signup
        setInterviews([]);
        // Reset achievements
        setAchievements(defaultAchievements);
        resolve(true);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    setCurrentSession(null);
    setInterviews(initialHistoricalInterviews);
    setAchievements(defaultAchievements);
    localStorage.removeItem('mockmate_user');
    localStorage.removeItem('mockmate_interviews');
    localStorage.removeItem('mockmate_current_session');
    localStorage.removeItem('mockmate_achievements');
  };

  const updateProfile = (name: string, targetRole: string, bio: string) => {
    if (user) {
      setUser({ ...user, name, targetRole, bio });
    }
  };

  const startSession = (
    role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
    difficulty: 'Easy' | 'Medium' | 'Hard',
    type: 'Technical' | 'Behavioral'
  ) => {
    const questions = getQuestionsForSession(role, difficulty, type);
    const newSession: InterviewSession = {
      role,
      difficulty,
      type,
      questions,
      answers: [],
      activeQuestionIndex: 0,
      timerSeconds: 0,
      isCompleted: false
    };
    setCurrentSession(newSession);
  };

  const submitAnswer = (answerText: string, timeSpentSeconds: number, hintUsed: boolean) => {
    if (!currentSession) return;

    const currentQuestion = currentSession.questions[currentSession.activeQuestionIndex];
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      userAnswer: answerText,
      timeSpentSeconds,
      hintUsed
    };

    const updatedAnswers = [...currentSession.answers, newAnswer];
    const nextIndex = currentSession.activeQuestionIndex + 1;
    const isCompleted = nextIndex >= currentSession.questions.length;

    setCurrentSession({
      ...currentSession,
      answers: updatedAnswers,
      activeQuestionIndex: nextIndex,
      isCompleted
    });
  };

  const skipQuestion = () => {
    submitAnswer('Question skipped by candidate.', 10, false);
  };

  const resetSession = () => {
    setCurrentSession(null);
  };

  const getReportById = (id: string) => {
    return interviews.find((r) => r.id === id);
  };

  const completeSession = (): string => {
    if (!currentSession) return '';

    const newReportId = `report_${Date.now()}`;
    const totalQuestions = currentSession.questions.length;
    
    // Evaluate scores based on simulated answer content
    let accumulatedScore = 0;
    let accuracyTotal = 0;
    let communicationTotal = 0;
    let completenessTotal = 0;

    const suggestions = currentSession.questions.map((q, idx) => {
      const ans = currentSession.answers[idx] || { userAnswer: '', timeSpentSeconds: 60, hintUsed: false };
      const answerLength = ans.userAnswer.trim().length;

      let score = 75; // Baseline
      let feedback = '';

      if (ans.userAnswer.includes('skipped')) {
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

    if (currentSession.role === 'Frontend') {
      strengths.push('Demonstrates solid knowledge of browser optimization, lazy structures, and UI performance boundaries.');
      if (overallScore > 80) strengths.push('Excellent ability to link functional state hooks with real DOM synchronization.');
      weaknesses.push('Could provide deeper optimization plans for local caching and IndexedDB syncing.');
    } else if (currentSession.role === 'Backend') {
      strengths.push('Strong architectural understanding of system scaling, data partition mechanics, and cache latency.');
      weaknesses.push('Could expand on fault-tolerance strategies, database index rebuilding, and replication lags.');
    } else if (currentSession.role === 'Product Manager') {
      strengths.push('Clear focus on business indicators (NPS, LTV, Retention) and structured team alignment.');
      weaknesses.push('Lacks concrete sizing of technical tradeoffs when interacting with engineering departments.');
    } else {
      strengths.push('Solid mathematical description of models, bias-variance metrics, and validation structures.');
      weaknesses.push('Could outline better plans for model productionization, drift monitoring, and vector database retrieval.');
    }

    const newReport: FeedbackReport = {
      id: newReportId,
      role: currentSession.role,
      difficulty: currentSession.difficulty,
      type: currentSession.type,
      date: new Date().toISOString().split('T')[0],
      overallScore,
      accuracyScore,
      communicationScore,
      completenessScore,
      strengths,
      weaknesses,
      suggestions
    };

    // Update history & user
    const updatedInterviews = [newReport, ...interviews];
    setInterviews(updatedInterviews);

    if (user) {
      setUser({
        ...user,
        interviewsCompleted: user.interviewsCompleted + 1
      });
    }

    // Evaluate Achievements
    setAchievements((prev) => {
      return prev.map((a) => {
        if (a.isUnlocked) return a;
        let unlock = false;
        
        if (a.id === 'first_step' && updatedInterviews.length >= 1) unlock = true;
        if (a.id === 'consistency_king' && updatedInterviews.length >= 3) unlock = true;
        if (a.id === 'top_performer' && overallScore >= 85) unlock = true;
        
        const fastAnswer = currentSession.answers.some(ans => ans.timeSpentSeconds < 120 && !ans.userAnswer.includes('skipped'));
        if (a.id === 'time_master' && fastAnswer) unlock = true;

        if (unlock) {
          return { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() };
        }
        return a;
      });
    });

    // Clear active session
    setCurrentSession(null);

    return newReportId;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        interviews,
        currentSession,
        achievements,
        login,
        signup,
        logout,
        updateProfile,
        startSession,
        submitAnswer,
        skipQuestion,
        completeSession,
        getReportById,
        resetSession
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

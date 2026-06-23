import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, InterviewSession, FeedbackReport, Achievement } from '../types';
import { initialHistoricalInterviews, defaultAchievements } from '../data/mockInterviews';
import { authService } from '../services/authService';
import { interviewService } from '../services/interviewService';
import { feedbackService } from '../services/feedbackService';

interface AppContextType {
  user: User | null;
  interviews: FeedbackReport[];
  currentSession: InterviewSession | null;
  achievements: Achievement[];
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  signup: (name: string, email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string, targetRole: string, bio: string) => void;
  startSession: (
    role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
    difficulty: 'Easy' | 'Medium' | 'Hard',
    type: 'Technical' | 'Behavioral'
  ) => Promise<void>;
  submitAnswer: (answerText: string, timeSpentSeconds: number, hintUsed: boolean) => void;
  skipQuestion: () => void;
  completeSession: () => Promise<string>; // Returns new report ID
  getReportById: (id: string) => FeedbackReport | undefined;
  resetSession: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
      initial[0].isUnlocked = true;
      initial[0].unlockedAt = new Date('2026-06-10').toISOString();
    }
    if (totalInterviews >= 3) {
      initial[1].isUnlocked = true;
      initial[1].unlockedAt = new Date().toISOString();
    }
    return initial;
  });

  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(email, interviews.length);
      setUser(loggedUser);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser = await authService.signup(name, email);
      setUser(newUser);
      setInterviews([]);
      setAchievements(defaultAchievements);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setCurrentSession(null);
      setInterviews(initialHistoricalInterviews);
      setAchievements(defaultAchievements);
      localStorage.removeItem('mockmate_user');
      localStorage.removeItem('mockmate_interviews');
      localStorage.removeItem('mockmate_current_session');
      localStorage.removeItem('mockmate_achievements');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (name: string, targetRole: string, bio: string) => {
    if (user) {
      setUser({ ...user, name, targetRole, bio });
    }
  };

  const startSession = async (
    role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist',
    difficulty: 'Easy' | 'Medium' | 'Hard',
    type: 'Technical' | 'Behavioral'
  ) => {
    setIsLoading(true);
    try {
      const session = await interviewService.createSession(role, difficulty, type);
      setCurrentSession(session);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = (answerText: string, timeSpentSeconds: number, hintUsed: boolean) => {
    if (!currentSession) return;
    const updated = interviewService.submitAnswer(currentSession, answerText, timeSpentSeconds, hintUsed);
    setCurrentSession(updated);
  };

  const skipQuestion = () => {
    if (!currentSession) return;
    const updated = interviewService.skipQuestion(currentSession);
    setCurrentSession(updated);
  };

  const resetSession = () => {
    setCurrentSession(null);
  };

  const getReportById = (id: string) => {
    return interviews.find((r) => r.id === id);
  };

  const completeSession = async (): Promise<string> => {
    if (!currentSession) return '';
    setIsLoading(true);
    try {
      const report = await feedbackService.generateFeedbackReport(currentSession);
      const updatedInterviews = [report, ...interviews];
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
          if (a.id === 'top_performer' && report.overallScore >= 85) unlock = true;
          
          const fastAnswer = currentSession.answers.some(
            (ans) => ans.timeSpentSeconds < 120 && !ans.userAnswer.includes('skipped')
          );
          if (a.id === 'time_master' && fastAnswer) unlock = true;

          if (unlock) {
            return { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        });
      });

      setCurrentSession(null);
      return report.id;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        interviews,
        currentSession,
        achievements,
        isLoading,
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

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { InterviewSession, FeedbackReport, Achievement, DbUser } from '../types';
import { initialHistoricalInterviews, defaultAchievements } from '../data/mockInterviews';
import { authService } from '../services/authService';
import { interviewService } from '../services/interviewService';
import { feedbackService } from '../services/feedbackService';
import { userService } from '../services/userService';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AppContextType {
  user: FirebaseUser | null;
  dbUser: DbUser | null;
  interviews: FeedbackReport[];
  currentSession: InterviewSession | null;
  achievements: Achievement[];
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<boolean>;
  signup: (name: string, email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const syncedUser = await userService.syncUser({
            firebaseUid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Google User',
            email: firebaseUser.email || '',
            photoUrl: firebaseUser.photoURL,
          });
          setDbUser(syncedUser);
        } catch (error) {
          console.error('Failed to sync user with database:', error);
        }
      } else {
        setDbUser(null);
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  const login = async (_email: string): Promise<boolean> => {
    // Disabled in favor of loginWithGoogle
    return false;
  };

  const signup = async (_name: string, _email: string): Promise<boolean> => {
    // Disabled in favor of loginWithGoogle
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.loginWithGoogle();
      setUser(loggedUser);
      return true;
    } catch (error) {
      console.error('Google login failed:', error);
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
      setDbUser(null);
      setCurrentSession(null);
      setInterviews(initialHistoricalInterviews);
      setAchievements(defaultAchievements);
      localStorage.removeItem('mockmate_interviews');
      localStorage.removeItem('mockmate_current_session');
      localStorage.removeItem('mockmate_achievements');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (_name: string, _targetRole: string, _bio: string) => {
    // no-op, as profile editing is disabled per user request
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
        dbUser,
        interviews,
        currentSession,
        achievements,
        isLoading,
        loading,
        isAuthenticated,
        login,
        signup,
        loginWithGoogle,
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

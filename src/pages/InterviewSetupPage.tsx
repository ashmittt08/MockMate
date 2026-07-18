import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import { useApp } from '../context/AppContext';
import { interviewService } from '../services/interviewService';
import { ROUTES } from '../constants/routes';
import type { RoleId } from '../constants/roles';
import type { DifficultyId } from '../constants/difficulty';
import {
  Code2,
  Database,
  Briefcase,
  Brain,
  Video,
  ChevronRight,
  Info
} from 'lucide-react';

export const InterviewSetupPage: React.FC = () => {
  const { user } = useApp();
  const { startSession, resumeSession } = useInterview();
  const navigate = useNavigate();

  // Selection states
  const [role, setRole] = useState<RoleId>('Frontend');
  const [difficulty, setDifficulty] = useState<DifficultyId>('Medium');
  const [type, setType] = useState<'Technical' | 'Behavioral'>('Technical');

  // Active session check states
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [remainingTimeText, setRemainingTimeText] = useState('');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [sessionStarting, setSessionStarting] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchActiveSession = async () => {
      if (!user?.uid) return;
      try {
        const session = await interviewService.getActiveSession(user.uid);
        if (active) {
          setActiveSession(session);
        }
      } catch (err) {
        console.error('Failed to fetch active session:', err);
      }
    };
    fetchActiveSession();
    return () => {
      active = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!activeSession) return;
    const updateCountdown = () => {
      const startedTime = new Date(activeSession.startedAt).getTime();
      const durationMs = (activeSession.interviewTemplate?.duration || 30) * 60 * 1000;
      const expirationTime = startedTime + durationMs;
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((expirationTime - now) / 1000));

      if (remainingSeconds <= 0) {
        setActiveSession(null);
        setRemainingTimeText('Expired');
      } else {
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        setRemainingTimeText(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStart = async () => {
    if (activeSession) {
      setShowDuplicateModal(true);
      return;
    }
    try {
      setSessionStarting(true);
      await startSession(role, difficulty, type);
      navigate(ROUTES.INTERVIEW_SESSION);
    } catch (err) {
      console.error(err);
      alert('Failed to start interview session. Please try again.');
    } finally {
      setSessionStarting(false);
    }
  };

  const handleResume = async (sessionId: string) => {
    try {
      setSessionStarting(true);
      await resumeSession(sessionId);
      navigate(ROUTES.INTERVIEW_SESSION);
    } catch (err) {
      console.error('Failed to resume session:', err);
      alert('Failed to resume session. Please try again.');
    } finally {
      setSessionStarting(false);
    }
  };

  const roles: {
    id: RoleId;
    title: string;
    desc: string;
    icon: typeof Code2;
    color: string;
  }[] = [
    {
      id: 'Frontend',
      title: 'Frontend Engineer',
      desc: 'UI architectures, reconciliation, CSS layouts, and component optimizations.',
      icon: Code2,
      color: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/5'
    },
    {
      id: 'Backend',
      title: 'Backend Engineer',
      desc: 'System design, rate limiting, sharding, and database indexing.',
      icon: Database,
      color: 'text-purple-400 border-purple-500/25 bg-purple-500/5'
    },
    {
      id: 'Product Manager',
      title: 'Product Manager',
      desc: 'Product strategy, metrics, roadmap priorities, and conflict resolution.',
      icon: Briefcase,
      color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5'
    },
    {
      id: 'Data Scientist',
      title: 'Data Scientist',
      desc: 'Machine learning metrics, bias-variance trade-offs, and attention mechanisms.',
      icon: Brain,
      color: 'text-orange-400 border-orange-500/25 bg-orange-500/5'
    }
  ];

  const difficulties: {
    id: DifficultyId;
    label: string;
    desc: string;
  }[] = [
    { id: 'Easy', label: 'Easy Track', desc: 'Core fundamentals and direct questions.' },
    { id: 'Medium', label: 'Medium Track', desc: 'Case studies, architectural trade-offs, and behavioral scenarios.' },
    { id: 'Hard', label: 'Hard Track', desc: 'Deep technical designs, algorithms, and complex systems.' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
          <span>Configure Session</span>
        </h1>
        <p className="text-sm text-app-muted mt-1">
          Adjust the career track and parameters. Our evaluation engine will adapt to your choices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Config Options */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Select Career Track */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-app-primary/10 text-[10px] text-app-primary">1</span>
              <span>Select Career Track</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-app-primary bg-app-primary/5 shadow-md shadow-app-primary/5'
                        : 'border-white/5 bg-app-surface/20 hover:border-white/10 hover:bg-app-surface/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`rounded-xl p-2.5 border ${
                        isSelected 
                          ? 'bg-app-primary/15 text-app-primary border-app-primary/20' 
                          : 'bg-white/5 text-slate-400 border-white/5'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-app-primary"></span>
                      )}
                    </div>
                    <h4 className="mt-4 font-bold text-white text-sm">{r.title}</h4>
                    <p className="mt-1 text-xs text-app-muted leading-relaxed">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Difficulty Level */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-app-primary/10 text-[10px] text-app-primary">2</span>
              <span>Choose Difficulty Level</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {difficulties.map((d) => {
                const isSelected = difficulty === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-app-primary bg-app-primary/5'
                        : 'border-white/5 bg-app-surface/20 hover:border-white/10'
                    }`}
                  >
                    <h4 className={`font-bold text-xs ${isSelected ? 'text-app-primary' : 'text-slate-300'}`}>
                      {d.label}
                    </h4>
                    <p className="mt-1 text-[10px] text-app-muted leading-relaxed">{d.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Interview Type */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-app-primary/10 text-[10px] text-app-primary">3</span>
              <span>Define Interview Focus</span>
            </h3>

            <div className="flex gap-4">
              <button
                onClick={() => setType('Technical')}
                className={`flex-1 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  type === 'Technical'
                    ? 'border-app-primary bg-app-primary/5 text-white font-bold'
                    : 'border-white/5 bg-app-surface/20 text-app-muted hover:border-white/10'
                }`}
              >
                <span className="text-xs">Technical Assessment</span>
              </button>
              <button
                onClick={() => setType('Behavioral')}
                className={`flex-1 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  type === 'Behavioral'
                    ? 'border-app-primary bg-app-primary/5 text-white font-bold'
                    : 'border-white/5 bg-app-surface/20 text-app-muted hover:border-white/10'
                }`}
              >
                <span className="text-xs">Behavioral (STAR Method)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Preview Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Video className="h-20 w-20 text-app-primary" />
            </div>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-4">
              Session Details
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between">
                <span className="text-app-muted">Career Track</span>
                <span className="font-semibold text-slate-200">{role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-muted">Target Level</span>
                <span className="font-semibold text-slate-200">{difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-muted">Round Type</span>
                <span className="font-semibold text-slate-200">{type}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-4">
                <span className="text-app-muted">Question Count</span>
                <span className="font-semibold text-slate-200">3 Challenges</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-muted">Pacing Targets</span>
                <span className="font-semibold text-slate-200">~3 mins per prompt</span>
              </div>
            </div>

            <div className="rounded-xl bg-app-accent/5 border border-app-accent/15 p-4 text-[11px] text-app-muted flex items-start space-x-2">
              <Info className="h-4.5 w-4.5 text-app-accent shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                You will record text-based solutions under pacing metrics. The evaluation engine scores terminology matching and provides a breakdown checklist post-interview.
              </p>
            </div>

            <button
              onClick={handleStart}
              disabled={sessionStarting}
              className="flex w-full items-center justify-center space-x-1.5 rounded-xl bg-app-primary py-3.5 text-sm font-semibold text-white hover:bg-app-primary/95 transition-all shadow-md shadow-app-primary/10 cursor-pointer disabled:opacity-50"
            >
              <span>Initialize Simulation</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-app-surface p-6 shadow-2xl space-y-6 text-left">
            <div className="flex items-start space-x-4">
              <div className="rounded-xl p-3 bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Video className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Active Session in Progress</h3>
                <p className="text-xs text-app-muted leading-relaxed">
                  You already have an active practice session for <strong className="text-slate-200">{activeSession?.interviewTemplate?.title || 'an interview'}</strong>. You cannot start a concurrent session.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-app-muted">
                <span>Started At</span>
                <span className="font-semibold text-white">
                  {activeSession && new Date(activeSession.startedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-app-muted">
                <span>Time Remaining</span>
                <span className="font-semibold text-rose-400 font-mono">
                  {remainingTimeText || 'Calculating...'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                }}
                className="flex-1 rounded-xl border border-white/10 hover:border-white/20 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (activeSession) {
                    if (window.confirm("Are you sure you want to abandon the current interview session? This will delete all current progress and cannot be undone.")) {
                      try {
                        setShowDuplicateModal(false);
                        setSessionStarting(true);
                        await interviewService.abandonSession(activeSession.id);
                        setActiveSession(null);
                        
                        // Old session abandoned successfully, now start the new custom session!
                        await startSession(role, difficulty, type);
                        navigate(ROUTES.INTERVIEW_SESSION);
                      } catch (err) {
                        console.error('Failed to abandon session:', err);
                        alert('Failed to abandon session. Please try again.');
                      } finally {
                        setSessionStarting(false);
                      }
                    }
                  }
                }}
                className="flex-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/15 py-2.5 text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Abandon & Start New
              </button>
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                  if (activeSession) {
                    handleResume(activeSession.id);
                  }
                }}
                className="flex-1 rounded-xl bg-app-primary hover:bg-app-primary/95 text-white py-2.5 text-xs font-semibold transition-all shadow-md shadow-app-primary/10 cursor-pointer text-center"
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

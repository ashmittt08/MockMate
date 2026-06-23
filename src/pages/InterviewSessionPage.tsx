import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ROUTES } from '../constants/routes';
import { LoadingState } from '../components/common/LoadingState';
import {
  Clock,
  Mic,
  Video,
  Lightbulb,
  ChevronRight,
  AlertTriangle,
  StopCircle
} from 'lucide-react';

export const InterviewSessionPage: React.FC = () => {
  const { currentSession, submitAnswer, skipQuestion, completeSession, resetSession, isLoading } = useApp();
  const navigate = useNavigate();

  // Local states
  const [answer, setAnswer] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micBars, setMicBars] = useState([40, 20, 50, 30, 60, 20, 40]);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const micIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dictationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeQuestionIndex = currentSession?.activeQuestionIndex;

  // React state adjustment during render when the question index changes
  const [prevIndex, setPrevIndex] = useState<number | undefined>(undefined);
  if (activeQuestionIndex !== undefined && activeQuestionIndex !== prevIndex) {
    setPrevIndex(activeQuestionIndex);
    setElapsedSeconds(0);
    setHintShown(false);
    setAnswer('');
    setIsRecording(false);
  }

  // If no active session, redirect to setup
  useEffect(() => {
    if (!currentSession && !isLoading) {
      navigate(ROUTES.INTERVIEW_SETUP);
    }
  }, [currentSession, navigate, isLoading]);

  // Stopwatch timer logic
  useEffect(() => {
    if (activeQuestionIndex === undefined) return;

    // Clear dictation interval if active
    if (dictationIntervalRef.current) {
      clearInterval(dictationIntervalRef.current);
      dictationIntervalRef.current = null;
    }
    
    // Clear old timer if any
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuestionIndex]);

  // Microphone waveform animation logic
  useEffect(() => {
    micIntervalRef.current = setInterval(() => {
      setMicBars(prev => prev.map(() => Math.floor(Math.random() * 80) + 10));
    }, 150);

    return () => {
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
      if (dictationIntervalRef.current) clearInterval(dictationIntervalRef.current);
    };
  }, []);

  if (isLoading) {
    return <LoadingState message="Analyzing your responses with AI Evaluation Engine..." fullScreen />;
  }

  if (!currentSession) return null;

  const currentQuestion = currentSession.questions[currentSession.activeQuestionIndex];

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (!currentSession) return;
    submitAnswer(answer || 'No response typed.', elapsedSeconds, hintShown);
    
    // Check if it was the last question
    if (currentSession.activeQuestionIndex + 1 >= currentSession.questions.length) {
      completeSession().then((reportId) => {
        navigate(`${ROUTES.FEEDBACK_BASE}/${reportId}`);
      });
    }
  };

  const handleSkip = () => {
    if (!currentSession) return;
    skipQuestion();
    if (currentSession.activeQuestionIndex + 1 >= currentSession.questions.length) {
      completeSession().then((reportId) => {
        navigate(`${ROUTES.FEEDBACK_BASE}/${reportId}`);
      });
    }
  };

  // Simulated Speech-to-Text typing loop
  const handleToggleDictation = () => {
    if (!currentSession) return;
    const currentQuestion = currentSession.questions[currentSession.activeQuestionIndex];

    if (isRecording) {
      if (dictationIntervalRef.current) {
        clearInterval(dictationIntervalRef.current);
        dictationIntervalRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    
    // Simulate speech inputs based on question categories
    const mockSpeechPhrases = currentQuestion.modelAnswer.split('. ');
    let phraseIndex = 0;

    dictationIntervalRef.current = setInterval(() => {
      if (phraseIndex >= mockSpeechPhrases.length) {
        setIsRecording(false);
        if (dictationIntervalRef.current) {
          clearInterval(dictationIntervalRef.current);
          dictationIntervalRef.current = null;
        }
        return;
      }
      
      setAnswer((prev) => {
        const punctuation = prev.trim() ? '. ' : '';
        return prev + punctuation + mockSpeechPhrases[phraseIndex];
      });
      
      phraseIndex++;
    }, 3000);
  };

  const handleCancelSession = () => {
    if (window.confirm('Are you sure you want to end this interview? Your progress will not be saved.')) {
      resetSession();
      navigate(ROUTES.DASHBOARD);
    }
  };

  const totalQuestions = currentSession.questions.length;
  const progressPercent = ((currentSession.activeQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Session Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-app-muted font-bold tracking-widest uppercase">
            ACTIVE ASSESSMENT
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
        </div>
        <button
          onClick={handleCancelSession}
          className="inline-flex items-center space-x-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all cursor-pointer"
        >
          <StopCircle className="h-4 w-4" />
          <span>Exit Simulation</span>
        </button>
      </div>

      {/* Progress indicators bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-app-muted">
          <span>Question progress</span>
          <span>
            <strong className="text-white">{currentSession.activeQuestionIndex + 1}</strong> of{' '}
            <strong className="text-white">{totalQuestions}</strong>
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-app-primary to-app-accent transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Sandbox Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Question Display & Answer Box */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Display Card */}
          <div className="rounded-2xl border border-white/5 bg-app-surface/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-app-accent/10 text-app-accent text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-app-accent/20">
                {currentQuestion.category}
              </span>
              <span className="text-xs text-app-muted font-medium uppercase">
                {currentSession.difficulty} level
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-white leading-snug">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Answer Input Card */}
          <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-6 space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Your Answer
              </span>
              <div className="flex items-center space-x-2 text-xs text-app-muted">
                <Clock className="h-4 w-4 text-app-primary" />
                <span>Timer: <strong className="font-mono text-slate-200">{formatTime(elapsedSeconds)}</strong></span>
              </div>
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your structured solution here. You can also click the microphone to simulate audio input..."
              rows={9}
              className="block w-full rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-white placeholder-slate-500 focus:border-app-primary focus:ring-1 focus:ring-app-primary outline-none transition-all resize-none font-sans leading-relaxed"
            />

            {/* Hint Panel */}
            {hintShown && (
              <div className="rounded-xl border border-dashed border-app-accent/25 bg-app-accent/5 p-4 space-y-1.5 animate-fadeIn">
                <h4 className="text-xs font-bold text-app-accent flex items-center space-x-1">
                  <Lightbulb className="h-4.5 w-4.5" />
                  <span>Interviewer Guidance</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-app-muted leading-relaxed">
                  {currentQuestion.tips.map((tip: string, idx: number) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Answer Control Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setHintShown(!hintShown)}
                  className={`inline-flex items-center space-x-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                    hintShown
                      ? 'bg-app-accent/15 text-app-accent border-app-accent/20'
                      : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>{hintShown ? 'Hide Tip' : 'Get Tip'}</span>
                </button>
                <button
                  onClick={handleToggleDictation}
                  className={`inline-flex items-center space-x-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse text-red-500' : ''}`} />
                  <span>{isRecording ? 'Listening (Click to Stop)' : 'Dictate Speech'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-[11px] text-app-muted font-mono">
                  {answer.trim().length} chars
                </span>
                <button
                  onClick={handleNext}
                  className="inline-flex items-center justify-center space-x-1 rounded-xl bg-app-primary px-4.5 py-2.5 text-xs font-bold text-white hover:bg-app-primary/95 transition-all shadow-md shadow-app-primary/10 cursor-pointer"
                >
                  <span>
                    {currentSession.activeQuestionIndex + 1 === totalQuestions
                      ? 'Complete Simulation'
                      : 'Save & Next'}
                  </span>
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Webcam Simulator & Mic Levels */}
        <div className="space-y-6">
          {/* Webcam Simulator Panel */}
          <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Simulated Video Feed
            </h3>
            
            {/* Aspect Video Grid Box */}
            <div className="relative aspect-video rounded-xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>
              
              {/* Pulsating red recording indicator */}
              <div className="absolute top-3 left-3 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[9px] text-slate-200 font-mono tracking-wider font-semibold">REC LOCK</span>
              </div>

              <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/5">
                <span className="text-[9px] text-slate-400 font-mono">720p HD</span>
              </div>

              {/* Placeholder graphic */}
              <div className="text-center space-y-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-400 border border-white/10">
                  <Video className="h-6 w-6 animate-pulse text-app-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-300">Live Camera Overlay</p>
                  <p className="text-[10px] text-app-muted">Visual assessment capture active</p>
                </div>
              </div>
            </div>

            {/* Audio Waveform Levels */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-[10px] text-app-muted font-semibold uppercase">
                <span>Mic input level</span>
                <span className="text-emerald-400 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                  Active
                </span>
              </div>
              
              {/* Wave bars list */}
              <div className="flex justify-between items-end h-8 bg-slate-950/40 rounded-lg p-2 border border-white/5">
                {micBars.map((h: number, i: number) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1.5 rounded-full bg-app-primary/60 transition-all duration-150"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick instructions guide */}
          <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
              <AlertTriangle className="h-4.5 w-4.5 text-yellow-500/80" />
              <span>Assessment Rules</span>
            </h3>
            
            <ul className="space-y-3 text-[11px] text-app-muted leading-relaxed">
              <li className="flex items-start">
                <span className="h-1.5 w-1.5 rounded-full bg-app-primary mt-1.5 mr-2 shrink-0"></span>
                <span>Type complete, structured responses. Review the hint panel if you get stuck.</span>
              </li>
              <li className="flex items-start">
                <span className="h-1.5 w-1.5 rounded-full bg-app-primary mt-1.5 mr-2 shrink-0"></span>
                <span>You can skip a question if needed. Skipped questions score 0 points.</span>
              </li>
              <li className="flex items-start">
                <span className="h-1.5 w-1.5 rounded-full bg-app-primary mt-1.5 mr-2 shrink-0"></span>
                <span>The timer helps monitor pace. Aim for 2-3 minutes per prompt for optimal evaluations.</span>
              </li>
            </ul>

            <button
              onClick={handleSkip}
              className="flex w-full items-center justify-center space-x-1.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 py-3 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <span>Skip This Question</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

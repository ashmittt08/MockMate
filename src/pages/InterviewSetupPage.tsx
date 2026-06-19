import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
  const { startSession } = useApp();
  const navigate = useNavigate();

  // Selection states
  const [role, setRole] = useState<'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist'>('Frontend');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [type, setType] = useState<'Technical' | 'Behavioral'>('Technical');

  const handleStart = () => {
    startSession(role, difficulty, type);
    navigate('/interview/session');
  };

  const roles = [
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

  const difficulties = [
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
                    onClick={() => setRole(r.id as any)}
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
                    onClick={() => setDifficulty(d.id as any)}
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
              className="flex w-full items-center justify-center space-x-1.5 rounded-xl bg-app-primary py-3.5 text-sm font-semibold text-white hover:bg-app-primary/95 transition-all shadow-md shadow-app-primary/10 cursor-pointer"
            >
              <span>Initialize Simulation</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

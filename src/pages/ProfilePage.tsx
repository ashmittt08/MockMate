import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Award,
  Calendar,
  Zap,
  Clock,
  Save,
  CheckCircle2,
  ChevronRight,
  Sliders
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, interviews, achievements, updateProfile } = useApp();
  const navigate = useNavigate();

  // Local state for profile form editing
  const [name, setName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(name, targetRole, bio);
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2000);
  };

  // Maps achievement icons string references to Lucide React components
  const iconMap: Record<string, any> = {
    Award: Award,
    Calendar: Calendar,
    Zap: Zap,
    Clock: Clock
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Profile & Achievements
        </h1>
        <p className="text-sm text-app-muted mt-1">
          Review your metrics, unlocked certificates, and manage career preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel: Profile settings and stats */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Form */}
          <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-6 space-y-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 border-b border-white/5 pb-4">
              <Sliders className="h-4.5 w-4.5 text-app-primary" />
              <span>Career Settings</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-5">
              {showSavedMsg && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 text-center flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {/* Grid: Name & Target Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-white focus:border-app-primary focus:ring-1 focus:ring-app-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Target Role
                  </label>
                  <input
                    type="text"
                    required
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="block w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-white focus:border-app-primary focus:ring-1 focus:ring-app-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Address Read Only */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address (Verified Sandbox)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email}
                  className="block w-full rounded-xl border border-white/5 bg-slate-950/20 px-4 py-3 text-xs text-slate-500 cursor-not-allowed outline-none"
                />
              </div>

              {/* Biography */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Short Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="block w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-white focus:border-app-primary focus:ring-1 focus:ring-app-primary outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Save Trigger */}
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 rounded-xl bg-app-primary px-5 py-3 text-xs font-bold text-white hover:bg-app-primary/95 transition-all shadow-md shadow-app-primary/10 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

          {/* Interview history list */}
          <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-6 space-y-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 border-b border-white/5 pb-4">
              <Calendar className="h-4.5 w-4.5 text-app-accent" />
              <span>Completed Sandbox Timeline</span>
            </h3>

            {interviews.length > 0 ? (
              <div className="space-y-4">
                {interviews.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => navigate(`/feedback/${rep.id}`)}
                    className="flex justify-between items-center p-4 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-white/[0.01] hover:border-white/10 transition-all cursor-pointer group"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white group-hover:text-app-primary transition-colors">
                        {rep.role} - {rep.type} Module
                      </h4>
                      <p className="text-[10px] text-app-muted">
                        Evaluated {rep.date} | level {rep.difficulty}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`font-mono text-xs font-bold ${
                        rep.overallScore >= 85
                          ? 'text-emerald-400'
                          : rep.overallScore >= 75
                          ? 'text-app-primary'
                          : 'text-orange-400'
                      }`}>
                        {rep.overallScore}%
                      </span>
                      <ChevronRight className="h-4 w-4 text-app-muted group-hover:text-slate-300 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-app-muted">No completed interviews timeline record.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Avatar Card & Achievements */}
        <div className="space-y-6">
          
          {/* Avatar Profile Card */}
          <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-6 text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-app-primary to-app-accent text-2xl font-black text-white uppercase shadow-lg shadow-app-primary/10">
              {user ? getInitials(user.name) : 'MM'}
            </div>
            <div>
              <h3 className="font-bold text-white">{user?.name}</h3>
              <p className="text-[10px] text-app-muted uppercase tracking-wider font-semibold mt-1">
                Target: {user?.targetRole}
              </p>
            </div>
            <div className="border-t border-white/5 pt-4 grid grid-cols-2 text-center text-xs">
              <div className="border-r border-white/5">
                <span className="text-app-muted block text-[10px]">Interviews</span>
                <span className="font-mono font-bold text-white mt-0.5 block">{interviews.length}</span>
              </div>
              <div>
                <span className="text-app-muted block text-[10px]">Unlocked</span>
                <span className="font-mono font-bold text-white mt-0.5 block">
                  {achievements.filter((a) => a.isUnlocked).length} Badges
                </span>
              </div>
            </div>
          </div>

          {/* Achievements badge grid */}
          <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-6 space-y-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 border-b border-white/5 pb-4">
              <Award className="h-4.5 w-4.5 text-app-primary" />
              <span>Achievement Badges</span>
            </h3>

            <div className="space-y-4">
              {achievements.map((ach) => {
                const Icon = iconMap[ach.iconName] || Award;
                return (
                  <div
                    key={ach.id}
                    className={`flex items-start space-x-4 p-3 rounded-xl border transition-all ${
                      ach.isUnlocked
                        ? 'border-app-accent/20 bg-app-accent/5'
                        : 'border-white/5 bg-slate-950/20 opacity-55'
                    }`}
                  >
                    <div className={`rounded-lg p-2 shrink-0 border ${
                      ach.isUnlocked
                        ? 'bg-app-accent/15 text-app-accent border-app-accent/20'
                        : 'bg-white/5 text-slate-500 border-white/5'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="space-y-0.5">
                      <h4 className={`text-xs font-bold ${ach.isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                        {ach.title}
                      </h4>
                      <p className="text-[10px] text-app-muted leading-relaxed">
                        {ach.description}
                      </p>
                      {ach.isUnlocked && ach.unlockedAt && (
                        <span className="text-[9px] text-emerald-400 font-mono block pt-1">
                          Unlocked: {ach.unlockedAt.split('T')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

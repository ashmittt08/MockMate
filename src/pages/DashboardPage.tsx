import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ROUTES } from '../constants/routes';
import {
  Award,
  Video,
  Clock,
  Flame,
  ArrowRight,
  TrendingUp,
  Calendar,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, interviews } = useApp();
  const navigate = useNavigate();

  // Calculations
  const totalInterviews = interviews.length;
  
  const avgScore = totalInterviews > 0 
    ? Math.round(interviews.reduce((acc, curr) => acc + curr.overallScore, 0) / totalInterviews)
    : 0;

  const totalTime = totalInterviews > 0
    ? Math.round((totalInterviews * 15)) // Assume average 15 mins per session
    : 0;

  const streak = totalInterviews > 0 ? 4 : 0; // Simulated practice streak

  // Prepare data for the SVG trend line chart
  const recentReports = [...interviews].reverse(); // oldest to newest
  const scores = recentReports.map((r) => r.overallScore);
  const chartHeight = 120;
  const chartWidth = 500;
  const padding = 20;

  // Build SVG path points
  const points = scores.map((score, index) => {
    if (scores.length === 1) {
      return `${chartWidth / 2},${chartHeight - padding - (score / 100) * (chartHeight - 2 * padding)}`;
    }
    const x = padding + (index / (scores.length - 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - (score / 100) * (chartHeight - 2 * padding);
    return `${x},${y}`;
  });

  const svgPath = points.length > 0 ? `M ${points.join(' L ')}` : '';
  // Gradient fill path
  const svgFillPath = points.length > 0 
    ? `${svgPath} L ${padding + (scores.length - 1) * (chartWidth - 2 * padding) / (scores.length === 1 ? 2 : 1)},${chartHeight - padding} L ${padding},${chartHeight - padding} Z` 
    : '';

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="text-sm text-app-muted mt-1">
            Welcome back, <strong className="text-white font-medium">{user?.displayName || 'User'}</strong>. Ready to practice?
          </p>
        </div>
        <Link
          to={ROUTES.INTERVIEW_SETUP}
          className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-app-primary px-4.5 py-3 text-sm font-semibold text-white hover:bg-app-primary/95 transition-all shadow-md shadow-app-primary/10 self-start sm:self-auto"
        >
          <Video className="h-4 w-4" />
          <span>New Practice Session</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Avg Score */}
        <div className="rounded-2xl border border-white/5 bg-app-surface/40 p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-app-muted uppercase tracking-wider">Avg Score</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-primary/10 text-app-primary border border-app-primary/20">
              <Award className="h-4.5 w-4.5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{avgScore}%</p>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-2">
            <TrendingUp className="h-3 w-3" />
            <span>Simulated target: 85%</span>
          </div>
        </div>

        {/* Card 2: Interviews Done */}
        <div className="rounded-2xl border border-white/5 bg-app-surface/40 p-5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-app-muted uppercase tracking-wider">Sessions</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-accent/10 text-app-accent border border-app-accent/20">
              <Video className="h-4.5 w-4.5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{totalInterviews}</p>
          <p className="text-[11px] text-app-muted mt-2">Completed mock runs</p>
        </div>

        {/* Card 3: Time Practice */}
        <div className="rounded-2xl border border-white/5 bg-app-surface/40 p-5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-app-muted uppercase tracking-wider">Practice Time</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-300 border border-white/10">
              <Clock className="h-4.5 w-4.5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{totalTime}m</p>
          <p className="text-[11px] text-app-muted mt-2">Estimated practice minutes</p>
        </div>

        {/* Card 4: Streak */}
        <div className="rounded-2xl border border-white/5 bg-app-surface/40 p-5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-app-muted uppercase tracking-wider">Streak</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Flame className="h-4.5 w-4.5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{streak} Days</p>
          <p className="text-[11px] text-app-muted mt-2">Consistency multiplier</p>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-app-surface/20 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Performance Trend</span>
              <span className="bg-app-accent/10 text-app-accent text-[10px] font-bold px-2 py-0.5 rounded-full border border-app-accent/15">
                Score Progress
              </span>
            </h3>
            <p className="text-xs text-app-muted mt-1">Review your score progression across mock iterations.</p>
          </div>

          <div className="mt-8 flex justify-center items-center">
            {scores.length > 0 ? (
              <div className="w-full relative h-[140px]">
                {/* SVG Graph */}
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1={padding} x2={chartWidth} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1={chartHeight - padding} x2={chartWidth} y2={chartHeight - padding} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                  {/* Gradient area */}
                  {scores.length > 1 && (
                    <path d={svgFillPath} fill="url(#chartGradient)" />
                  )}

                  {/* Line path */}
                  <path d={svgPath} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Interactive Nodes */}
                  {points.map((pt, idx) => {
                    const [x, y] = pt.split(',');
                    return (
                      <g key={idx} className="group cursor-pointer">
                        <circle cx={x} cy={y} r="5" fill="#1E293B" stroke="#8B5CF6" strokeWidth="2" />
                        <circle cx={x} cy={y} r="8" fill="#8B5CF6" className="opacity-0 group-hover:opacity-30 transition-all duration-150 animate-ping" />
                      </g>
                    );
                  })}
                </svg>
                {/* Axis indicators */}
                <div className="flex justify-between text-[9px] text-app-muted px-2 mt-1">
                  <span>First Practice</span>
                  <span>Latest Practice</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-app-muted">No data points. Complete an interview to view graphs.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Launchpad Panel */}
        <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles className="h-24 w-24 text-app-accent" />
          </div>
          
          <div className="space-y-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-app-accent/10 text-app-accent border border-app-accent/20">
              <Sparkles className="h-5.5 w-5.5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Active Evaluation</h3>
              <p className="text-xs text-app-muted mt-1 leading-relaxed">
                Test yourself with 3 role-specific questions. Receive an instant breakdown of accuracy, fluency, strengths, and sample answers.
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <Link
              to={ROUTES.INTERVIEW_SETUP}
              className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-app-primary to-app-accent px-4 py-3.5 text-xs font-semibold text-white hover:brightness-110 transition-all shadow-md shadow-app-primary/10"
            >
              <span>Setup Interview Track</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={ROUTES.PROFILE}
              className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-app-text hover:bg-white/10 transition-colors"
            >
              View Achievement Badges
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Interviews History Table */}
      <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-6">
        <h3 className="text-lg font-bold text-white">Recent Interview Sessions</h3>
        <p className="text-xs text-app-muted mt-1">Direct dashboard logs of your historical evaluations.</p>

        <div className="mt-6 overflow-x-auto">
          {totalInterviews > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase font-semibold text-app-muted tracking-wider">
                  <th className="pb-3 pr-4">Role & Track</th>
                  <th className="pb-3 px-4">Evaluation Type</th>
                  <th className="pb-3 px-4">Date Completed</th>
                  <th className="pb-3 px-4 text-center">Score</th>
                  <th className="pb-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {interviews.slice(0, 5).map((report) => (
                  <tr key={report.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 pr-4">
                      <div>
                        <p className="font-bold text-white">{report.role}</p>
                        <p className="text-[11px] text-app-muted">{report.difficulty} level</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium border ${
                        report.type === 'Technical'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-app-muted text-xs">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{report.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-mono text-sm font-bold ${
                        report.overallScore >= 85
                          ? 'text-emerald-400'
                          : report.overallScore >= 75
                          ? 'text-app-primary'
                          : 'text-orange-400'
                      }`}>
                        {report.overallScore}%
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button
                        onClick={() => navigate(`${ROUTES.FEEDBACK_BASE}/${report.id}`)}
                        className="inline-flex items-center space-x-1 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-all border border-white/5 group-hover:border-white/10"
                      >
                        <span>Report</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-app-muted mb-4">You have not completed any practice sessions yet.</p>
              <Link
                to={ROUTES.INTERVIEW_SETUP}
                className="inline-flex items-center space-x-1 text-xs text-app-primary hover:underline font-semibold"
              >
                <span>Launch your first simulation</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

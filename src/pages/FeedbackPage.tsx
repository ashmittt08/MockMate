import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { ROUTES } from '../constants/routes';
import type { FeedbackSuggestion } from '../types';

export const FeedbackPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { getReportById } = useApp();
  const navigate = useNavigate();
  
  const report = getReportById(reportId || '');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  if (!report) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-white">Report Not Found</h2>
        <p className="text-app-muted">The feedback report you are looking for does not exist or has expired.</p>
        <Link
          to={ROUTES.DASHBOARD}
          className="inline-flex items-center space-x-1.5 rounded-xl bg-app-primary px-4.5 py-2.5 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Circular progress math
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (circumference * report.overallScore) / 100;

  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 75) return 'text-app-primary';
    return 'text-orange-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 75) return 'bg-app-primary/10 border-app-primary/20';
    return 'bg-orange-500/10 border-orange-500/20';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Back Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to={ROUTES.DASHBOARD}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Evaluation Report
            </h1>
            <p className="text-xs text-app-muted mt-0.5">
              Completed on <strong className="text-slate-300 font-medium">{report.date}</strong> | {report.role} - {report.type}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}
            className="inline-flex items-center space-x-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Practice Again</span>
          </button>
        </div>
      </div>

      {/* Hero Scores Card */}
      <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Circular SVG Gauge */}
          <div className="flex flex-col items-center text-center space-y-3 md:border-r md:border-white/5 md:pr-8">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Foreground Score Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-app-primary"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner score content */}
              <div className="absolute text-center">
                <span className="text-3xl font-black text-white font-mono">{report.overallScore}%</span>
                <span className="text-[10px] text-app-muted block uppercase tracking-wider font-semibold">Overall</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border ${getScoreBg(report.overallScore)} ${getScoreColor(report.overallScore)}`}>
                {report.overallScore >= 85 ? 'Qualified Core' : report.overallScore >= 75 ? 'Satisfactory' : 'Needs Practice'}
              </span>
            </div>
          </div>

          {/* Subscores sliders */}
          <div className="md:col-span-2 space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dimension Breakdown</h3>
            
            {/* Slider 1: Accuracy */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-app-text font-medium">Technical Accuracy</span>
                <span className="font-mono text-slate-300">{report.accuracyScore}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${report.accuracyScore}%` }}
                ></div>
              </div>
            </div>

            {/* Slider 2: Communication */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-app-text font-medium">Communication Clarity</span>
                <span className="font-mono text-slate-300">{report.communicationScore}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${report.communicationScore}%` }}
                ></div>
              </div>
            </div>

            {/* Slider 3: Completeness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-app-text font-medium">Completeness & Coverage</span>
                <span className="font-mono text-slate-300">{report.completenessScore}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${report.completenessScore}%` }}
                ></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <ThumbsUp className="h-4.5 w-4.5 text-emerald-400" />
            <span>Key Strengths Identified</span>
          </h3>
          <ul className="space-y-3">
            {report.strengths.map((str: string, idx: number) => (
              <li key={idx} className="flex items-start text-xs text-app-muted leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 mr-2.5 shrink-0"></span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses Card */}
        <div className="rounded-2xl border border-white/5 bg-app-surface/20 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <ThumbsDown className="h-4.5 w-4.5 text-orange-400" />
            <span>Areas for Improvement</span>
          </h3>
          <ul className="space-y-3">
            {report.weaknesses.map((weak: string, idx: number) => (
              <li key={idx} className="flex items-start text-xs text-app-muted leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 mr-2.5 shrink-0"></span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Question-by-Question Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Detailed Responses Analysis
        </h3>

        <div className="space-y-3">
          {report.suggestions.map((item: FeedbackSuggestion, idx: number) => {
            const isExpanded = expandedQuestion === idx;
            return (
              <div
                key={item.questionId}
                className="rounded-2xl border border-white/5 bg-app-surface/20 overflow-hidden"
              >
                {/* Header accordion trigger */}
                <button
                  onClick={() => toggleQuestion(idx)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.01] transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-4 pr-6">
                    <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${getScoreBg(item.score)} ${getScoreColor(item.score)} border`}>
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">{item.questionText}</h4>
                      <p className="text-[11px] text-app-muted mt-1">
                        Question score:{' '}
                        <strong className={`${getScoreColor(item.score)} font-mono`}>{item.score}%</strong>
                      </p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-app-muted" /> : <ChevronDown className="h-4 w-4 text-app-muted" />}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-5 space-y-6 bg-slate-900/20 text-xs">
                    {/* User Response block */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-300 uppercase tracking-wide text-[10px]">Your Response</h5>
                      <div className="rounded-xl bg-slate-950/40 p-4 border border-white/5 font-mono text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                        {item.userAnswer}
                      </div>
                    </div>

                    {/* AI Feedback block */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-app-accent uppercase tracking-wide text-[10px] flex items-center space-x-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Evaluation Analysis & Coaching</span>
                      </h5>
                      <p className="text-app-muted leading-relaxed pl-1">
                        {item.feedbackText}
                      </p>
                    </div>

                    {/* Model Answer block */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-300 uppercase tracking-wide text-[10px] flex items-center space-x-1">
                        <BookOpen className="h-3.5 w-3.5 text-app-primary" />
                        <span>FAANG Model Answer Blueprint</span>
                      </h5>
                      <div className="rounded-xl bg-app-primary/5 p-4 border border-app-primary/10 text-slate-300 leading-relaxed font-sans">
                        {item.modelAnswer}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

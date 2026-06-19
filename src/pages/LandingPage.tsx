import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { useApp } from '../context/AppContext';
import {
  Video,
  Award,
  Sparkles,
  Zap,
  BarChart3,
  Clock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useApp();

  const features = [
    {
      icon: Sparkles,
      title: 'Interactive Evaluation',
      description: 'Our scoring engine grades your technical terminology, completeness, and framework accuracy instantly.'
    },
    {
      icon: Video,
      title: 'Interactive Simulator',
      description: 'Simulate face-to-face pressures with active camera overlays, timer counters, and visual microphone waveforms.'
    },
    {
      icon: BarChart3,
      title: 'Granular Scorecarding',
      description: 'Review performance across three separate dimensions: Technical Accuracy, Communication Clarity, and Completeness.'
    },
    {
      icon: Zap,
      title: 'Targeted Role Prep',
      description: 'Choose specialized question sets for Frontend, Backend, Product Management, or Data Science tracks.'
    },
    {
      icon: Clock,
      title: 'Pacing Analytics',
      description: 'Track how quickly you explain concepts. Achieve the sweet spot between detailed explanation and concise summaries.'
    },
    {
      icon: ShieldCheck,
      title: 'Structured Improvement',
      description: 'Identify strengths and weaknesses and study detailed model answers compiled by expert FAANG interviewers.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Configure Your Track',
      desc: 'Pick your career track, target difficulty (Easy, Medium, Hard), and select either Behavioral or deep Technical modules.'
    },
    {
      num: '02',
      title: 'Conduct the Simulation',
      desc: 'Answer realistic prompts under simulated pressure with pacing timers, AI-coach hints, and audio indicators.'
    },
    {
      num: '03',
      title: 'Get Immediate Analysis',
      desc: 'Instantly download your feedback card, examine score graphs, identify weak spots, and practice model solutions.'
    }
  ];

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        {/* Background glow filters */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-app-primary/10 blur-[80px]"></div>
        <div className="absolute top-1/3 left-1/3 -z-10 h-64 w-64 rounded-full bg-app-accent/10 blur-[100px]"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-3xl">
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-app-primary">
              <Sparkles className="h-3.5 w-3.5 text-app-accent animate-pulse" />
              <span className="font-semibold text-slate-200">The Modern Way to Ace Technical Interviews</span>
            </div>

            {/* Title */}
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white">
              Ace technical interviews.
              <br />
              <span className="bg-gradient-to-r from-app-primary via-indigo-300 to-app-accent bg-clip-text text-transparent">
                Interactive mock rounds.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg md:text-xl text-app-muted max-w-2xl mx-auto leading-relaxed">
              Ditch static question lists for custom simulations and detailed model answers.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to={user ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-app-primary px-6 py-3.5 text-base font-semibold text-white hover:bg-app-primary/95 transition-all shadow-lg shadow-app-primary/15"
              >
                <span>Practice For Free</span>
                <ChevronRight className="h-4.5 w-4.5 ml-1" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 py-3.5 text-base font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              >
                Learn More
              </a>
            </div>

            {/* Social Trust Metrics */}
            <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-app-muted">
              <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-1 text-emerald-400" /> Free Tier Available</span>
              <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-1 text-emerald-400" /> 100% Frontend-Only Sandbox</span>
              <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-1 text-emerald-400" /> No Card Required</span>
            </div>
          </div>

          {/* Interactive Interface Mockup */}
          <div className="mt-16 sm:mt-20 lg:mt-24 mx-auto max-w-5xl rounded-2xl glassmorphism p-3 shadow-2xl relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-app-primary/5 to-app-accent/5 pointer-events-none"></div>
            <div className="rounded-xl bg-app-bg/85 overflow-hidden border border-white/5">
              {/* Window Controls bar */}
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 bg-app-bg">
                <div className="flex space-x-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/80"></span>
                  <span className="h-3 w-3 rounded-full bg-yellow-500/80"></span>
                  <span className="h-3 w-3 rounded-full bg-green-500/80"></span>
                </div>
                <div className="rounded-md bg-white/5 px-8 py-1 text-[11px] text-app-muted border border-white/5 font-mono">
                  https://app.mockmate.io/session/active
                </div>
                <div className="w-10"></div>
              </div>

              {/* Mock Application Interface Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 text-left">
                {/* Left Panel: Question */}
                <div className="md:col-span-2 p-6 border-r border-white/5 space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="bg-app-primary/10 text-app-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-app-primary/20">
                      Technical Question
                    </span>
                    <span className="text-xs text-app-muted">React Fundamentals</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    Explain the concept of React Reconciliation and how the Virtual DOM works under the hood.
                  </h3>
                  <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5">
                    <div className="flex items-center space-x-1.5 text-xs text-app-primary font-mono mb-2">
                      <span>candidate_answer.md</span>
                    </div>
                    <p className="text-sm font-mono text-slate-300 leading-relaxed">
                      React creates a copy of the browser DOM in memory, called the Virtual DOM. When state changes, a new tree is built and compared against the old one using a fast O(n) diffing...
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-app-muted">
                      <Clock className="h-4 w-4 text-app-accent" />
                      <span>Elapsed time: <strong className="text-slate-200">01:42</strong></span>
                    </div>
                    <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-app-muted">
                      Submit Response
                    </span>
                  </div>
                </div>

                {/* Right Panel: Simulated Video Overlay */}
                <div className="p-6 bg-slate-900/40 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                      <div className="text-center">
                        <Users className="h-8 w-8 text-app-muted mx-auto opacity-75" />
                        <span className="text-[10px] text-app-muted block mt-1.5 font-medium">Video Simulator Feed</span>
                      </div>
                      <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                        <span className="text-[9px] text-slate-300 font-mono">REC</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-app-muted">
                        <span>Audio level indicator</span>
                        <span className="text-emerald-400">Optimal</span>
                      </div>
                      <div className="flex items-center space-x-1 h-3">
                        <span className="flex-1 rounded-sm bg-emerald-500/80 h-1.5"></span>
                        <span className="flex-1 rounded-sm bg-emerald-500/80 h-2"></span>
                        <span className="flex-1 rounded-sm bg-emerald-500/80 h-2.5"></span>
                        <span className="flex-1 rounded-sm bg-emerald-500/80 h-2 animate-pulse"></span>
                        <span className="flex-1 rounded-sm bg-emerald-500/80 h-1"></span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-app-accent/20 bg-app-accent/5 p-3 text-xs text-app-muted leading-relaxed">
                    <strong className="text-app-accent block mb-0.5">💡 Interview Tip</strong>
                    Make sure to mention standard diff algorithms and the importance of key properties.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 border-t border-white/5 bg-slate-900/30 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for absolute confidence
            </h2>
            <p className="mt-4 text-app-muted leading-relaxed">
              MockMate simulates exact tech-firm conditions so you can refine content depth, communication speed, and formatting models before meeting hiring panels.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-white/5 bg-app-surface/40 p-6 glow-card"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-app-primary/10 text-app-primary mb-5 border border-app-primary/15">
                    <Icon className="h-6 w-6 text-app-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                  <p className="mt-3 text-sm text-app-muted leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Three Steps to Practice Perfection
            </h2>
            <p className="mt-4 text-app-muted leading-relaxed">
              We focus on a quick, highly repetitive learning loop. Test, evaluate, learn the model, repeat.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-3 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden lg:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-app-primary/10 via-app-accent/20 to-app-primary/10 -z-10"></div>
            
            {steps.map((step) => (
              <div key={step.num} className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-app-primary/10 to-app-accent/10 text-xl font-mono font-bold text-white border border-white/10 shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-white mt-4">{step.title}</h3>
                <p className="text-sm text-app-muted leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Conversion Banner */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-br from-app-surface via-slate-900 to-app-bg p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-app-primary/10 blur-[80px]"></div>
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-app-accent/10 blur-[80px]"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to clear the loops?
            </h2>
            <p className="mt-4 text-app-muted text-sm sm:text-base leading-relaxed">
              Create your free sandbox profile now. Select your role, solve questions, and access dynamic evaluation scorecards immediately.
            </p>
            <div className="mt-8">
              <Link
                to={user ? "/dashboard" : "/signup"}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-white text-slate-900 px-6 py-3.5 font-bold hover:bg-slate-100 transition-colors shadow-lg"
              >
                <span>Get Started Now</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Footer */}
      <footer className="border-t border-white/5 bg-app-bg py-12 text-xs text-app-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-app-primary to-app-accent text-white">
                <Award className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-bold text-white">MockMate</span>
            </div>
            <p className="leading-relaxed">
              Interactive sandbox tools for engineering and product professionals. Practice, optimize, and land roles.
            </p>
            <p className="pt-2 text-[10px] text-slate-600">
              © 2026 MockMate. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-300 mb-3 uppercase tracking-wider text-[10px]">Careers Prep</h4>
            <ul className="space-y-2">
              <li><Link to="/signup" className="hover:text-app-text transition-colors">Frontend Modules</Link></li>
              <li><Link to="/signup" className="hover:text-app-text transition-colors">Backend Modules</Link></li>
              <li><Link to="/signup" className="hover:text-app-text transition-colors">Product Management</Link></li>
              <li><Link to="/signup" className="hover:text-app-text transition-colors">Data Science Tracks</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-300 mb-3 uppercase tracking-wider text-[10px]">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-app-text transition-colors">Features list</a></li>
              <li><a href="#how-it-works" className="hover:text-app-text transition-colors">How it works</a></li>
              <li><Link to="/login" className="hover:text-app-text transition-colors">Sign in</Link></li>
              <li><Link to="/signup" className="hover:text-app-text transition-colors">Sign up sandbox</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-300 mb-3 uppercase tracking-wider text-[10px]">Legal & Project</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-600">Privacy Policy</span></li>
              <li><span className="text-slate-600">Terms of Use</span></li>
              <li><span className="text-slate-600">FAANG Standards</span></li>
              <li><span className="text-slate-600">Frontend Mockup</span></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

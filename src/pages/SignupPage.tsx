import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Award, User as UserIcon, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ROUTES } from '../constants/routes';

export const SignupPage: React.FC = () => {
  const { loginWithGoogle } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Email/password authentication is disabled. Please sign up using Google.');
  };

  const handleGoogleSignup = async () => {
    setError('');
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate(ROUTES.DASHBOARD);
      } else {
        setError('Google sign up failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full bg-app-primary/10 blur-[80px]"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-app-accent/10 blur-[80px]"></div>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to={ROUTES.LANDING} className="inline-flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-app-primary to-app-accent text-white">
              <Award className="h-5.5 w-5.5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">MockMate</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-app-muted">
            Start practicing with interactive simulations today
          </p>
        </div>

        {/* Card */}
        <div className="glassmorphism rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3.5 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <UserIcon className="h-4.5 w-4.5 text-app-muted" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="block w-full rounded-xl border border-white/10 bg-slate-900/50 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-app-primary focus:ring-1 focus:ring-app-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-app-muted" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full rounded-xl border border-white/10 bg-slate-900/50 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-app-primary focus:ring-1 focus:ring-app-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-app-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min. 6 chars)"
                  className="block w-full rounded-xl border border-white/10 bg-slate-900/50 pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:border-app-primary focus:ring-1 focus:ring-app-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-app-muted hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl bg-app-primary py-3.5 text-sm font-semibold text-white hover:bg-app-primary/95 transition-all shadow-md shadow-app-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Free Account</span>
              )}
            </button>
          </form>

          {/* Social login line */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/40 px-2 text-app-muted tracking-wider">Or register with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-1">
            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="flex items-center justify-center rounded-xl border border-white/10 bg-slate-900/50 py-2.5 text-xs font-semibold text-app-text hover:bg-white/5 transition-all disabled:opacity-50"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.68 1.34 7.61l3.85 2.99C6.11 7.22 8.84 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.45c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.49z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.19 14.4c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.34 6.83C.49 8.53 0 10.42 0 12.4s.49 3.87 1.34 5.57l3.85-2.99z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.16 0-5.89-2.18-6.85-5.56L1.3 15.77C3.33 19.7 7.31 23 12 23z"
                />
              </svg>
              Google
            </button>
          </div>
        </div>

        {/* Link to Login */}
        <p className="text-center text-sm text-app-muted">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-app-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

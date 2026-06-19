import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Award, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    // Simulate simple validation
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(email);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick auto-fill helper for ease of demoing
  const handleAutoFill = () => {
    setEmail('sarah.connor@mockmate.ai');
    setPassword('secret123');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full bg-app-primary/10 blur-[80px]"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-app-accent/10 blur-[80px]"></div>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-app-primary to-app-accent text-white">
              <Award className="h-5.5 w-5.5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">MockMate</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-app-muted">
            Sign in to start practicing your mock sessions
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs text-app-primary hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-app-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Auto-Fill helper */}
          <div className="mt-4 text-center">
            <button
              onClick={handleAutoFill}
              className="text-[11px] font-mono text-app-accent hover:underline bg-app-accent/5 rounded px-2.5 py-1 border border-app-accent/15"
            >
              ⚡ Click here to Autofill Demo Credentials
            </button>
          </div>

          {/* Social login line */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/40 px-2 text-app-muted tracking-wider">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  login('sso.github@mockmate.ai').then(() => navigate('/dashboard'));
                }, 1000);
              }}
              className="flex items-center justify-center rounded-xl border border-white/10 bg-slate-900/50 py-2.5 text-xs font-semibold text-app-text hover:bg-white/5 transition-all"
            >
              <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              GitHub
            </button>
            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  login('sso.google@mockmate.ai').then(() => navigate('/dashboard'));
                }, 1000);
              }}
              className="flex items-center justify-center rounded-xl border border-white/10 bg-slate-900/50 py-2.5 text-xs font-semibold text-app-text hover:bg-white/5 transition-all"
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

        {/* Link to Signup */}
        <p className="text-center text-sm text-app-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-app-primary hover:underline">
            Create an account for free
          </Link>
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, Award, ChevronRight } from 'lucide-react';
import { ROUTES } from '../constants/routes';

export const Navbar: React.FC = () => {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-app-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to={ROUTES.LANDING} className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-app-primary to-app-accent text-white shadow-lg shadow-app-primary/20">
            <Award className="h-5.5 w-5.5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-app-text bg-gradient-to-r from-app-text via-slate-100 to-app-muted bg-clip-text">
            MockMate
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm text-app-muted hover:text-app-text transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-app-muted hover:text-app-text transition-colors">
            How It Works
          </a>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <Link
              to={ROUTES.DASHBOARD}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-app-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-app-primary/95 transition-all shadow-md shadow-app-primary/10"
            >
              <span>Go to Dashboard</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} className="text-sm font-medium text-app-muted hover:text-app-text transition-colors">
                Log In
              </Link>
              <Link
                to={ROUTES.SIGNUP}
                className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-app-text hover:bg-white/15 transition-all border border-white/5"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-app-muted hover:bg-white/5 hover:text-app-text md:hidden transition-all"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-white/5 bg-app-bg px-4 pt-2 pb-6 space-y-4">
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-base font-medium text-app-muted hover:bg-white/5 hover:text-app-text rounded-lg transition-all"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-base font-medium text-app-muted hover:bg-white/5 hover:text-app-text rounded-lg transition-all"
          >
            How It Works
          </a>
          <div className="border-t border-white/5 pt-4 flex flex-col space-y-3">
            {user ? (
              <Link
                to={ROUTES.DASHBOARD}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center space-x-1.5 rounded-lg bg-app-primary py-2.5 text-base font-semibold text-white hover:bg-app-primary/95 transition-all"
              >
                <span>Go to Dashboard</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setIsOpen(false)}
                  className="block text-center py-2.5 text-base font-medium text-app-muted hover:text-app-text transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  onClick={() => setIsOpen(false)}
                  className="block text-center rounded-lg bg-white/10 py-2.5 text-base font-semibold text-app-text hover:bg-white/15 transition-all border border-white/5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

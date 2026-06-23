import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Video, User, LogOut, Award } from 'lucide-react';
import { ROUTES } from '../constants/routes';

export const Sidebar: React.FC = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const navItems = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'New Interview', path: ROUTES.INTERVIEW_SETUP, icon: Video },
    { name: 'Profile & Stats', path: ROUTES.PROFILE, icon: User }
  ];

  const getInitials = (name: string) => {
    if (!name) return 'MM';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col border-r border-white/5 bg-app-bg/50 backdrop-blur-md px-4 py-6 sticky top-0">
        {/* Brand Header */}
        <div className="flex items-center space-x-2 px-2 pb-6 border-b border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-app-primary to-app-accent text-white">
            <Award className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-app-text">
            MockMate
          </span>
          <span className="text-[10px] font-semibold bg-app-primary/10 text-app-primary border border-app-primary/20 rounded-full px-2 py-0.5 ml-1">
            Beta
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 mt-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== ROUTES.DASHBOARD && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive: linkActive }) =>
                  `flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    linkActive || isActive
                      ? 'bg-app-primary text-white shadow-md shadow-app-primary/15'
                      : 'text-app-muted hover:bg-white/5 hover:text-app-text'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile & Logout section */}
        <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
          {user && (
            <div className="flex items-center space-x-3 px-2 py-1">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-10 w-10 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-app-accent to-app-primary text-sm font-semibold text-white uppercase">
                  {getInitials(user.displayName || '')}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-app-text">{user.displayName || 'User'}</p>
                <p className="truncate text-[11px] text-app-muted">Candidate</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium text-app-muted hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/15"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-white/5 bg-app-bg/90 backdrop-blur-lg px-2 justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== ROUTES.DASHBOARD && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive: linkActive }) =>
                `flex flex-col items-center justify-center w-20 py-1 text-[10px] font-medium transition-all ${
                  linkActive || isActive ? 'text-app-primary' : 'text-app-muted'
                }`
              }
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
        
        {/* Quick Log Out on Mobile */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-20 py-1 text-[10px] font-medium text-app-muted hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5 mb-0.5" />
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
};

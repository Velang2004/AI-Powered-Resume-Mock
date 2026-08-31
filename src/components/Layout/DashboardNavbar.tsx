import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FileText,
  Gauge,
  Bot,
  Briefcase,
  BarChart3,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  UserCheck,
  Building2,
  Shield,
  MessageSquare,
} from 'lucide-react';

export type NavTab = 'builder' | 'ats' | 'interview' | 'jobs' | 'analytics';

interface DashboardNavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenCopilot: () => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenCopilot,
}) => {
  const { user, logout, updateUser, authProvider } = useAuth();
  const { isDark, setTheme } = useTheme();

  const handleRoleSwitch = (newRole: any) => {
    updateUser({ role: newRole });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
                  ResumeAI Intel
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  v2.4
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium hidden sm:block">
                Recruitment Intelligence Suite
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => onTabChange('builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'builder'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume Builder</span>
            </button>

            <button
              onClick={() => onTabChange('ats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'ats'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>ATS Scanner</span>
            </button>

            <button
              onClick={() => onTabChange('interview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'interview'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Voice Interview Coach</span>
            </button>

            <button
              onClick={() => onTabChange('jobs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'jobs'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Jobs & Matching</span>
            </button>

            <button
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Right Controls & Profile */}
          <div className="flex items-center gap-2">
            {/* Copilot Quick Launch */}
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1 px-3 py-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Role Switcher Pill */}
            {user && (
              <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[10px] font-bold">
                <button
                  onClick={() => handleRoleSwitch('candidate')}
                  className={`px-2 py-1 rounded-lg transition ${
                    user.role === 'candidate'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Candidate
                </button>
                <button
                  onClick={() => handleRoleSwitch('recruiter')}
                  className={`px-2 py-1 rounded-lg transition ${
                    user.role === 'recruiter'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Recruiter
                </button>
                <button
                  onClick={() => handleRoleSwitch('admin')}
                  className={`px-2 py-1 rounded-lg transition ${
                    user.role === 'admin'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Admin
                </button>
              </div>
            )}

            {/* User Profile & Sign Out */}
            {user && (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-400 font-semibold text-xs transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

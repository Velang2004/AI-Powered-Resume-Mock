import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldAlert,
  UserCheck,
  Building2,
  Shield,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
} from 'lucide-react';

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onNavigateToVerify: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignup,
  onNavigateToVerify,
}) => {
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState('velan@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnverifiedError, setIsUnverifiedError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUnverifiedError(false);
    setIsLoading(true);

    try {
      await login({ email: email.trim(), password });
    } catch (err: any) {
      if (err.code === 'UNVERIFIED_BOTH' || err.code === 'UNVERIFIED_EMAIL' || err.code === 'UNVERIFIED_MOBILE') {
        setIsUnverifiedError(true);
      }
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async (role: UserRole) => {
    setError(null);
    setIsLoading(true);
    try {
      await loginDemo(role);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            ResumeAI Intel
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in to access your resumes, ATS scoring, and interview portal
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            className="py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs flex items-center justify-center gap-1.5 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Unverified Security Alert */}
        {isUnverifiedError && (
          <div className="mb-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs space-y-2 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Verification Required</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Your account requires verification before accessing the dashboard.
            </p>
            <button
              onClick={onNavigateToVerify}
              className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition"
            >
              Go to Verification Center
            </button>
          </div>
        )}

        {error && !isUnverifiedError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In to Dashboard...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick 1-Click Demo Logins */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            One-Click Test Profiles
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handleDemoSignIn('candidate')}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:border-blue-300 dark:bg-slate-800 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition flex flex-col items-center gap-1 text-[11px]"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Candidate</span>
            </button>

            <button
              onClick={() => handleDemoSignIn('recruiter')}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:border-indigo-300 dark:bg-slate-800 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition flex flex-col items-center gap-1 text-[11px]"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Recruiter</span>
            </button>

            <button
              onClick={() => handleDemoSignIn('admin')}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-purple-50 hover:border-purple-300 dark:bg-slate-800 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition flex flex-col items-center gap-1 text-[11px]"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            onClick={onNavigateToSignup}
            className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <span>Create one now</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

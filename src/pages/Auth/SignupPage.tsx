import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  User,
  Mail,
  Lock,
  Smartphone,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
} from 'lucide-react';

interface SignupPageProps {
  onNavigateToLogin: () => void;
  onNavigateToVerify: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onNavigateToLogin,
  onNavigateToVerify,
}) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!password) {
      setError('Please provide a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        mobile: mobile.trim() || '+1 555 123 4567',
        role,
      });
      // Register will auto-authenticate in AuthContext and switch straight to Dashboard!
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your credentials.');
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
            Create an Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Join the Next-Gen AI Resume & Recruitment Platform
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className="py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs flex items-center justify-center gap-1.5 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                placeholder="e.g. Alex Johnson"
              />
            </div>
          </div>

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
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                placeholder="alex@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                placeholder="+1 555 123 4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {password && confirmPassword && (
            <div className="text-[11px] flex items-center gap-1.5">
              {password === confirmPassword ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                </span>
              ) : (
                <span className="text-red-500 dark:text-red-400 font-semibold">
                  Passwords do not match
                </span>
              )}
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`py-2 px-3 rounded-xl border text-center font-semibold transition ${
                  role === 'candidate'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Candidate / Job Seeker
              </button>

              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`py-2 px-3 rounded-xl border text-center font-semibold transition ${
                  role === 'recruiter'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Recruiter / Talent Lead
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account & Loading Dashboard...</span>
              </>
            ) : (
              <>
                <span>Create Account & Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <button
            onClick={onNavigateToLogin}
            className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

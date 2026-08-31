import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Loader2,
  Lock,
  KeyRound,
} from 'lucide-react';

interface VerifyAccountPageProps {
  onNavigateToLogin: () => void;
  onVerificationComplete: () => void;
}

export const VerifyAccountPage: React.FC<VerifyAccountPageProps> = ({
  onNavigateToLogin,
  onVerificationComplete,
}) => {
  const {
    pendingVerification,
    verifyEmail,
    verifyMobile,
    resendMobileOtp,
    resendEmailVerification,
    simulatedMessages,
    login,
  } = useAuth();

  // State
  const [tokenInput, setTokenInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [emailVerified, setEmailVerified] = useState(pendingVerification?.email_verified || false);
  const [mobileVerified, setMobileVerified] = useState(pendingVerification?.mobile_verified || false);
  const [countdown, setCountdown] = useState(45);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingMobile, setIsVerifyingMobile] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync token or plainOtp if available from pending state or live stream
  useEffect(() => {
    if (pendingVerification?.emailToken && !tokenInput) {
      setTokenInput(pendingVerification.emailToken);
    }
    if (pendingVerification?.plainOtp && !otpInput) {
      setOtpInput(pendingVerification.plainOtp);
    }
  }, [pendingVerification]);

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleVerifyEmail = async () => {
    if (!tokenInput.trim()) return;
    setIsVerifyingEmail(true);
    setStatusMessage(null);
    try {
      await verifyEmail(tokenInput.trim());
      setEmailVerified(true);
      setStatusMessage({ text: 'Email verified successfully!', type: 'success' });
    } catch (e: any) {
      setStatusMessage({ text: e.message || 'Invalid or expired email token', type: 'error' });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleVerifyMobile = async () => {
    if (!otpInput.trim()) return;
    setIsVerifyingMobile(true);
    setStatusMessage(null);
    try {
      await verifyMobile(otpInput.trim(), pendingVerification?.mobile, pendingVerification?.userId);
      setMobileVerified(true);
      setStatusMessage({ text: 'Mobile OTP verified successfully!', type: 'success' });
    } catch (e: any) {
      setStatusMessage({ text: e.message || 'Invalid or expired 6-digit OTP', type: 'error' });
    } finally {
      setIsVerifyingMobile(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    setStatusMessage(null);
    try {
      const newOtp = await resendMobileOtp(pendingVerification?.mobile, pendingVerification?.userId);
      if (newOtp) setOtpInput(newOtp);
      setCountdown(45);
      setStatusMessage({ text: 'A fresh 6-digit OTP has been dispatched to your mobile!', type: 'success' });
    } catch (e: any) {
      setStatusMessage({ text: e.message || 'Failed to resend OTP', type: 'error' });
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleResendEmail = async () => {
    setStatusMessage(null);
    try {
      const newToken = await resendEmailVerification(pendingVerification?.email, pendingVerification?.userId);
      if (newToken) setTokenInput(newToken);
      setStatusMessage({ text: 'A new verification link has been sent to your email!', type: 'success' });
    } catch (e: any) {
      setStatusMessage({ text: e.message || 'Failed to resend verification email', type: 'error' });
    }
  };

  const bothVerified = emailVerified && mobileVerified;

  const handleContinueToDashboard = () => {
    onNavigateToLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/80 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            2-Factor Account Verification
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete both requirements to activate your account and obtain JWT access.
          </p>
        </div>

        {/* Status Toast Message */}
        {statusMessage && (
          <div
            className={`mb-5 p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* STEP 1: EMAIL VERIFICATION */}
          <div
            className={`p-5 rounded-2xl border transition ${
              emailVerified
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    emailVerified ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                    Step 1: Email Token Verification
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {pendingVerification?.email || 'user@example.com'}
                  </span>
                </div>
              </div>

              {emailVerified ? (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-full font-bold text-[10px]">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-full font-bold text-[10px]">
                  Pending
                </span>
              )}
            </div>

            {!emailVerified && (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Enter email token (or click token in Live Stream bottom-right)"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-mono"
                  />
                  <button
                    onClick={handleVerifyEmail}
                    disabled={isVerifyingEmail || !tokenInput}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition text-xs shadow-xs"
                  >
                    {isVerifyingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                  </button>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Check Live Email stream or click Resend.</span>
                  <button onClick={handleResendEmail} className="text-blue-600 hover:underline font-semibold">
                    Resend Email Link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: MOBILE SMS OTP */}
          <div
            className={`p-5 rounded-2xl border transition ${
              mobileVerified
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    mobileVerified ? 'bg-emerald-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                    Step 2: 6-Digit Mobile SMS OTP
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {pendingVerification?.mobile || '+91 98765 43210'}
                  </span>
                </div>
              </div>

              {mobileVerified ? (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-full font-bold text-[10px]">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-full font-bold text-[10px]">
                  Pending
                </span>
              )}
            </div>

            {!mobileVerified && (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP (e.g. 849201)"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-mono text-center tracking-widest font-bold"
                  />
                  <button
                    onClick={handleVerifyMobile}
                    disabled={isVerifyingMobile || otpInput.length !== 6}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition text-xs shadow-xs"
                  >
                    {isVerifyingMobile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify OTP'}
                  </button>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">
                    {countdown > 0 ? `Resend available in ${countdown}s` : 'Did not receive code?'}
                  </span>
                  <button
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || isResendingOtp}
                    className="text-blue-600 disabled:text-slate-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isResendingOtp ? 'animate-spin' : ''}`} />
                    <span>Resend OTP</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completion Action */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          {bothVerified ? (
            <button
              onClick={handleContinueToDashboard}
              className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition animate-in bounce-in duration-300"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Account Activated! Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-center text-xs text-slate-400">
              Please verify both email and mobile above to activate your credentials.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

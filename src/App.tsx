/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/Auth/LoginPage';
import { SignupPage } from './pages/Auth/SignupPage';
import { VerifyAccountPage } from './pages/Auth/VerifyAccountPage';
import { MainDashboard } from './pages/Dashboard/MainDashboard';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, pendingVerification } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup' | 'verify'>('login');

  useEffect(() => {
    // Check if URL has an email token query
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setAuthView('verify');
    } else if (pendingVerification && (!pendingVerification.email_verified || !pendingVerification.mobile_verified)) {
      setAuthView('verify');
    }
  }, [pendingVerification]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Initializing Secure Session & AI Intelligence...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <MainDashboard />;
  }

  if (authView === 'signup') {
    return (
      <SignupPage
        onNavigateToLogin={() => setAuthView('login')}
        onNavigateToVerify={() => setAuthView('verify')}
      />
    );
  }

  if (authView === 'verify') {
    return (
      <VerifyAccountPage
        onNavigateToLogin={() => setAuthView('login')}
        onVerificationComplete={() => setAuthView('login')}
      />
    );
  }

  return (
    <LoginPage
      onNavigateToSignup={() => setAuthView('signup')}
      onNavigateToVerify={() => setAuthView('verify')}
    />
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

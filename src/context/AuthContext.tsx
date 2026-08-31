import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole, SimulatedMessage } from '../types';
import { apiService } from '../services/api';

export type AuthProviderType = 'internal' | 'supabase' | 'firebase';

interface PendingVerificationData {
  userId?: string;
  email: string;
  mobile: string;
  email_verified: boolean;
  mobile_verified: boolean;
  emailToken?: string;
  plainOtp?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authProvider: AuthProviderType;
  setAuthProvider: (provider: AuthProviderType) => void;
  pendingVerification: PendingVerificationData | null;
  setPendingVerification: (data: PendingVerificationData | null) => void;
  simulatedMessages: SimulatedMessage[];
  refreshSimulatedMessages: () => Promise<void>;
  register: (formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    mobile: string;
    role?: UserRole;
  }) => Promise<{ userId: string; emailToken?: string; plainOtp?: string }>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginDemo: (role: UserRole) => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  verifyMobile: (otp: string, mobile?: string, userId?: string) => Promise<boolean>;
  resendMobileOtp: (mobile?: string, userId?: string) => Promise<string | undefined>;
  resendEmailVerification: (email?: string, userId?: string) => Promise<string | undefined>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authProvider, setAuthProviderState] = useState<AuthProviderType>(() => {
    return (localStorage.getItem('auth_provider') as AuthProviderType) || 'internal';
  });
  const [pendingVerification, setPendingVerification] = useState<PendingVerificationData | null>(() => {
    const saved = localStorage.getItem('pending_verification');
    return saved ? JSON.parse(saved) : null;
  });
  const [simulatedMessages, setSimulatedMessages] = useState<SimulatedMessage[]>([]);

  const setAuthProvider = (p: AuthProviderType) => {
    setAuthProviderState(p);
    localStorage.setItem('auth_provider', p);
  };

  const refreshSimulatedMessages = useCallback(async () => {
    try {
      const data = await apiService.getSimulatedMessages();
      setSimulatedMessages(data.messages || []);
    } catch (e) {
      console.warn('Could not fetch simulated messages', e);
    }
  }, []);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
          setToken(storedToken);
        } catch (err) {
          console.warn('Session expired or invalid, resetting token', err);
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
      refreshSimulatedMessages();
    };

    checkAuth();
  }, [refreshSimulatedMessages]);

  // Sync pending verification to localStorage
  useEffect(() => {
    if (pendingVerification) {
      localStorage.setItem('pending_verification', JSON.stringify(pendingVerification));
    } else {
      localStorage.removeItem('pending_verification');
    }
  }, [pendingVerification]);

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    mobile: string;
    role?: UserRole;
  }) => {
    setIsLoading(true);
    try {
      const res = await apiService.register(formData);
      if (res.token && res.user) {
        localStorage.setItem('auth_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setPendingVerification(null);
      } else {
        const pendingData: PendingVerificationData = {
          userId: res.userId,
          email: res.email,
          mobile: res.mobile,
          email_verified: res.email_verified || false,
          mobile_verified: res.mobile_verified || false,
          emailToken: res.emailToken,
          plainOtp: res.plainOtp,
        };
        setPendingVerification(pendingData);
      }
      await refreshSimulatedMessages();
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await apiService.login(credentials);
      localStorage.setItem('auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setPendingVerification(null);
    } catch (err: any) {
      if (err.code === 'UNVERIFIED_BOTH' || err.code === 'UNVERIFIED_EMAIL' || err.code === 'UNVERIFIED_MOBILE') {
        const pendingData: PendingVerificationData = {
          userId: err.userId,
          email: credentials.email,
          mobile: err.mobile || '+91 98765 43210',
          email_verified: err.email_verified || false,
          mobile_verified: err.mobile_verified || false,
        };
        setPendingVerification(pendingData);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async (role: UserRole) => {
    setIsLoading(true);
    try {
      if (role === 'admin') {
        await login({ email: 'admin@recruitment.ai', password: 'Password123!' });
      } else {
        await login({ email: 'velan@gmail.com', password: 'Password123!' });
        if (role === 'recruiter') {
          await updateUser({ role: 'recruiter' });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (tokenStr: string): Promise<boolean> => {
    try {
      const res = await apiService.verifyEmail(tokenStr);
      if (pendingVerification) {
        const updated = {
          ...pendingVerification,
          email_verified: true,
        };
        setPendingVerification(updated);
      }
      await refreshSimulatedMessages();
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const verifyMobile = async (otp: string, mobile?: string, userId?: string): Promise<boolean> => {
    try {
      const targetUserId = userId || pendingVerification?.userId;
      const targetMobile = mobile || pendingVerification?.mobile;
      const res = await apiService.verifyMobile({
        otp,
        mobile: targetMobile,
        userId: targetUserId,
      });

      if (pendingVerification) {
        const updated = {
          ...pendingVerification,
          mobile_verified: true,
        };
        setPendingVerification(updated);
      }
      await refreshSimulatedMessages();
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const resendMobileOtp = async (mobile?: string, userId?: string) => {
    const targetUserId = userId || pendingVerification?.userId;
    const targetMobile = mobile || pendingVerification?.mobile;
    const res = await apiService.resendMobileOtp({ mobile: targetMobile, userId: targetUserId });
    if (pendingVerification && res.plainOtp) {
      setPendingVerification({
        ...pendingVerification,
        plainOtp: res.plainOtp,
      });
    }
    await refreshSimulatedMessages();
    return res.plainOtp;
  };

  const resendEmailVerification = async (email?: string, userId?: string) => {
    const targetUserId = userId || pendingVerification?.userId;
    const targetEmail = email || pendingVerification?.email;
    const res = await apiService.sendEmailVerification({ email: targetEmail, userId: targetUserId });
    if (pendingVerification && res.emailToken) {
      setPendingVerification({
        ...pendingVerification,
        emailToken: res.emailToken,
      });
    }
    await refreshSimulatedMessages();
    return res.emailToken;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    const res = await apiService.updateProfile(data);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        authProvider,
        setAuthProvider,
        pendingVerification,
        setPendingVerification,
        simulatedMessages,
        refreshSimulatedMessages,
        register,
        login,
        loginDemo,
        verifyEmail,
        verifyMobile,
        resendMobileOtp,
        resendEmailVerification,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

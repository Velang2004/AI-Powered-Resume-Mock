import {
  ResumeData,
  AtsScoreReport,
  InterviewQuestion,
  InterviewFeedbackReport,
  SimulatedMessage,
  User,
} from '../types';

const API_BASE = '/api';
const PYTHON_API_BASE = 'http://localhost:8000/api';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const apiService = {
  // Auth
  async register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    mobile: string;
    role?: string;
  }) {
    // Attempt Python FastAPI + MySQL Signup first
    try {
      const pyRes = await fetch(`${PYTHON_API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.name || data.email.split('@')[0],
          email: data.email,
          password: data.password,
          role: data.role || 'user',
        }),
      });

      if (pyRes.ok) {
        const pyJson = await pyRes.json();
        // Automatically perform login to get JWT token
        return await this.login({ email: data.email, password: data.password });
      } else {
        const errJson = await pyRes.json().catch(() => ({ detail: 'MySQL Registration failed' }));
        console.warn('Python MySQL signup failed, trying fallback express server:', errJson.detail);
      }
    } catch (err) {
      console.warn('Python backend unavailable during signup, falling back to express server:', err);
    }

    // Fallback to Express mock server
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.detail || 'Registration failed');
    return json;
  },

  async login(data: { email: string; password: string }) {
    // Attempt Python FastAPI + MySQL Login first
    try {
      const pyRes = await fetch(`${PYTHON_API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (pyRes.ok) {
        const pyJson = await pyRes.json();
        return {
          token: pyJson.access_token,
          user: {
            id: String(pyJson.user_id),
            name: pyJson.username,
            email: pyJson.email,
            role: pyJson.role || 'user',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            email_verified: true,
            mobile_verified: true,
          },
        };
      } else {
        const errJson = await pyRes.json().catch(() => ({ detail: 'Invalid credentials' }));
        console.warn('Python MySQL login failed, trying fallback express server:', errJson.detail);
      }
    } catch (err) {
      console.warn('Python backend unavailable during login, falling back to express server:', err);
    }

    // Fallback to Express server
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      const error: any = new Error(json.error || json.detail || 'Login failed');
      error.code = json.code;
      error.userId = json.userId;
      error.email_verified = json.email_verified;
      error.mobile_verified = json.mobile_verified;
      throw error;
    }
    return json;
  },

  async verifyEmail(token: string) {
    const res = await fetch(`${API_BASE}/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Email verification failed');
    return json;
  },

  async sendEmailVerification(params: { email?: string; userId?: string }) {
    const res = await fetch(`${API_BASE}/auth/send-email-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to send verification email');
    return json;
  },

  async verifyMobile(params: { mobile?: string; otp: string; userId?: string }) {
    const res = await fetch(`${API_BASE}/auth/verify-mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Mobile OTP verification failed');
    return json;
  },

  async resendMobileOtp(params: { mobile?: string; userId?: string }) {
    const res = await fetch(`${API_BASE}/auth/resend-mobile-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to resend mobile OTP');
    return json;
  },

  async getCurrentUser(): Promise<User> {
    try {
      const pyRes = await fetch(`${PYTHON_API_BASE}/auth/me`, {
        headers: getAuthHeader(),
      });
      if (pyRes.ok) {
        const pyJson = await pyRes.json();
        return {
          id: String(pyJson.id),
          name: pyJson.username,
          email: pyJson.email,
          mobile: pyJson.mobile || '',
          role: pyJson.role || 'user',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          email_verified: true,
          mobile_verified: true,
          account_verified: true,
          created_at: pyJson.created_at || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Python backend getCurrentUser unavailable, falling back to express:', err);
    }

    const res = await fetch(`${API_BASE}/users/me`, {
      headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch user');
    return json;
  },

  async updateProfile(data: Partial<User>) {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update profile');
    return json;
  },

  async getSimulatedMessages(): Promise<{ messages: SimulatedMessage[] }> {
    const res = await fetch(`${API_BASE}/auth/simulated-messages`);
    return res.json();
  },

  async clearSimulatedMessages() {
    const res = await fetch(`${API_BASE}/auth/simulated-messages`, { method: 'DELETE' });
    return res.json();
  },

  // AI Resume Services
  async polishResume(resumeData: ResumeData, targetJobTitle?: string) {
    const res = await fetch(`${API_BASE}/resumes/polish`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ resumeData, targetJobTitle }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to polish resume');
    return json;
  },

  async calculateAtsScore(resumeData: ResumeData, jobDescription?: string, jobTitle?: string): Promise<AtsScoreReport> {
    const res = await fetch(`${API_BASE}/resumes/ats-score`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ resumeData, jobDescription, jobTitle }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to calculate ATS score');
    return json;
  },

  async optimizeResumeForJob(resumeData: ResumeData, job: any) {
    const res = await fetch(`${API_BASE}/resumes/optimize`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ resumeData, job }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to optimize resume');
    return json;
  },

  // AI Mock Interview Services
  async generateInterviewQuestions(params: {
    resumeData: ResumeData;
    jobTitle?: string;
    interviewType?: string;
    difficulty?: string;
    count?: number;
  }): Promise<{ questions: InterviewQuestion[] }> {
    const res = await fetch(`${API_BASE}/interviews/generate-questions`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to generate interview questions');
    return json;
  },

  async evaluateInterviewAnswer(params: {
    question: string;
    candidateAnswer: string;
    interviewType?: string;
  }): Promise<InterviewFeedbackReport> {
    const res = await fetch(`${API_BASE}/interviews/evaluate`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to evaluate interview answer');
    return json;
  },

  async transcribeAudio(params: {
    audio: string;
    mimeType?: string;
    questionContext?: string;
  }): Promise<{ transcript: string; success?: boolean; fallback?: boolean }> {
    const res = await fetch(`${API_BASE}/interviews/transcribe-audio`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to transcribe audio');
    return json;
  },

  async generateTts(text: string, voice = 'Kore') {
    const res = await fetch(`${API_BASE}/tts`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ text, voice }),
    });
    return res.json();
  },

  async analyzeVideoFrame(params: {
    image: string;
    mimeType?: string;
    currentContext?: string;
  }) {
    const res = await fetch(`${API_BASE}/interviews/analyze-video-frame`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to analyze video frame');
    return json;
  },

  // Career Copilot
  async sendCopilotMessage(messages: { role: string; content: string }[], userContext: any) {
    const res = await fetch(`${API_BASE}/copilot/chat`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ messages, userContext }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to communicate with Career Copilot');
    return json;
  },
};

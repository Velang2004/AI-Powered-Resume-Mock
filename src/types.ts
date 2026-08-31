export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  email_verified: boolean;
  mobile_verified: boolean;
  account_verified: boolean;
  avatar?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface VerificationToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  verified_at?: string;
}

export interface MobileOtp {
  id: string;
  user_id: string;
  mobile: string;
  otp: string;
  otp_hash: string;
  expires_at: string;
  verified_at?: string;
}

export interface SimulatedMessage {
  id: string;
  type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  content: string;
  token?: string;
  otp?: string;
  timestamp: string;
  read: boolean;
}

export interface ResumePersonal {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  college: string;
  university?: string;
  location?: string;
  startDate: string;
  endDate: string;
  cgpa?: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  jobTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  technologies: string[];
  description: string;
  startDate?: string;
  endDate?: string;
  githubUrl?: string;
  liveUrl?: string;
  bullets: string[];
}

export interface SkillsCategorized {
  languages: string[];
  frameworks: string[];
  databases: string[];
  cloud: string[];
  aiml: string[];
  tools: string[];
  softSkills: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url?: string;
}

export interface VolunteerItem {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export type TemplateId = 'single-page' | 'modern' | 'professional' | 'minimal-ats' | 'creative-tech';

export interface ResumeVersion {
  id: string;
  versionNumber: number;
  label: string;
  savedAt: string;
  atsScore: number;
  data: ResumeData;
}

export interface ResumeData {
  id: string;
  userId: string;
  title: string;
  templateId: TemplateId;
  themeColor: string;
  personal: ResumePersonal;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillsCategorized;
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  languages: LanguageItem[];
  publications: PublicationItem[];
  volunteer: VolunteerItem[];
  sectionOrder: string[];
  updatedAt: string;
  createdAt: string;
  atsScore?: number;
  versions?: ResumeVersion[];
}

export interface AtsScoreReport {
  overallScore: number;
  categoryBreakdown?: {
    keywords: number;
    skills: number;
    experience: number;
    formatting: number;
    education: number;
    jobRelevance: number;
  };
  breakdown: {
    keywordMatch: number;
    formatting: number;
    experienceImpact: number;
    sectionCompleteness: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  strongPoints?: string[];
  formattingIssues?: string[];
  improvementSuggestions?: string[];
  detailedAnalysis?: string;
  suggestions?: {
    id: string;
    type: 'critical' | 'improvement' | 'positive';
    section: string;
    issue: string;
    whyItMatters: string;
    recommendedChange: string;
    originalText?: string;
    suggestedText?: string;
    applied?: boolean;
  }[];
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  remote: 'Remote' | 'Hybrid' | 'On-site' | boolean | string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | string;
  salaryRange: string;
  jobType: 'Full-time' | 'Contract' | 'Internship' | string;
  description: string;
  requirements?: string[];
  requiredSkills?: string[];
  skillsRequired?: string[];
  matchScore?: number;
  breakdown?: {
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
  };
  postedDate: string;
  saved?: boolean;
}

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview'
  | 'selected'
  | 'rejected'
  | 'offer';

export interface ApplicationEvent {
  id: string;
  status: ApplicationStatus;
  label: string;
  timestamp: string;
  notes?: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  resumeId: string;
  resumeName: string;
  status: ApplicationStatus;
  appliedDate: string;
  interviewDate?: string;
  recruiterContact?: string;
  jobUrl?: string;
  notes: string;
  healthScore: number;
  events: ApplicationEvent[];
}

export type InterviewType =
  | 'HR'
  | 'Technical'
  | 'Behavioral'
  | 'System Design'
  | 'Python'
  | 'FastAPI'
  | 'Machine Learning'
  | 'Data Science';

export interface InterviewQuestion {
  id: string;
  questionNumber: number;
  question: string;
  contextWhyAsked: string;
  category: string;
  idealAnswerHints?: string[];
  candidateAnswer?: string;
  timeSpentSeconds?: number;
  score?: number;
  feedback?: string;
}

export interface InterviewFeedbackReport {
  overallScore?: number;
  score?: number;
  categories?: {
    technicalKnowledge?: number;
    communication?: number;
    confidence?: number;
    problemSolving?: number;
    clarity?: number;
    relevance?: number;
  };
  fillerWordsUsed?: { word: string; count: number }[];
  averageResponseSeconds?: number;
  strengths: string[];
  improvements: string[];
  sampleBetterAnswer?: string;
  detailedQuestionReview?: {
    question: string;
    answer: string;
    score: number;
    strengths: string;
    improvements: string;
  }[];
  videoAnalysis?: {
    eyeContactScore: number;
    headStabilityScore: number;
    confidenceScore: number;
    dominantEmotion: string;
    suspiciousFlagsCount: number;
    lookingAwayIncidents: number;
    headMovementWarnings: number;
    postureRating: 'Optimal' | 'Needs Improvement' | 'Unstable';
    coachNotes: string[];
  };
}

export type EyeContactState =
  | 'direct_forward'
  | 'looking_down'
  | 'looking_left'
  | 'looking_right'
  | 'looking_up'
  | 'eyes_closed';

export type HeadPoseState =
  | 'centered_straight'
  | 'tilted_left'
  | 'tilted_right'
  | 'turned_away'
  | 'looking_down_at_notes'
  | 'excessive_movement';

export type FaceEmotion =
  | 'confident'
  | 'focused'
  | 'calm'
  | 'neutral'
  | 'sad_stressed'
  | 'nervous'
  | 'distracted';

export interface ProctoringLogEntry {
  id: string;
  timestamp: string;
  type: 'LOOKING_AWAY' | 'LOOKING_DOWN' | 'NO_FACE' | 'TAB_SWITCH' | 'SUSPICIOUS_GAZE';
  message: string;
}

export interface VideoSentimentState {
  emotion: FaceEmotion;
  confidenceScore: number; // 0 - 100
  eyeContact: EyeContactState;
  headPose: HeadPoseState;
  isHeadStraight: boolean;
  cheatingFlag: boolean;
  suspicionReason: string | null;
  coachAdvice: string;
  faceDetected: boolean;
  headTiltAngle: number;
  lookingAwayCount: number;
  suspiciousCount: number;
  tabSwitchCount?: number;
  proctoringLog?: ProctoringLogEntry[];
  emotionPercentages: {
    confident: number;
    focused: number;
    nervous: number;
    sad_stressed: number;
    neutral: number;
  };
}

export interface InterviewSession {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  interviewType: InterviewType;
  difficulty: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  date: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  meetingLink?: string;
  resumeId: string;
  jobDescription?: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  feedbackReport?: InterviewFeedbackReport;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'interview' | 'application' | 'ats' | 'job' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

export type Job = JobListing;

import React, { useState, useEffect } from 'react';
import {
  ResumeData,
  TemplateId,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  SkillsCategorized,
  CertificationItem,
} from '../../types';
import { INITIAL_RESUME_DATA } from '../../data/mockData';
import { ResumeEditor } from './ResumeEditor';
import { ResumePreview } from './ResumePreview';
import { AiPolishModal } from './AiPolishModal';
import {
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
  Sliders,
  Eye,
  Edit3,
  Layers,
  Award,
  Zap,
  RotateCcw,
  BookOpen,
  Briefcase,
  GraduationCap,
  Cpu,
  User,
  ShieldCheck,
  TrendingUp,
  Copy,
  Check,
} from 'lucide-react';

export interface ResumeBuilderProps {
  initialData?: ResumeData;
  onUpdateResume?: (data: ResumeData) => void;
  onSaveVersion?: () => void;
  onOpenPolishModal?: () => void;
  standalone?: boolean;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  initialData,
  onUpdateResume,
  onSaveVersion,
  onOpenPolishModal,
  standalone = false,
}) => {
  // Local state initialized with passed props or localStorage or mock data
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    if (initialData) return initialData;
    const saved = localStorage.getItem('active_resume_data');
    return saved ? JSON.parse(saved) : INITIAL_RESUME_DATA;
  });

  const [isPolishModalOpen, setIsPolishModalOpen] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData) {
      setResumeData(initialData);
    }
  }, [initialData]);

  const handleUpdate = (updated: ResumeData) => {
    setResumeData(updated);
    localStorage.setItem('active_resume_data', JSON.stringify(updated));
    if (onUpdateResume) {
      onUpdateResume(updated);
    }
  };

  const handleTemplateChange = (templateId: TemplateId) => {
    handleUpdate({ ...resumeData, templateId });
  };

  const handleColorChange = (themeColor: string) => {
    handleUpdate({ ...resumeData, themeColor });
  };

  const handleSaveVersion = () => {
    if (onSaveVersion) {
      onSaveVersion();
    } else {
      const versions = JSON.parse(localStorage.getItem('resume_versions') || '[]');
      versions.unshift({
        id: 'v-' + Date.now(),
        timestamp: new Date().toLocaleString(),
        title: resumeData.title,
        data: resumeData,
      });
      localStorage.setItem('resume_versions', JSON.stringify(versions.slice(0, 10)));
    }
  };

  // Real-time ATS Optimization Audit Calculation
  const calculateAtsScore = (): { score: number; checklist: { label: string; passed: boolean; tip: string }[] } => {
    const p = resumeData.personal || { fullName: '', email: '', phone: '', summary: '', title: '' };
    const hasName = Boolean(p.fullName?.trim());
    const hasContact = Boolean(p.email?.trim() && p.phone?.trim());
    const hasTitle = Boolean(p.title?.trim());
    const hasSummary = Boolean(p.summary && p.summary.length > 50);
    const hasEdu = Boolean(resumeData.education && resumeData.education.length > 0);
    const hasExp = Boolean(resumeData.experience && resumeData.experience.length > 0);
    
    // Skills check
    const totalSkills: number = Object.values(resumeData.skills || {}).reduce<number>(
      (acc: number, list: unknown) => acc + (Array.isArray(list) ? list.length : 0),
      0
    );
    const hasSkills: boolean = totalSkills >= 8;

    // Check for quantifiable metrics (numbers, %, $, x) in experience bullets
    let metricCount = 0;
    (resumeData.experience || []).forEach((exp) => {
      (exp.bullets || []).forEach((b) => {
        if (/\d+|%|\$|\+|\b(reduced|increased|improved|scaled|delivered)\b/i.test(b)) {
          metricCount++;
        }
      });
    });
    const hasMetrics = metricCount >= 3;

    const checklist = [
      {
        label: 'Candidate Contact & Professional Links',
        passed: hasName && hasContact,
        tip: 'Ensure full name, phone number, email, and LinkedIn are present.',
      },
      {
        label: 'Target Job Title & ATS Summary',
        passed: hasTitle && hasSummary,
        tip: 'Include a concise summary tailored to your target job title.',
      },
      {
        label: 'Categorized Technical Skills (8+)',
        passed: hasSkills,
        tip: `Currently ${totalSkills} skills listed. Aim for 8+ categorized skills.`,
      },
      {
        label: 'Work Experience with Quantifiable Metrics',
        passed: hasExp && hasMetrics,
        tip: 'Include quantifiable metrics (%, $, numbers) in bullet points.',
      },
      {
        label: 'Verified Education History',
        passed: hasEdu,
        tip: 'Add your degree, university name, and graduation year.',
      },
    ];

    const passedCount = checklist.filter((c) => c.passed).length;
    const score = Math.min(99, Math.round((passedCount / checklist.length) * 40 + (hasMetrics ? 30 : 15) + (totalSkills >= 12 ? 25 : 15)));

    return { score, checklist };
  };

  const atsAudit = calculateAtsScore();

  // Quick Preset Sample Profiles
  const loadPresetProfile = (type: 'ai-ml' | 'fullstack' | 'blank') => {
    if (type === 'ai-ml') {
      handleUpdate(INITIAL_RESUME_DATA);
    } else if (type === 'fullstack') {
      handleUpdate({
        ...INITIAL_RESUME_DATA,
        id: 'resume-fs-' + Date.now(),
        title: 'Full Stack React & Node.js Engineer Resume',
        personal: {
          ...INITIAL_RESUME_DATA.personal,
          title: 'Senior Full-Stack Engineer (React, TypeScript, Node.js)',
          summary:
            'Full Stack Engineer with 4+ years of experience architecting scalable React applications, Node.js microservices, and distributed cloud systems. Proven track record of improving page load performance by 45% and leading cross-functional teams to deploy 12+ enterprise SaaS platforms.',
        },
        skills: {
          languages: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'SQL', 'HTML5/CSS3'],
          frameworks: ['React 19', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Redux Toolkit'],
          databases: ['PostgreSQL', 'Redis', 'MongoDB', 'Prisma ORM'],
          cloud: ['AWS (S3, CloudFront, Lambda)', 'Docker', 'GitHub Actions', 'Vercel'],
          aiml: ['Gemini API Integration', 'OpenAI SDK', 'Prompt Engineering'],
          tools: ['Git', 'Vite', 'Webpack', 'Postman', 'Jest', 'Cypress'],
          softSkills: ['Agile / Scrum', 'System Design', 'Code Review', 'Mentorship'],
        },
      });
    } else if (type === 'blank') {
      handleUpdate({
        id: 'resume-blank-' + Date.now(),
        userId: 'usr-1',
        title: 'My ATS Resume',
        templateId: 'single-page',
        themeColor: '#2563eb',
        personal: {
          fullName: 'Your Full Name',
          title: 'Software Engineer',
          email: 'youremail@example.com',
          phone: '+1 (555) 000-0000',
          location: 'San Francisco, CA',
          linkedin: 'https://linkedin.com/in/yourprofile',
          github: 'https://github.com/yourusername',
          portfolio: 'https://yourportfolio.dev',
          summary:
            'Results-driven Software Engineer with hands-on expertise building production-ready applications, collaborating in agile teams, and solving complex technical challenges.',
        },
        education: [
          {
            id: 'edu-1',
            degree: 'Bachelor of Science in Computer Science',
            college: 'State University',
            startDate: '2020',
            endDate: '2024',
            cgpa: '3.8 / 4.0',
            description: 'Relevant Coursework: Data Structures, Algorithms, Cloud Computing, Database Systems.',
          },
        ],
        experience: [
          {
            id: 'exp-1',
            company: 'Tech Solutions Inc.',
            jobTitle: 'Software Engineer',
            location: 'Remote',
            startDate: '2024-01',
            endDate: 'Present',
            current: true,
            description: 'Developed modern web applications and API microservices.',
            bullets: [
              'Architected and implemented responsive user interfaces using React and TypeScript, improving user engagement by 28%.',
              'Built secure RESTful API endpoints with Node.js and PostgreSQL, achieving 99.9% service reliability.',
              'Automated testing workflows with GitHub Actions CI/CD pipelines, reducing release deployment cycles by 35%.',
            ],
          },
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'Cloud Task Management Platform',
            technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
            description: 'Collaborative task management application with real-time updates and role-based access control.',
            bullets: [
              'Designed responsive UI components and state management with React and Tailwind CSS.',
              'Integrated WebSocket-driven notifications serving real-time team updates with sub-50ms latency.',
            ],
          },
        ],
        skills: {
          languages: ['TypeScript', 'JavaScript', 'Python', 'SQL'],
          frameworks: ['React', 'Node.js', 'Express', 'Tailwind CSS'],
          databases: ['PostgreSQL', 'MongoDB', 'Redis'],
          cloud: ['AWS', 'Docker', 'CI/CD'],
          aiml: ['Gemini API', 'LLM Integration'],
          tools: ['Git', 'Vite', 'Postman', 'Linux'],
          softSkills: ['Problem Solving', 'Team Collaboration', 'Effective Communication'],
        },
        certifications: [
          {
            id: 'cert-1',
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            date: '2024',
          },
        ],
        achievements: [
          {
            id: 'ach-1',
            title: 'Hackathon Finalist',
            description: 'Awarded 2nd place out of 60 teams for building an AI-assisted accessibility tool.',
          },
        ],
        languages: [
          { id: 'lang-1', language: 'English', proficiency: 'Fluent' },
        ],
        publications: [],
        volunteer: [],
        sectionOrder: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications'],
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
  };

  const copyPlainResume = () => {
    const p = resumeData.personal;
    const text = `
${p.fullName.toUpperCase()}
${p.title}
${p.email} | ${p.phone} | ${p.location}
LinkedIn: ${p.linkedin} | GitHub: ${p.github}

PROFESSIONAL SUMMARY
${p.summary}

TECHNICAL SKILLS
- Languages: ${(resumeData.skills.languages || []).join(', ')}
- Frameworks: ${(resumeData.skills.frameworks || []).join(', ')}
- Databases: ${(resumeData.skills.databases || []).join(', ')}
- Cloud & Infrastructure: ${(resumeData.skills.cloud || []).join(', ')}
- AI / ML: ${(resumeData.skills.aiml || []).join(', ')}
- Tools: ${(resumeData.skills.tools || []).join(', ')}

WORK EXPERIENCE
${(resumeData.experience || [])
  .map(
    (e) => `
${e.jobTitle} - ${e.company} (${e.startDate} - ${e.endDate || 'Present'})
${(e.bullets || []).map((b) => `• ${b}`).join('\n')}`
  )
  .join('\n')}

PROJECTS
${(resumeData.projects || [])
  .map(
    (pr) => `
${pr.name} [Tech: ${(pr.technologies || []).join(', ')}]
${(pr.bullets || []).map((b) => `• ${b}`).join('\n')}`
  )
  .join('\n')}

EDUCATION
${(resumeData.education || [])
  .map((ed) => `${ed.degree} - ${ed.college} (${ed.startDate} - ${ed.endDate}) | ${ed.cgpa || ''}`)
  .join('\n')}
`.trim();

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Top Banner: ATS Optimizer & Quick Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: ATS Score Metric & Highlights */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md ${
                  atsAudit.score >= 85
                    ? 'bg-linear-to-br from-emerald-500 to-teal-600'
                    : atsAudit.score >= 70
                    ? 'bg-linear-to-br from-blue-500 to-indigo-600'
                    : 'bg-linear-to-br from-amber-500 to-orange-600'
                }`}
              >
                {atsAudit.score}%
              </div>
              <div className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-slate-900 rounded-full">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  ATS Resume Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  ATS Optimized & Single-Page Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live parsing score based on keywords, quantified impact metrics, and clean typography.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Template Presets, AI Polish, View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Load Preset Profiles */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => loadPresetProfile('ai-ml')}
              className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition font-medium"
              title="Load Python & AI/ML Profile"
            >
              AI / ML Profile
            </button>
            <button
              onClick={() => loadPresetProfile('fullstack')}
              className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition font-medium"
              title="Load Full-Stack Engineer Profile"
            >
              Full-Stack Profile
            </button>
            <button
              onClick={() => loadPresetProfile('blank')}
              className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition font-medium"
              title="Reset to clean template"
            >
              Clean Template
            </button>
          </div>

          {/* Copy Plaintext ATS Resume */}
          <button
            onClick={copyPlainResume}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            title="Copy plain-text ATS friendly resume"
          >
            {copiedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          {/* AI Polish Trigger */}
          <button
            onClick={() => {
              if (onOpenPolishModal) onOpenPolishModal();
              else setIsPolishModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI Polish Resume</span>
          </button>

          {/* Responsive View Switcher (for small screens or layout toggle) */}
          <div className="flex lg:hidden bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveViewMode('editor')}
              className={`p-1.5 rounded-lg transition ${
                activeViewMode === 'editor'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 font-bold shadow-xs'
                  : 'text-slate-500'
              }`}
              title="Show Editor Only"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveViewMode('preview')}
              className={`p-1.5 rounded-lg transition ${
                activeViewMode === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 font-bold shadow-xs'
                  : 'text-slate-500'
              }`}
              title="Show Live Preview Only"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout (Editor + Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-210px)] min-h-[720px]">
        {/* Left Column: Modular Editor */}
        <div
          className={`h-full overflow-hidden ${
            activeViewMode === 'preview' ? 'hidden lg:block lg:col-span-5' : 'lg:col-span-5'
          }`}
        >
          <ResumeEditor
            data={resumeData}
            onChange={handleUpdate}
            onOpenPolishModal={() => {
              if (onOpenPolishModal) onOpenPolishModal();
              else setIsPolishModalOpen(true);
            }}
            onSaveVersion={handleSaveVersion}
          />
        </div>

        {/* Right Column: Live A4 Preview & Controls */}
        <div
          className={`h-full overflow-hidden ${
            activeViewMode === 'editor' ? 'hidden lg:block lg:col-span-7' : 'lg:col-span-7'
          }`}
        >
          <ResumePreview
            data={resumeData}
            onTemplateChange={handleTemplateChange}
            onColorChange={handleColorChange}
            onOpenPolishModal={() => {
              if (onOpenPolishModal) onOpenPolishModal();
              else setIsPolishModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Standalone AI Polish Modal if not managed by parent */}
      <AiPolishModal
        isOpen={isPolishModalOpen}
        onClose={() => setIsPolishModalOpen(false)}
        resumeData={resumeData}
        onApplyPolishedData={handleUpdate}
      />
    </div>
  );
};

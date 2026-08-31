import React, { useState } from 'react';
import {
  ResumeData,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  CertificationItem,
  AchievementItem,
  LanguageItem,
} from '../../types';
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Cpu,
  Award,
  Trophy,
  Languages,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Save,
  Check,
  Undo2,
  Redo2,
  FileText,
} from 'lucide-react';

interface ResumeEditorProps {
  data: ResumeData;
  onChange: (updated: ResumeData) => void;
  onOpenPolishModal: () => void;
  onSaveVersion: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  data,
  onChange,
  onOpenPolishModal,
  onSaveVersion,
}) => {
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handlePersonalChange = (field: string, value: string) => {
    onChange({
      ...data,
      personal: {
        ...data.personal,
        [field]: value,
      },
    });
  };

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: 'exp-' + Date.now(),
      company: 'New Company',
      jobTitle: 'Software Engineer',
      location: 'City, Country',
      startDate: '2023-01',
      endDate: 'Present',
      current: true,
      description: 'Lead architecture and development of scalable microservices.',
      bullets: [
        'Architected and implemented high-performance endpoints reducing latency by 30%.',
        'Collaborated with cross-functional teams to deliver enterprise features on schedule.',
      ],
    };
    onChange({
      ...data,
      experience: [newExp, ...(data.experience || [])],
    });
  };

  const handleUpdateExperience = (id: string, updated: Partial<ExperienceItem>) => {
    onChange({
      ...data,
      experience: (data.experience || []).map((exp) =>
        exp.id === id ? { ...exp, ...updated } : exp
      ),
    });
  };

  const handleDeleteExperience = (id: string) => {
    onChange({
      ...data,
      experience: (data.experience || []).filter((exp) => exp.id !== id),
    });
  };

  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: 'edu-' + Date.now(),
      degree: 'B.S. in Computer Science',
      college: 'University Name',
      startDate: '2019',
      endDate: '2023',
      cgpa: '3.8 / 4.0',
    };
    onChange({
      ...data,
      education: [...(data.education || []), newEdu],
    });
  };

  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: 'proj-' + Date.now(),
      name: 'New AI Project',
      technologies: ['React', 'TypeScript', 'FastAPI'],
      description: 'End-to-end web platform featuring real-time intelligence.',
      bullets: ['Implemented low-latency backend and responsive UI.'],
    };
    onChange({
      ...data,
      projects: [...(data.projects || []), newProj],
    });
  };

  const handleSkillsListChange = (category: keyof typeof data.skills, valueStr: string) => {
    const arr = (valueStr || '')
      .split(',')
      .map((s) => (s || '').trim())
      .filter(Boolean);
    onChange({
      ...data,
      skills: {
        ...data.skills,
        [category]: arr,
      },
    });
  };

  const handleAppendSkill = (category: keyof typeof data.skills, skillName: string) => {
    const current = data.skills[category] || [];
    if (!current.includes(skillName)) {
      onChange({
        ...data,
        skills: {
          ...data.skills,
          [category]: [...current, skillName],
        },
      });
    }
  };

  const handleManualSave = () => {
    onSaveVersion();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      {/* Top Action Bar */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="font-bold text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100 px-1 py-0.5"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPolishModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg text-xs shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI Polish Resume</span>
          </button>

          <button
            onClick={handleManualSave}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'Saved' : 'Save Version'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Horizontal List */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs bg-slate-50/50 dark:bg-slate-900/50 p-1">
        {[
          { id: 'personal', label: 'Personal', icon: User },
          { id: 'experience', label: 'Experience', icon: Briefcase },
          { id: 'projects', label: 'Projects', icon: FolderGit2 },
          { id: 'skills', label: 'Skills', icon: Cpu },
          { id: 'education', label: 'Education', icon: GraduationCap },
          { id: 'certifications', label: 'Certifications', icon: Award },
          { id: 'achievements', label: 'Honors', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* TAB 1: PERSONAL INFO */}
        {activeTab === 'personal' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Personal & Contact Details</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={data.personal.fullName}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="e.g. Velan G"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Professional Title</label>
                <input
                  type="text"
                  value={data.personal.title}
                  onChange={(e) => handlePersonalChange('title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="e.g. Senior Full-Stack & AI Engineer"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={data.personal.email}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="velan@gmail.com"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Phone / Mobile</label>
                <input
                  type="text"
                  value={data.personal.phone}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={data.personal.location}
                  onChange={(e) => handlePersonalChange('location', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="Bangalore, India"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={data.personal.linkedin}
                  onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="https://linkedin.com/in/velan-g"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={data.personal.github}
                  onChange={(e) => handlePersonalChange('github', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="https://github.com/velang"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Portfolio / Website</label>
                <input
                  type="text"
                  value={data.personal.portfolio}
                  onChange={(e) => handlePersonalChange('portfolio', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="https://velang.dev"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Professional Summary</label>
              <textarea
                rows={4}
                value={data.personal.summary}
                onChange={(e) => handlePersonalChange('summary', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                placeholder="High-impact summary highlighting years of experience, core stacks, quantified accomplishments, and career focus..."
              />
            </div>
          </div>
        )}

        {/* TAB 2: EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Work Experience</h3>
                <p className="text-[11px] text-slate-500">Include measurable metrics and strong action verbs for higher ATS ranking.</p>
              </div>
              <button
                onClick={handleAddExperience}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-lg font-semibold text-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {/* Quick Action Verbs Assistant */}
            <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl">
              <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block mb-1">
                ⚡ High-Impact ATS Action Verbs:
              </span>
              <div className="flex flex-wrap gap-1">
                {['Architected', 'Spearheaded', 'Optimized', 'Automated', 'Engineered', 'Delivered', 'Scaled', 'Reduced', 'Integrated', 'Accelerated'].map((verb) => (
                  <span
                    key={verb}
                    className="px-2 py-0.5 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 rounded text-[10px] border border-blue-200 dark:border-blue-800"
                  >
                    {verb}
                  </span>
                ))}
              </div>
            </div>

            {(data.experience || []).map((exp, expIdx) => (
              <div key={exp.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">Role #{expIdx + 1}</span>
                  <button
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Job Title</label>
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) => handleUpdateExperience(exp.id, { jobTitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => handleUpdateExperience(exp.id, { location: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. Remote / New York, NY"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => handleUpdateExperience(exp.id, { startDate: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="e.g. 2023-01"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => handleUpdateExperience(exp.id, { endDate: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="e.g. Present"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Quantified Achievement Bullets (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={(exp.bullets || []).join('\n')}
                    onChange={(e) =>
                      handleUpdateExperience(exp.id, {
                        bullets: e.target.value.split('\n').filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                    placeholder="• Architected microservices handling 10k+ daily transactions with 99.9% uptime&#10;• Reduced latency by 35% through query optimization and caching"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Key Projects</h3>
              <button
                onClick={handleAddProject}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-lg font-semibold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {(data.projects || []).map((proj, pIdx) => (
              <div key={proj.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">Project #{pIdx + 1}</span>
                  <button
                    onClick={() =>
                      onChange({
                        ...data,
                        projects: (data.projects || []).filter((p) => p.id !== proj.id),
                      })
                    }
                    className="p-1 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Project Name</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => {
                        const updated = (data.projects || []).map((p) =>
                          p.id === proj.id ? { ...p, name: e.target.value } : p
                        );
                        onChange({ ...data, projects: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      value={(proj.technologies || []).join(', ')}
                      onChange={(e) => {
                        const tags = (e.target.value || '').split(',').map((t) => (t || '').trim()).filter(Boolean);
                        const updated = (data.projects || []).map((p) =>
                          p.id === proj.id ? { ...p, technologies: tags } : p
                        );
                        onChange({ ...data, projects: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="React, FastAPI, Docker"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Description & Key Highlights</label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => {
                      const updated = (data.projects || []).map((p) =>
                        p.id === proj.id ? { ...p, description: e.target.value } : p
                      );
                      onChange({ ...data, projects: updated });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Categorized Skills Matrix</h3>
              <p className="text-[11px] text-slate-500">Group skills by categories for maximum ATS indexability. Click suggestion chips to quickly add keywords.</p>
            </div>

            <div className="space-y-3.5">
              {/* Programming Languages */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Programming Languages</label>
                  <span className="text-[10px] text-slate-400">{(data.skills.languages || []).length} added</span>
                </div>
                <input
                  type="text"
                  value={(data.skills.languages || []).join(', ')}
                  onChange={(e) => handleSkillsListChange('languages', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                  placeholder="TypeScript, Python, SQL, JavaScript, Go"
                />
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 mr-1">Quick add:</span>
                  {['TypeScript', 'Python', 'SQL', 'JavaScript', 'Go', 'Java', 'C++'].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAppendSkill('languages', skill)}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-750 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/60 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frameworks */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Frameworks & Libraries</label>
                  <span className="text-[10px] text-slate-400">{(data.skills.frameworks || []).length} added</span>
                </div>
                <input
                  type="text"
                  value={(data.skills.frameworks || []).join(', ')}
                  onChange={(e) => handleSkillsListChange('frameworks', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                  placeholder="React, FastAPI, Node.js, Express, Tailwind CSS, Next.js"
                />
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 mr-1">Quick add:</span>
                  {['React', 'Next.js', 'FastAPI', 'Node.js', 'Express', 'Tailwind CSS', 'Redux'].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAppendSkill('frameworks', skill)}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-750 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/60 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Databases */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Databases & Storage</label>
                  <span className="text-[10px] text-slate-400">{(data.skills.databases || []).length} added</span>
                </div>
                <input
                  type="text"
                  value={(data.skills.databases || []).join(', ')}
                  onChange={(e) => handleSkillsListChange('databases', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                  placeholder="PostgreSQL, MySQL, Redis, MongoDB, Elasticsearch"
                />
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 mr-1">Quick add:</span>
                  {['PostgreSQL', 'MySQL', 'Redis', 'MongoDB', 'SQLite', 'Prisma'].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAppendSkill('databases', skill)}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-750 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/60 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cloud & DevOps */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Cloud & Infrastructure</label>
                  <span className="text-[10px] text-slate-400">{(data.skills.cloud || []).length} added</span>
                </div>
                <input
                  type="text"
                  value={(data.skills.cloud || []).join(', ')}
                  onChange={(e) => handleSkillsListChange('cloud', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                  placeholder="AWS (EC2, S3, RDS), Docker, CI/CD, Terraform, GCP"
                />
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 mr-1">Quick add:</span>
                  {['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Terraform', 'GCP'].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAppendSkill('cloud', skill)}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-750 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/60 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI / ML & LLMs */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">AI / ML & LLMs</label>
                  <span className="text-[10px] text-slate-400">{(data.skills.aiml || []).length} added</span>
                </div>
                <input
                  type="text"
                  value={(data.skills.aiml || []).join(', ')}
                  onChange={(e) => handleSkillsListChange('aiml', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                  placeholder="Gemini API, Embeddings, Prompt Engineering, ATS Parsing, PyTorch, Scikit-learn"
                />
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 mr-1">Quick add:</span>
                  {['Gemini API', 'LLM Agents', 'PyTorch', 'Scikit-learn', 'Transformers', 'Embeddings', 'NLP'].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAppendSkill('aiml', skill)}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-750 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/60 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EDUCATION */}
        {activeTab === 'education' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Education History</h3>
              <button
                onClick={handleAddEducation}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg font-semibold text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Degree
              </button>
            </div>

            {(data.education || []).map((edu) => (
              <div key={edu.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = (data.education || []).map((ed) =>
                        ed.id === edu.id ? { ...ed, degree: e.target.value } : ed
                      );
                      onChange({ ...data, education: updated });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">College / University</label>
                  <input
                    type="text"
                    value={edu.college}
                    onChange={(e) => {
                      const updated = (data.education || []).map((ed) =>
                        ed.id === edu.id ? { ...ed, college: e.target.value } : ed
                      );
                      onChange({ ...data, education: updated });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: CERTIFICATIONS */}
        {activeTab === 'certifications' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Certifications</h3>
            {(data.certifications || []).map((cert) => (
              <div key={cert.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => {
                    const updated = (data.certifications || []).map((c) =>
                      c.id === cert.id ? { ...c, name: e.target.value } : c
                    );
                    onChange({ ...data, certifications: updated });
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Certification name"
                />
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => {
                    const updated = (data.certifications || []).map((c) =>
                      c.id === cert.id ? { ...c, issuer: e.target.value } : c
                    );
                    onChange({ ...data, certifications: updated });
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Issuer & Year"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

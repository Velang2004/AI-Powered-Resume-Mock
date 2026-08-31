import React from 'react';
import { ResumeData } from '../../../types';
import { Terminal, Code, Cpu, Sparkles, FolderGit2, GraduationCap, Award } from 'lucide-react';

export const CreativeTechTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, education, experience, projects, skills, certifications, themeColor } = data;
  const accent = themeColor || '#4f46e5';

  return (
    <div className="bg-slate-950 text-slate-100 p-8 font-sans text-xs leading-relaxed max-w-[800px] mx-auto shadow-md min-h-[1050px] border border-slate-800">
      {/* Dark Modern Tech Header */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-[11px] text-emerald-400">~/profile/resume.ts</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">{personal.fullName || 'Velan G'}</h1>
            <p className="text-sm font-semibold mt-0.5" style={{ color: accent }}>{personal.title || 'Senior Engineer'}</p>
          </div>

          <div className="text-right text-[10.5px] text-slate-400 font-mono space-y-0.5">
            <div>{personal.location}</div>
            <div>{personal.email}</div>
            <div>{personal.phone}</div>
            {personal.github && <div className="text-indigo-400">{personal.github.replace(/^https?:\/\//, '')}</div>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-5 bg-slate-900/50 p-3.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] mb-1 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Architecture & Career Focus</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">{personal.summary}</p>
        </div>
      )}

      {/* Skills Pill Board */}
      {skills && (
        <div className="mb-5 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] mb-2.5 text-slate-200">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tech Stack Matrix</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[10.5px]">
            <div>
              <span className="text-slate-400 font-mono block mb-1">const languages =</span>
              <div className="flex flex-wrap gap-1">
                {(skills.languages || []).map((l, i) => (
                  <span key={i} className="bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded text-[10px] font-mono">
                    {l}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-mono block mb-1">const frameworks =</span>
              <div className="flex flex-wrap gap-1">
                {(skills.frameworks || []).map((f, i) => (
                  <span key={i} className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-mono">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-mono block mb-1">const cloud_and_db =</span>
              <div className="flex flex-wrap gap-1">
                {[...(skills.databases || []), ...(skills.cloud || [])].map((d, i) => (
                  <span key={i} className="bg-blue-950/80 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded text-[10px] font-mono">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-mono block mb-1">const ai_and_tools =</span>
              <div className="flex flex-wrap gap-1">
                {[...(skills.aiml || []), ...(skills.tools || [])].map((a, i) => (
                  <span key={i} className="bg-purple-950/80 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded text-[10px] font-mono">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] mb-3 text-slate-200">
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>Engineering Track Record</span>
          </div>
          <div className="space-y-3.5">
            {experience.map((exp) => (
              <div key={exp.id} className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-white text-[12px]">{exp.jobTitle}</span>
                  <span className="font-mono text-[10px] text-emerald-400">
                    {exp.startDate} → {exp.current ? 'NOW' : exp.endDate}
                  </span>
                </div>
                <div className="text-[11px] text-indigo-400 font-medium mb-1.5 font-mono">
                  @{exp.company} // {exp.location}
                </div>
                {exp.bullets && (
                  <ul className="list-disc list-outside ml-4 space-y-1 text-slate-300 text-[10.5px]">
                    {exp.bullets.map((b, idx) => (
                      <li key={idx} className="leading-snug">{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] mb-2.5 text-slate-200">
            <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Featured Repositories</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {projects.map((p) => (
              <div key={p.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-white text-[11.5px] mb-0.5">{p.name}</div>
                <p className="text-slate-400 text-[10px] mb-2">{p.description}</p>
                <div className="flex flex-wrap gap-1">
                  {(p.technologies || []).map((t, idx) => (
                    <span key={idx} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Certs */}
      <div className="grid grid-cols-2 gap-3">
        {education && education.length > 0 && (
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[10.5px] text-slate-300 mb-1.5">
              <GraduationCap className="w-3 h-3 text-amber-400" />
              <span>Education</span>
            </div>
            {education.map((edu) => (
              <div key={edu.id} className="text-[10px]">
                <div className="font-bold text-white">{edu.degree}</div>
                <div className="text-slate-400">{edu.college}</div>
                <div className="text-slate-500 font-mono">{edu.startDate} – {edu.endDate} {edu.cgpa ? `| CGPA: ${edu.cgpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[10.5px] text-slate-300 mb-1.5">
              <Award className="w-3 h-3 text-indigo-400" />
              <span>Certifications</span>
            </div>
            {certifications.map((c) => (
              <div key={c.id} className="text-[10px] mb-1">
                <div className="font-semibold text-white">{c.name}</div>
                <div className="text-slate-500">{c.issuer} • {c.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

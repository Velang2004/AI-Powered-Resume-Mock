import React from 'react';
import { ResumeData } from '../../../types';

export const ProfessionalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, education, experience, projects, skills, certifications, achievements, languages } = data;

  return (
    <div className="bg-white text-slate-900 p-8 font-serif text-xs leading-relaxed max-w-[800px] mx-auto shadow-sm min-h-[1050px]">
      {/* Header Centered Classic */}
      <div className="text-center pb-4 mb-4 border-b border-slate-300">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
          {personal.fullName || 'Your Full Name'}
        </h1>
        <p className="text-xs font-medium text-slate-700 italic tracking-wider mt-0.5">
          {personal.title || 'Professional Title'}
        </p>

        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mt-2 text-[10.5px] text-slate-600 font-sans">
          {personal.location && <span>{personal.location}</span>}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.email && <span>• {personal.email}</span>}
          {personal.linkedin && <span>• {personal.linkedin.replace(/^https?:\/\//, '')}</span>}
          {personal.github && <span>• {personal.github.replace(/^https?:\/\//, '')}</span>}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-4">
          <h2 className="text-[11.5px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5 font-sans">
            Executive Summary
          </h2>
          <p className="text-slate-800 text-[11px] leading-relaxed text-justify font-sans">{personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[11.5px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-0.5 mb-2 font-sans">
            Professional Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-sans">
                  <span className="font-bold text-slate-900 text-[11.5px]">{exp.company}</span>
                  <span className="text-[10px] text-slate-600 italic">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate} | {exp.location}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-800 italic mb-1 font-sans">
                  {exp.jobTitle}
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 text-[10.5px] font-sans">
                    {exp.bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
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
        <div className="mb-4">
          <h2 className="text-[11.5px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-0.5 mb-2 font-sans">
            Selected Technical Projects
          </h2>
          <div className="space-y-2 font-sans">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-[11px]">{proj.name}</span>
                  {proj.technologies && (
                    <span className="text-[9.5px] text-slate-600 italic">({proj.technologies.join(', ')})</span>
                  )}
                </div>
                {proj.description && <p className="text-slate-700 text-[10.5px] mt-0.5">{proj.description}</p>}
                {proj.bullets && (
                  <ul className="list-disc list-outside ml-4 text-slate-800 text-[10px] space-y-0.5 mt-0.5">
                    {proj.bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && (
        <div className="mb-4 font-sans">
          <h2 className="text-[11.5px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5 font-sans">
            Core Competencies & Technical Skills
          </h2>
          <div className="text-[10.5px] space-y-1 text-slate-800">
            <div>
              <strong className="text-slate-900">Languages & Frameworks: </strong>
              <span>{[...(skills.languages || []), ...(skills.frameworks || [])].join(', ')}</span>
            </div>
            <div>
              <strong className="text-slate-900">Databases & Cloud: </strong>
              <span>{[...(skills.databases || []), ...(skills.cloud || [])].join(', ')}</span>
            </div>
            <div>
              <strong className="text-slate-900">AI & Engineering Tools: </strong>
              <span>{[...(skills.aiml || []), ...(skills.tools || [])].join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Education & Certs */}
      <div className="grid grid-cols-2 gap-4 font-sans">
        {education && education.length > 0 && (
          <div>
            <h2 className="text-[11.5px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
              Education
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="text-[10.5px]">
                <div className="font-bold text-slate-900">{edu.degree}</div>
                <div className="text-slate-700">{edu.college}</div>
                <div className="text-slate-500 text-[9.5px]">{edu.startDate} – {edu.endDate} {edu.cgpa ? `| ${edu.cgpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-[11.5px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
              Certifications & Honors
            </h2>
            {certifications.map((c) => (
              <div key={c.id} className="text-[10.5px] mb-1">
                <div className="font-semibold text-slate-900">{c.name}</div>
                <div className="text-slate-500 text-[9.5px]">{c.issuer} ({c.date})</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

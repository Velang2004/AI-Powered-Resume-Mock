import React from 'react';
import { ResumeData } from '../../../types';

export const MinimalAtsTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, education, experience, projects, skills, certifications } = data;

  return (
    <div className="bg-white text-black p-8 font-mono text-[11px] leading-relaxed max-w-[800px] mx-auto shadow-sm min-h-[1050px]">
      {/* ATS Header (Single-column, zero parsing friction) */}
      <div className="text-center pb-3 mb-3 border-b-2 border-black">
        <h1 className="text-xl font-bold tracking-wider uppercase">{personal.fullName || 'FULL NAME'}</h1>
        <p className="text-xs font-semibold uppercase mt-0.5">{personal.title || 'JOB TITLE'}</p>
        <p className="text-[10px] mt-1">
          {[personal.location, personal.phone, personal.email, personal.linkedin, personal.github]
            .filter(Boolean)
            .join(' | ')}
        </p>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-justify leading-snug">{personal.summary}</p>
        </div>
      )}

      {/* Skills */}
      {skills && (
        <div className="mb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1">
            TECHNICAL SKILLS
          </h2>
          <ul className="space-y-0.5">
            {skills.languages?.length > 0 && (
              <li>
                <strong>Programming Languages: </strong>
                {skills.languages.join(', ')}
              </li>
            )}
            {skills.frameworks?.length > 0 && (
              <li>
                <strong>Frameworks & Libraries: </strong>
                {skills.frameworks.join(', ')}
              </li>
            )}
            {skills.databases?.length > 0 && (
              <li>
                <strong>Databases & Storage: </strong>
                {skills.databases.join(', ')}
              </li>
            )}
            {skills.cloud?.length > 0 && (
              <li>
                <strong>Cloud & Infrastructure: </strong>
                {skills.cloud.join(', ')}
              </li>
            )}
            {skills.aiml?.length > 0 && (
              <li>
                <strong>AI & Machine Learning: </strong>
                {skills.aiml.join(', ')}
              </li>
            )}
            {skills.tools?.length > 0 && (
              <li>
                <strong>Developer Tooling: </strong>
                {skills.tools.join(', ')}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1.5">
            WORK EXPERIENCE
          </h2>
          <div className="space-y-2.5">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold">
                  <span>{exp.company} — {exp.jobTitle}</span>
                  <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="text-[10px] italic mb-0.5">{exp.location}</div>
                {exp.bullets && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5">
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
        <div className="mb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1.5">
            PROJECTS
          </h2>
          <div className="space-y-2">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="font-bold">
                  {proj.name} {proj.technologies ? `(${proj.technologies.join(', ')})` : ''}
                </div>
                {proj.description && <p className="text-[10px]">{proj.description}</p>}
                {proj.bullets && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-[10.5px]">
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

      {/* Education & Certifications */}
      <div className="grid grid-cols-2 gap-4">
        {education && education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1">
              EDUCATION
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="text-[10px]">
                <div className="font-bold">{edu.degree}</div>
                <div>{edu.college} ({edu.startDate} - {edu.endDate})</div>
                {edu.cgpa && <div>CGPA: {edu.cgpa}</div>}
              </div>
            ))}
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1">
              CERTIFICATIONS
            </h2>
            {certifications.map((c) => (
              <div key={c.id} className="text-[10px]">
                <span className="font-bold">{c.name}</span> — {c.issuer} ({c.date})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { ResumeData } from '../../../types';

export const SinglePageAtsTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, education, experience, projects, skills, certifications, achievements } = data;
  const accentColor = data.themeColor || '#1e40af';

  return (
    <div
      className="bg-white text-slate-900 px-7 py-5 font-sans text-[9.5px] leading-[1.3] max-w-[800px] w-full mx-auto select-text shadow-sm"
      style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif",
        minHeight: '1050px',
        maxHeight: '1120px',
        boxSizing: 'border-box',
      }}
    >
      {/* HEADER */}
      <div className="text-center mb-2.5">
        <h1
          className="text-[17px] font-bold tracking-[0.22em] text-slate-900 uppercase leading-none mb-1"
          style={{ letterSpacing: '0.22em' }}
        >
          {personal.fullName || 'VELAN G'}
        </h1>
        
        <p className="text-[11px] font-semibold mb-1" style={{ color: accentColor }}>
          {personal.title || 'Python Backend Developer and ML/AI Engineer'}
        </p>

        <div className="flex flex-wrap justify-center items-center gap-x-2 text-[9.5px]" style={{ color: accentColor }}>
          {personal.phone && <span>{personal.phone}</span>}
          {personal.email && (
            <>
              <span className="text-slate-400">|</span>
              <a href={`mailto:${personal.email}`} className="hover:underline" style={{ color: accentColor }}>
                {personal.email}
              </a>
            </>
          )}
          {personal.linkedin && (
            <>
              <span className="text-slate-400">|</span>
              <a
                href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
                style={{ color: accentColor }}
              >
                LinkedIn
              </a>
            </>
          )}
          {personal.github && (
            <>
              <span className="text-slate-400">|</span>
              <a
                href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
                style={{ color: accentColor }}
              >
                GitHub
              </a>
            </>
          )}
          {personal.portfolio && (
            <>
              <span className="text-slate-400">|</span>
              <a
                href={personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
                style={{ color: accentColor }}
              >
                Portfolio
              </a>
            </>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      {personal.summary && (
        <div className="mb-2">
          <div className="flex items-center justify-between border-b border-slate-300 pb-0.5 mb-1">
            <h2 className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: accentColor }}>
              S U M M A R Y
            </h2>
          </div>
          <p className="text-slate-800 text-[9.3px] leading-[1.32] text-justify">
            {personal.summary}
          </p>
        </div>
      )}

      {/* SKILLS */}
      {skills && (
        <div className="mb-2">
          <div className="flex items-center justify-between border-b border-slate-300 pb-0.5 mb-1">
            <h2 className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: accentColor }}>
              S K I L L S
            </h2>
          </div>
          <div className="space-y-[2px] text-[9.2px] text-slate-800 leading-[1.28]">
            {skills.languages?.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">Languages & Backend: </span>
                <span>{skills.languages.join(', ')}</span>
              </div>
            )}
            {skills.frameworks?.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">Machine Learning: </span>
                <span>{skills.frameworks.join(', ')}</span>
              </div>
            )}
            {skills.aiml?.length > 0 && (
              <>
                <div>
                  <span className="font-bold text-slate-900">Deep Learning & NLP: </span>
                  <span>{skills.aiml.slice(0, 7).join(', ')}</span>
                </div>
                {skills.aiml.length > 7 && (
                  <div>
                    <span className="font-bold text-slate-900">LLM & AI Agents: </span>
                    <span>{skills.aiml.slice(7, 12).join(', ')}</span>
                  </div>
                )}
                {skills.aiml.length > 12 && (
                  <div>
                    <span className="font-bold text-slate-900">Speech AI: </span>
                    <span>{skills.aiml.slice(12).join(', ')}</span>
                  </div>
                )}
              </>
            )}
            {((skills.databases?.length || 0) > 0 || (skills.cloud?.length || 0) > 0) && (
              <div>
                <span className="font-bold text-slate-900">Data, Cloud & DevOps: </span>
                <span>{[...(skills.databases || []), ...(skills.cloud || [])].join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXPERIENCE / INTERNSHIP EXPERIENCE */}
      {experience && experience.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between border-b border-slate-300 pb-0.5 mb-1">
            <h2 className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: accentColor }}>
              I N T E R N S H I P   E X P E R I E N C E
            </h2>
          </div>
          <div className="space-y-1.5">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline text-[9.5px]">
                  <span className="font-bold" style={{ color: accentColor }}>
                    {exp.company}{exp.location ? `, ${exp.location}` : ''} — {exp.jobTitle}
                  </span>
                  <span className="font-bold text-[9.5px]" style={{ color: accentColor }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-3.5 space-y-[1.5px] text-slate-800 text-[9.2px] leading-[1.28] mt-0.5">
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

      {/* PROJECTS */}
      {projects && projects.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between border-b border-slate-300 pb-0.5 mb-1">
            <h2 className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: accentColor }}>
              P R O J E C T S
            </h2>
          </div>
          <div className="space-y-1.5">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline text-[9.5px]">
                  <span className="font-bold" style={{ color: accentColor }}>
                    {proj.name}
                  </span>
                  <span className="font-bold text-[9.5px]" style={{ color: accentColor }}>
                    {proj.startDate || 'Feb 2026'} – {proj.endDate || 'May 2026'}
                  </span>
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="text-[9.2px] text-slate-800 mt-[1px]">
                    <span className="font-semibold">Stack: </span>
                    <span>{proj.technologies.join(', ')}</span>
                  </div>
                )}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-3.5 space-y-[1.5px] text-slate-800 text-[9.2px] leading-[1.28] mt-0.5">
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

      {/* AWARDS & LEADERSHIP */}
      {achievements && achievements.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between border-b border-slate-300 pb-0.5 mb-1">
            <h2 className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: accentColor }}>
              A W A R D S   &   L E A D E R S H I P
            </h2>
          </div>
          <ul className="list-disc list-outside ml-3.5 space-y-[1.5px] text-slate-800 text-[9.2px] leading-[1.28]">
            {achievements.map((ach) => (
              <li key={ach.id}>
                {ach.description || ach.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* EDUCATION */}
      {education && education.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between border-b border-slate-300 pb-0.5 mb-1">
            <h2 className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: accentColor }}>
              E D U C A T I O N
            </h2>
          </div>
          <ul className="list-disc list-outside ml-3.5 space-y-[1.5px] text-slate-800 text-[9.2px] leading-[1.28]">
            {education.map((edu) => (
              <li key={edu.id}>
                <span className="font-semibold">{edu.degree}</span>
                {edu.startDate && edu.endDate && ` | ${edu.startDate} – ${edu.endDate}`}
                {edu.cgpa && ` | CGPA: ${edu.cgpa}`}
                {edu.college && (
                  <div className="text-slate-700">
                    {edu.college}{edu.location ? `, ${edu.location}` : ''}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CERTIFICATIONS */}
      {certifications && certifications.length > 0 && (
        <div>
          <div className="flex items-center justify-between border-b border-slate-300 pb-0.5 mb-1">
            <h2 className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: accentColor }}>
              C E R T I F I C A T I O N S
            </h2>
          </div>
          <div className="space-y-[1.5px] text-slate-800 text-[9.2px] leading-[1.28]">
            {/* Render pairwise on single line with pipes */}
            {certifications.reduce((rows: any[][], cert, idx) => {
              if (idx % 2 === 0) rows.push([cert]);
              else rows[rows.length - 1].push(cert);
              return rows;
            }, []).map((pair, rowIdx) => (
              <div key={rowIdx} className="flex items-center gap-1.5 ml-3.5">
                <span className="text-slate-900">•</span>
                <span>
                  {pair.map((c) => `${c.name} — ${c.issuer} (${c.date})`).join('  |  ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

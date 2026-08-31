import React from 'react';
import { ResumeData } from '../../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar, ExternalLink } from 'lucide-react';

export const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, education, experience, projects, skills, certifications, achievements, languages, publications, volunteer, themeColor } = data;

  return (
    <div className="bg-white text-slate-800 p-8 font-sans text-xs leading-relaxed max-w-[800px] mx-auto shadow-sm min-h-[1050px]">
      {/* Header Band */}
      <div className="border-b-2 pb-5 mb-5" style={{ borderColor: themeColor || '#2563eb' }}>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
          {personal.fullName || 'Your Full Name'}
        </h1>
        <p className="text-sm font-semibold tracking-wide mt-1" style={{ color: themeColor || '#2563eb' }}>
          {personal.title || 'Professional Title'}
        </p>

        {/* Contact Info Pills */}
        <div className="flex flex-wrap gap-y-1.5 gap-x-4 mt-3 text-[11px] text-slate-600">
          {personal.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              {personal.email}
            </span>
          )}
          {personal.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              {personal.phone}
            </span>
          )}
          {personal.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {personal.location}
            </span>
          )}
          {personal.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3 h-3 text-slate-400" />
              {personal.linkedin.replace(/^https?:\/\//, '')}
            </span>
          )}
          {personal.github && (
            <span className="flex items-center gap-1">
              <Github className="w-3 h-3 text-slate-400" />
              {personal.github.replace(/^https?:\/\//, '')}
            </span>
          )}
          {personal.portfolio && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              {personal.portfolio.replace(/^https?:\/\//, '')}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-2" style={{ color: themeColor || '#2563eb' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor || '#2563eb' }} />
            Professional Summary
          </h2>
          <p className="text-slate-700 leading-normal text-justify text-[11.5px]">{personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{ color: themeColor || '#2563eb' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor || '#2563eb' }} />
            Work Experience
          </h2>
          <div className="space-y-3.5">
            {experience.map((exp) => (
              <div key={exp.id} className="relative pl-3 border-l-2 border-slate-200">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-slate-900 text-[12px]">{exp.jobTitle}</span>
                  <span className="text-[10.5px] font-medium text-slate-500 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 font-medium mb-1">
                  <span>{exp.company}</span>
                  <span>{exp.location}</span>
                </div>
                {exp.description && <p className="text-slate-600 mb-1 italic text-[11px]">{exp.description}</p>}
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-3.5 space-y-1 text-slate-700 text-[11px]">
                    {exp.bullets.map((bullet, idx) => (
                      <li key={idx} className="leading-snug">{bullet}</li>
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
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{ color: themeColor || '#2563eb' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor || '#2563eb' }} />
            Key Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-slate-900 text-[11.5px] flex items-center gap-1.5">
                    {proj.name}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </span>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="bg-white px-1.5 py-0.5 rounded text-[9.5px] font-medium border border-slate-200 text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {proj.description && <p className="text-slate-600 text-[11px] mb-1">{proj.description}</p>}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-slate-700 text-[10.5px]">
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

      {/* Skills Grid */}
      {skills && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: themeColor || '#2563eb' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor || '#2563eb' }} />
            Technical & Soft Skills
          </h2>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {skills.languages?.length > 0 && (
              <div>
                <span className="font-semibold text-slate-800">Languages: </span>
                <span className="text-slate-600">{skills.languages.join(', ')}</span>
              </div>
            )}
            {skills.frameworks?.length > 0 && (
              <div>
                <span className="font-semibold text-slate-800">Frameworks: </span>
                <span className="text-slate-600">{skills.frameworks.join(', ')}</span>
              </div>
            )}
            {skills.databases?.length > 0 && (
              <div>
                <span className="font-semibold text-slate-800">Databases: </span>
                <span className="text-slate-600">{skills.databases.join(', ')}</span>
              </div>
            )}
            {skills.cloud?.length > 0 && (
              <div>
                <span className="font-semibold text-slate-800">Cloud & DevOps: </span>
                <span className="text-slate-600">{skills.cloud.join(', ')}</span>
              </div>
            )}
            {skills.aiml?.length > 0 && (
              <div>
                <span className="font-semibold text-slate-800">AI / ML: </span>
                <span className="text-slate-600">{skills.aiml.join(', ')}</span>
              </div>
            )}
            {skills.tools?.length > 0 && (
              <div>
                <span className="font-semibold text-slate-800">Tools: </span>
                <span className="text-slate-600">{skills.tools.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Education & Certifications 2-col */}
      <div className="grid grid-cols-2 gap-4">
        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: themeColor || '#2563eb' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor || '#2563eb' }} />
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="text-[11px]">
                  <div className="font-bold text-slate-800">{edu.degree}</div>
                  <div className="text-slate-600">{edu.college} {edu.university ? `(${edu.university})` : ''}</div>
                  <div className="text-slate-500 text-[10px]">{edu.startDate} – {edu.endDate} {edu.cgpa ? `| CGPA: ${edu.cgpa}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: themeColor || '#2563eb' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor || '#2563eb' }} />
              Certifications
            </h2>
            <div className="space-y-1.5">
              {certifications.map((cert) => (
                <div key={cert.id} className="text-[11px]">
                  <div className="font-semibold text-slate-800">{cert.name}</div>
                  <div className="text-slate-500 text-[10px]">{cert.issuer} • {cert.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

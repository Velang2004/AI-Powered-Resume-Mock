import React, { useState } from 'react';
import { Job, ResumeData } from '../../types';
import { INITIAL_JOBS } from '../../data/mockData';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Sparkles,
  CheckCircle,
  Building,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

interface JobMatchingBoardProps {
  resumeData: ResumeData;
  onSelectJobForCustomization?: (job: Job) => void;
}

export const JobMatchingBoard: React.FC<JobMatchingBoardProps> = ({
  resumeData,
  onSelectJobForCustomization,
}) => {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>(['job-1']);

  // Calculate matching score for each job dynamically based on skills overlap
  const calculateMatchScore = (job: Job): number => {
    const resumeSkills = [
      ...(resumeData.skills.languages || []),
      ...(resumeData.skills.frameworks || []),
      ...(resumeData.skills.databases || []),
      ...(resumeData.skills.cloud || []),
      ...(resumeData.skills.aiml || []),
      ...(resumeData.skills.tools || []),
    ].map((s) => s.toLowerCase());

    const required = job.skillsRequired || job.requiredSkills || [];
    const matched = required.filter((reqSkill) =>
      resumeSkills.some((userSkill) => userSkill.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(userSkill))
    );

    const baseScore = Math.round((matched.length / Math.max(1, required.length)) * 100);
    return Math.max(65, Math.min(99, baseScore));
  };

  const handleApply = (jobId: string) => {
    if (!appliedJobIds.includes(jobId)) {
      setAppliedJobIds([...appliedJobIds, jobId]);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const skills = job.skillsRequired || job.requiredSkills || [];
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'all' || job.jobType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Intelligent Job Matching & Requisitions
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI calculates precision match scores by correlating your verified experience and technical skills with live openings.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              placeholder="Search by title, stack (e.g. React, Python), or company..."
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Employment Types</option>
              <option value="full-time">Full-Time</option>
              <option value="contract">Contract</option>
              <option value="part-time">Part-Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map((job) => {
          const matchScore = calculateMatchScore(job);
          const isApplied = appliedJobIds.includes(job.id);

          return (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 transition shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header row with Match Badge */}
                <div className="flex justify-between items-start gap-2 mb-2.5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {job.company}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 shrink-0 ${
                      matchScore >= 85
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{matchScore}% Match</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {job.description}
                </p>

                {/* Tags and Metadata */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10.5px] font-semibold flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-500" />
                    {job.salaryRange}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10.5px] font-medium">
                    {job.experienceLevel}
                  </span>
                  {job.remote && (
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-md text-[10.5px] font-medium">
                      Remote Friendly
                    </span>
                  )}
                </div>

                {/* Required Skills */}
                <div className="mb-4">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Required Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(job.skillsRequired || job.requiredSkills || []).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-medium">Posted {job.postedDate}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectJobForCustomization && onSelectJobForCustomization(job)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition"
                  >
                    Tailor Resume
                  </button>

                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={isApplied}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                      isApplied
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <span>Quick Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

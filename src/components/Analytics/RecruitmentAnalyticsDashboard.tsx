import React from 'react';
import { MysqlLiveMonitor } from './MysqlLiveMonitor';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  FileCheck,
  Building,
  Target,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

const FUNNEL_DATA = [
  { name: 'Applied', candidates: 342, fill: '#3b82f6' },
  { name: 'ATS Passed (80%+)', candidates: 215, fill: '#6366f1' },
  { name: 'AI Mock Screened', candidates: 128, fill: '#8b5cf6' },
  { name: 'Technical Round', candidates: 64, fill: '#ec4899' },
  { name: 'Offer Extended', candidates: 18, fill: '#10b981' },
];

const SKILLS_DEMAND = [
  { skill: 'React/TS', demand: 94 },
  { skill: 'FastAPI/Python', demand: 88 },
  { skill: 'AWS Cloud', demand: 82 },
  { skill: 'Docker/K8s', demand: 76 },
  { skill: 'Gemini/LLMs', demand: 89 },
  { skill: 'Postgres/MySQL', demand: 72 },
];

const SCORE_DISTRIBUTION = [
  { range: '<60', count: 18 },
  { range: '60-70', count: 42 },
  { range: '71-80', count: 85 },
  { range: '81-90', count: 142 },
  { range: '91-100', count: 55 },
];

const CANDIDATE_LEADERBOARD = [
  { name: 'Velan G', role: 'Senior Full-Stack Engineer', atsScore: 96, interviewScore: 94, status: 'Shortlisted' },
  { name: 'Sarah Chen', role: 'AI Platform Engineer', atsScore: 93, interviewScore: 91, status: 'Offer Stage' },
  { name: 'Marcus Brody', role: 'Cloud Architect', atsScore: 90, interviewScore: 88, status: 'Interviewing' },
  { name: 'Priya Sharma', role: 'Frontend Lead', atsScore: 89, interviewScore: 89, status: 'Screened' },
];

export const RecruitmentAnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Live Real-Time MySQL Database Monitor */}
      <MysqlLiveMonitor />

      {/* Header Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Candidates', val: '342', change: '+18% this month', icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
          { label: 'Avg ATS Pass Rate', val: '84.6%', change: '+6.2% optimization', icon: FileCheck, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
          { label: 'AI Mock Interviews', val: '186', change: 'avg 88.4 / 100', icon: Award, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
          { label: 'Time-to-Hire', val: '12 Days', change: '-40% industry avg', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stat.val}</div>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Pipeline Funnel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Recruitment Funnel & Pipeline Velocity
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Live Sync</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FUNNEL_DATA} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#888' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="candidates" radius={[0, 6, 6, 0]}>
                  {FUNNEL_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* In-Demand Stacks Index */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Requisition Skills Demand Index
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Q3 Benchmark</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SKILLS_DEMAND} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="skill" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="demand" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Candidate Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Top Screened Talent Leaderboard
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold text-[11px] uppercase">
                <th className="pb-3">Candidate</th>
                <th className="pb-3">Specialization</th>
                <th className="pb-3 text-center">ATS Score</th>
                <th className="pb-3 text-center">AI Mock Score</th>
                <th className="pb-3 text-right">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {CANDIDATE_LEADERBOARD.map((cand, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{cand.name}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">{cand.role}</td>
                  <td className="py-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold font-mono text-[11px]">
                      {cand.atsScore}%
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold font-mono text-[11px]">
                      {cand.interviewScore}%
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10.5px]">
                      {cand.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

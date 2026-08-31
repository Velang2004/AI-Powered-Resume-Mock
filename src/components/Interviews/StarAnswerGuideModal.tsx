import React from 'react';
import { X, Sparkles, CheckCircle2, Lightbulb, Target, Rocket, Award } from 'lucide-react';
import { ResumeData } from '../../types';

interface StarAnswerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  questionCategory?: string;
}

export const StarAnswerGuideModal: React.FC<StarAnswerGuideModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  questionCategory,
}) => {
  if (!isOpen) return null;

  const sampleProject = resumeData.projects?.[0]?.name || 'Full-Stack Distributed Platform';
  const sampleCompany = resumeData.experience?.[0]?.company || 'NeuroScale Technologies';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                STAR Method & Spoken Delivery Coach
              </h3>
              <p className="text-xs text-slate-500">
                Formula for answering technical & behavioral interview questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Situation */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                S
              </span>
              Situation (15-20s)
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Set the high-level context, scale, or business bottleneck without getting lost in trivial details.
            </p>
            <div className="text-[10px] italic text-blue-900 dark:text-blue-200 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg">
              "At {sampleCompany}, our API endpoints experienced latency spikes during peak 50k MAU traffic..."
            </div>
          </div>

          {/* Task */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                T
              </span>
              Task (10-15s)
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Define your direct ownership, technical goal, or specific engineering constraint.
            </p>
            <div className="text-[10px] italic text-indigo-900 dark:text-indigo-200 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg">
              "My objective was to isolate the slow queries, decouple synchronous tasks, and keep p99 under 300ms."
            </div>
          </div>

          {/* Action */}
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                A
              </span>
              Action (60-90s - The Core)
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Detail your technical design choices, tools used (e.g. FastAPI, Redis, Docker), and trade-offs made.
            </p>
            <div className="text-[10px] italic text-purple-900 dark:text-purple-200 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg">
              "I introduced Redis connection pooling, moved intensive payload tasks to Celery background workers, and..."
            </div>
          </div>

          {/* Result */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                R
              </span>
              Result (15-20s)
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Quantify the measured impact: latency reductions, cost savings, uptime, or team productivity.
            </p>
            <div className="text-[10px] italic text-emerald-900 dark:text-emerald-200 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg">
              "Slashed query latency by 45%, achieved 99.9% uptime, and enabled 4x concurrency throughput."
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Spoken Voice Delivery Guidelines:
          </div>
          <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 ml-4 list-disc">
            <li><strong>Embrace Short Pauses:</strong> Take a 2-second pause before speaking rather than saying "um" or "like".</li>
            <li><strong>Keep Optimal Pace:</strong> Aim for 130–160 WPM — our live speedometer will guide your cadence.</li>
            <li><strong>Use Concrete Tech Terms:</strong> Name frameworks, indices, protocols, and architectural patterns directly.</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Got It, Back to Interview
          </button>
        </div>
      </div>
    </div>
  );
};

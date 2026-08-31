import React from 'react';
import { Volume2, Check, UserCheck, Sparkles, Sliders } from 'lucide-react';

export interface InterviewerPersona {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  tone: string;
  voiceName: string;
  pitch: number;
  rate: number;
}

export const INTERVIEWER_PERSONAS: InterviewerPersona[] = [
  {
    id: 'sarah',
    name: 'Dr. Sarah Chen',
    role: 'Principal Cloud & Systems Architect',
    company: 'Tier-1 Enterprise Tech',
    avatar: '👩‍💼',
    tone: 'Direct, analytical, focuses on concurrency & microservice resilience.',
    voiceName: 'Kore',
    pitch: 1.05,
    rate: 1.0,
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    role: 'VP of Engineering',
    company: 'Fast-Growth AI Unicorn',
    avatar: '👨‍💼',
    tone: 'Strategic, evaluates cross-functional trade-offs, architecture & engineering velocity.',
    voiceName: 'Fenrir',
    pitch: 0.95,
    rate: 1.0,
  },
  {
    id: 'maya',
    name: 'Maya Lin',
    role: 'Staff Frontend & Systems Engineer',
    company: 'Next-Gen SaaS Cloud',
    avatar: '👩‍💻',
    tone: 'Pragmatic, inspects state management, React lifecycles, and sub-second UX metrics.',
    voiceName: 'Puck',
    pitch: 1.1,
    rate: 1.05,
  },
  {
    id: 'david',
    name: 'David Miller',
    role: 'Senior Director of Talent & Org',
    company: 'Global Talent Partners',
    avatar: '🧑‍💼',
    tone: 'Warm yet rigorous, assesses STAR behavioral scenarios, conflict resolution & ownership.',
    voiceName: 'Aoede',
    pitch: 1.0,
    rate: 0.98,
  },
];

interface InterviewerPersonaCardProps {
  selectedPersona: InterviewerPersona;
  onSelectPersona: (persona: InterviewerPersona) => void;
  speechRate: number;
  onChangeSpeechRate: (rate: number) => void;
  onTestVoice: (persona: InterviewerPersona) => void;
  disabled?: boolean;
}

export const InterviewerPersonaCard: React.FC<InterviewerPersonaCardProps> = ({
  selectedPersona,
  onSelectPersona,
  speechRate,
  onChangeSpeechRate,
  onTestVoice,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Select AI Interviewer Persona & Voice
          </h4>
          <p className="text-[11px] text-slate-500">
            Each persona brings specialized evaluation criteria and natural spoken cadences.
          </p>
        </div>

        {/* Speech Rate Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <span className="text-[10px] font-semibold text-slate-500 pl-1.5 flex items-center gap-1">
            <Sliders className="w-3 h-3" /> Rate:
          </span>
          {[0.9, 1.0, 1.15, 1.25].map((rate) => (
            <button
              key={rate}
              onClick={() => onChangeSpeechRate(rate)}
              disabled={disabled}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                speechRate === rate
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {INTERVIEWER_PERSONAS.map((persona) => {
          const isSelected = selectedPersona.id === persona.id;
          return (
            <div
              key={persona.id}
              onClick={() => !disabled && onSelectPersona(persona)}
              className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-xs">
                    {persona.avatar}
                  </div>
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTestVoice(persona);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Sample AI Voice"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  {persona.name}
                </div>
                <div className="text-[10.5px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {persona.role}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{persona.company}</div>

                <p className="text-[10.5px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {persona.tone}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[9.5px] font-mono text-slate-400">
                  Voice: {persona.voiceName}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTestVoice(persona);
                  }}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" /> Test
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { Gauge, Clock, Sparkles, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SpeechSpeedometerProps {
  text: string;
  durationSeconds: number;
  isListening: boolean;
}

export const SpeechSpeedometer: React.FC<SpeechSpeedometerProps> = ({
  text = '',
  durationSeconds = 0,
  isListening = false,
}) => {
  const safeText = text || '';
  const words = safeText.trim() ? safeText.trim().split(/\s+/) : [];
  const wordCount = words.length;

  // Calculate WPM
  const minutes = Math.max(0.1, (durationSeconds || 0) / 60);
  const wpm = Math.round(wordCount / minutes);

  // Determine Pace status
  let paceStatus: { label: string; color: string; badgeClass: string } = {
    label: 'Ready',
    color: 'text-slate-400',
    badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  if (wordCount > 5) {
    if (wpm < 100) {
      paceStatus = {
        label: 'Deliberate / Slow',
        color: 'text-amber-500',
        badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      };
    } else if (wpm <= 165) {
      paceStatus = {
        label: 'Optimal Cadence (130-160 WPM)',
        color: 'text-emerald-500',
        badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      };
    } else {
      paceStatus = {
        label: 'Fast Pace (>165 WPM)',
        color: 'text-amber-600',
        badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      };
    }
  }

  // Live filler words tracking
  const fillerDefinitions = ['um', 'uh', 'like', 'basically', 'actually', 'literally', 'you know', 'sort of', 'kind of'];
  const lowerText = safeText.toLowerCase();
  const detectedFillers: { word: string; count: number }[] = [];

  fillerDefinitions.forEach((fw) => {
    const regex = new RegExp(`\\b${fw}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      detectedFillers.push({ word: fw, count: matches.length });
    }
  });

  const totalFillers = detectedFillers.reduce((acc, curr) => acc + curr.count, 0);

  // STAR indicator detection
  const starIndicators = [
    { key: 'Situation', pattern: /situation|context|problem|initial|background/i },
    { key: 'Task', pattern: /task|objective|goal|responsibility|needed to/i },
    { key: 'Action', pattern: /architected|spearheaded|engineered|implemented|designed|built|optimized/i },
    { key: 'Result', pattern: /result|achieved|reduced|boosted|increased|improved|metrics|%|latency/i },
  ];

  const detectedStarParts = starIndicators.filter((s) => s.pattern.test(lowerText));

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Live Speech & Cadence Coach
          </span>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${paceStatus.badgeClass}`}
        >
          {paceStatus.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] text-slate-400 font-medium">Spoken Words</div>
          <div className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
            {wordCount}
          </div>
        </div>

        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] text-slate-400 font-medium">Speaking Pace</div>
          <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {wordCount > 5 ? `${wpm} WPM` : '--'}
          </div>
        </div>

        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] text-slate-400 font-medium">Filler Count</div>
          <div
            className={`text-sm font-bold mt-0.5 ${
              totalFillers === 0
                ? 'text-emerald-600'
                : totalFillers < 3
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}
          >
            {totalFillers}
          </div>
        </div>
      </div>

      {/* Detected Filler chips */}
      {detectedFillers.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Detected Fillers:
          </span>
          {detectedFillers.map((f, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded text-[10px] font-semibold"
            >
              "{f.word}" ({f.count}x)
            </span>
          ))}
        </div>
      )}

      {/* STAR structure indicators */}
      <div className="pt-1 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500">STAR Alignment:</span>
        <div className="flex items-center gap-1">
          {starIndicators.map((s) => {
            const hasIt = detectedStarParts.some((dp) => dp.key === s.key);
            return (
              <span
                key={s.key}
                className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold transition ${
                  hasIt
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-slate-200/70 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                }`}
                title={hasIt ? `${s.key} components identified` : `Include ${s.key} in your response`}
              >
                {s.key[0]} ({s.key})
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

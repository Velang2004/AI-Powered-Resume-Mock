import React, { useState } from 'react';
import { ResumeData } from '../../types';
import { apiService } from '../../services/api';
import { Sparkles, Check, X, Loader2, Wand2, CheckCircle2 } from 'lucide-react';

interface AiPolishModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  onApplyPolishedData: (polished: ResumeData) => void;
}

export const AiPolishModal: React.FC<AiPolishModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  onApplyPolishedData,
}) => {
  const [targetJobTitle, setTargetJobTitle] = useState(resumeData.personal.title || 'Senior Full-Stack Engineer');
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedResult, setPolishedResult] = useState<ResumeData | null>(null);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartPolish = async () => {
    setIsPolishing(true);
    setError(null);
    try {
      const res = await apiService.polishResume(resumeData, targetJobTitle);
      setPolishedResult(res.polishedResume);
      setImprovements(res.improvements || []);
    } catch (err: any) {
      setError(err.message || 'Failed to polish resume with Gemini AI');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleApply = () => {
    if (polishedResult) {
      onApplyPolishedData(polishedResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                ✨ AI Resume Polisher & Impact Enhancer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rewrites summaries and transforms experience bullets into quantified metric-driven statements.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Role Tuning */}
          <div className="bg-blue-50/70 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Role / Industry Specialization:
              </label>
              <input
                type="text"
                value={targetJobTitle}
                onChange={(e) => setTargetJobTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                placeholder="e.g. Lead Cloud Architect / Senior Full-Stack Engineer"
              />
            </div>
            <button
              onClick={handleStartPolish}
              disabled={isPolishing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-md transition"
            >
              {isPolishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Polishing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Polished Content</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Side-by-Side Comparison */}
          {polishedResult ? (
            <div className="space-y-4">
              {improvements.length > 0 && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    AI Polish Enhancements Summary:
                  </span>
                  <ul className="list-disc list-outside ml-4 space-y-1 text-emerald-900 dark:text-emerald-200 text-[11px]">
                    {improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Original */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-2">Original Version</div>
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <div>
                      <strong className="block text-slate-900 dark:text-white mb-0.5">Summary:</strong>
                      <p className="italic text-[11px]">{resumeData.personal.summary || 'None'}</p>
                    </div>
                    <div>
                      <strong className="block text-slate-900 dark:text-white mb-0.5">Experience Samples:</strong>
                      <ul className="list-disc list-outside ml-4 space-y-1 text-[11px]">
                        {(resumeData.experience?.[0]?.bullets || []).slice(0, 3).map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Polished */}
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20">
                  <div className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Polished Version
                  </div>
                  <div className="space-y-3 text-slate-800 dark:text-slate-200">
                    <div>
                      <strong className="block text-blue-700 dark:text-blue-300 mb-0.5">Enhanced Summary:</strong>
                      <p className="text-[11px] font-medium leading-relaxed">{polishedResult.personal.summary}</p>
                    </div>
                    <div>
                      <strong className="block text-blue-700 dark:text-blue-300 mb-0.5">Quantified Action Bullets:</strong>
                      <ul className="list-disc list-outside ml-4 space-y-1 text-[11px]">
                        {(polishedResult.experience?.[0]?.bullets || []).slice(0, 3).map((b, i) => (
                          <li key={i} className="text-slate-900 dark:text-slate-100 font-medium">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-blue-500/60" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">Ready to boost your resume impact</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                Gemini will scan your bullet points, compute strong action verbs, embed quantified KPIs, and format an executive summary aligned with your target position.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-xs transition"
          >
            Cancel
          </button>
          {polishedResult && (
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>Apply Polished Content to Editor</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

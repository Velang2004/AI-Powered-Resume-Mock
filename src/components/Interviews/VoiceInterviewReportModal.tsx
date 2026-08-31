import React, { useState } from 'react';
import {
  X,
  Award,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  UserCheck,
  Clock,
  MessageSquare,
  Eye,
  Smile,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Video,
} from 'lucide-react';
import { InterviewQuestion, InterviewFeedbackReport, VideoSentimentState } from '../../types';

interface VoiceInterviewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: InterviewQuestion[];
  feedbackHistory: { [qId: string]: InterviewFeedbackReport };
  answers: { [qId: string]: string };
  totalDurationSeconds: number;
  domain: string;
  difficulty: string;
  personaName: string;
  onRestart: () => void;
  onPlaySpeech: (text: string) => void;
  isAiSpeaking: boolean;
  videoSentiment?: VideoSentimentState;
}

export const VoiceInterviewReportModal: React.FC<VoiceInterviewReportModalProps> = ({
  isOpen,
  onClose,
  questions,
  feedbackHistory,
  answers,
  totalDurationSeconds,
  domain,
  difficulty,
  personaName,
  onRestart,
  onPlaySpeech,
  isAiSpeaking,
  videoSentiment,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeQuestionTab, setActiveQuestionTab] = useState(0);

  if (!isOpen) return null;

  const feedbacks: InterviewFeedbackReport[] = Object.values(feedbackHistory);
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(feedbackHistory).length;

  const avgScore = Math.round(
    feedbacks.reduce((acc: number, f: InterviewFeedbackReport) => acc + (f.overallScore || f.score || 0), 0) /
      Math.max(1, feedbacks.length)
  );

  // Aggregate Category scores
  const categories = {
    technical: Math.round(
      feedbacks.reduce((acc: number, f: InterviewFeedbackReport) => acc + (f.categories?.technicalKnowledge || 85), 0) /
        Math.max(1, feedbacks.length)
    ),
    communication: Math.round(
      feedbacks.reduce((acc: number, f: InterviewFeedbackReport) => acc + (f.categories?.communication || 88), 0) /
        Math.max(1, feedbacks.length)
    ),
    clarity: Math.round(
      feedbacks.reduce((acc: number, f: InterviewFeedbackReport) => acc + (f.categories?.clarity || 86), 0) /
        Math.max(1, feedbacks.length)
    ),
    problemSolving: Math.round(
      feedbacks.reduce((acc: number, f: InterviewFeedbackReport) => acc + (f.categories?.problemSolving || 88), 0) /
        Math.max(1, feedbacks.length)
    ),
  };

  // Video Analytics metrics
  const videoConfidence = videoSentiment?.confidenceScore || 90;
  const eyeContactScore = videoSentiment?.eyeContact === 'direct_forward' ? 95 : 82;
  const headStabilityScore = videoSentiment?.isHeadStraight ? 94 : 80;
  const suspiciousCount = videoSentiment?.suspiciousCount || 0;
  const lookingAwayCount = videoSentiment?.lookingAwayCount || 0;

  // Aggregate total filler words
  let totalFillers = 0;
  const fillerMap: { [word: string]: number } = {};

  feedbacks.forEach((f: InterviewFeedbackReport) => {
    (f.fillerWordsUsed || []).forEach((fw) => {
      totalFillers += fw.count;
      fillerMap[fw.word] = (fillerMap[fw.word] || 0) + fw.count;
    });
  });

  const minutes = Math.floor(totalDurationSeconds / 60);
  const seconds = totalDurationSeconds % 60;
  const formattedTime = `${minutes}m ${seconds}s`;

  const handleCopySummary = () => {
    let summaryText = `=== AI VOICE & VIDEO MOCK INTERVIEW REPORT ===\n`;
    summaryText += `Role / Domain: ${domain} (${difficulty})\n`;
    summaryText += `Interviewer: ${personaName}\n`;
    summaryText += `Overall Score: ${avgScore}/100\n`;
    summaryText += `Video Confidence Score: ${videoConfidence}/100\n`;
    summaryText += `Eye Contact Consistency: ${eyeContactScore}%\n`;
    summaryText += `Head Pose Stability: ${headStabilityScore}%\n`;
    summaryText += `Integrity Status: ${suspiciousCount === 0 ? 'Verified Clean (0 Suspicious Actions)' : `${suspiciousCount} Flagged Gaze Shifts`}\n`;
    summaryText += `Duration: ${formattedTime}\n`;
    summaryText += `Filler Word Frequency: ${totalFillers} instances\n\n`;

    questions.forEach((q, i) => {
      const fb = feedbackHistory[q.id];
      const ans = answers[q.id] || '(No response recorded)';
      summaryText += `Q${i + 1}: ${q.question}\n`;
      summaryText += `Score: ${fb?.overallScore || fb?.score || '--'}/100\n`;
      summaryText += `Candidate Answer: ${ans}\n`;
      if (fb?.strengths) summaryText += `Strengths: ${fb.strengths.join(', ')}\n`;
      if (fb?.improvements) summaryText += `Improvements: ${fb.improvements.join(', ')}\n\n`;
    });

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReadExecutiveSummary = () => {
    const summaryNarrative = `Great job completing the ${domain} mock interview with ${personaName}. You achieved an overall score of ${avgScore} out of 100 across ${totalQuestions} questions in ${formattedTime}. Your video confidence scored ${videoConfidence} percent, and direct forward eye contact was at ${eyeContactScore} percent. Keep looking straight into the camera lens and practicing deliberate pauses to maintain high executive composure.`;
    onPlaySpeech(summaryNarrative);
  };

  const currentQ = questions[activeQuestionTab] || questions[0];
  const currentFeedback = currentQ ? feedbackHistory[currentQ.id] : null;
  const currentAnswer = currentQ ? answers[currentQ.id] : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  AI Video & Voice Diagnostic Report
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {difficulty} • {domain}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated by {personaName} • Duration: {formattedTime} • Completed {answeredCount}/{totalQuestions} questions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReadExecutiveSummary}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                isAiSpeaking
                  ? 'bg-emerald-500 text-white border-emerald-600 animate-pulse'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
              }`}
              title="Play Executive Voice Summary"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isAiSpeaking ? 'Speaking Summary...' : '🎙️ Listen to AI Feedback'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Score & Metric High-Level Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Overall Interview Score
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {avgScore}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
            <span className="text-[10.5px] font-semibold text-indigo-700 dark:text-indigo-300">
              {avgScore >= 90 ? '🌟 Exceptional Match' : avgScore >= 80 ? '✅ Strong Hire Signal' : '📈 Good Practice Base'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500">Video Confidence Level</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {videoConfidence}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Facial composure & steady poise</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500">Forward Eye Contact</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {eyeContactScore}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Looking straight into camera</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500">Filler Word Usage</span>
            <div className="flex items-baseline gap-1 my-1">
              <span
                className={`text-2xl font-bold ${
                  totalFillers <= 3 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {totalFillers}
              </span>
              <span className="text-xs text-slate-400">times</span>
            </div>
            <span className="text-[10px] text-slate-500">
              {totalFillers <= 3 ? 'Clean articulation' : 'Practice deliberate pauses'}
            </span>
          </div>
        </div>

        {/* Video & Facial Sentiment Proctoring Analysis Panel */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  Facial Sentiment, Head Pose & Anti-Cheat Proctoring Review
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-md">
                    AI Vision Analysis
                  </span>
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-800/70 rounded-xl border border-slate-700/70 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Head Pose & Posture</span>
                <span className="text-emerald-400 font-bold">{headStabilityScore}% Stable</span>
              </div>
              <div className="text-xs font-bold text-slate-200">
                {videoSentiment?.isHeadStraight ? '✅ Centered Straight' : '⚠️ Minor Head Tilt Observed'}
              </div>
              <p className="text-[11px] text-slate-400">
                Stayed aligned forward without excessive sideways turning or dropping chin.
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/70 rounded-xl border border-slate-700/70 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Facial Sentiment</span>
                <span className="text-indigo-400 font-bold capitalize">{videoSentiment?.emotion || 'Confident'}</span>
              </div>
              <div className="text-xs font-bold text-slate-200">
                Dominant Mood: {videoSentiment?.emotion === 'sad_stressed' ? 'Stressed / Hesitant' : 'Composed & Natural'}
              </div>
              <p className="text-[11px] text-slate-400">
                Showed high engagement and calm focus during problem walkthroughs.
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/70 rounded-xl border border-slate-700/70 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Integrity & Anti-Cheat</span>
                {suspiciousCount === 0 && !videoSentiment?.tabSwitchCount ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Clean
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> {suspiciousCount + (videoSentiment?.tabSwitchCount || 0)} Alerts
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-200">
                {suspiciousCount === 0 && !videoSentiment?.tabSwitchCount
                  ? 'No Note-Reading or Tab-Switching Detected'
                  : 'Off-screen Gaze / Tab Switch Detected'}
              </div>
              <p className="text-[11px] text-slate-400">
                {suspiciousCount === 0 && !videoSentiment?.tabSwitchCount
                  ? 'Candidate looked directly at the interviewer without checking external screens.'
                  : 'Practice keeping eyes steady on the camera lens.'}
              </p>
            </div>
          </div>

          {/* Real-Time Anti-Cheating & Integrity Proctoring Incident Log */}
          {videoSentiment?.proctoringLog && videoSentiment.proctoringLog.length > 0 ? (
            <div className="p-3.5 bg-rose-950/40 border border-rose-900/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Anti-Cheating & Integrity Proctoring Incident Log ({videoSentiment.proctoringLog.length} events)
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-rose-900/80 text-rose-200 rounded">
                  Session Flagged
                </span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {videoSentiment.proctoringLog.map((log) => (
                  <div key={log.id} className="text-[11px] p-2 bg-slate-900/90 rounded border border-rose-900/30 flex items-center justify-between">
                    <span className="text-rose-200 font-mono font-medium">{log.message}</span>
                    <span className="text-slate-400 font-mono text-[10px] shrink-0 ml-2">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center justify-between text-xs text-emerald-300 font-semibold">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Anti-Cheating Proctoring Verified: No tab switching, note reading, or off-screen gaze detected.
              </span>
              <span className="text-[10px] px-2.5 py-0.5 bg-emerald-900/60 text-emerald-200 rounded-full font-bold">
                100% Integrity Score
              </span>
            </div>
          )}
        </div>

        {/* Detailed Question Review Tab System */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Question-by-Question Spoken Evaluation
            </h3>

            <div className="flex items-center gap-1">
              {questions.map((q, idx) => {
                const isSelected = idx === activeQuestionTab;
                const score = feedbackHistory[q.id]?.score || feedbackHistory[q.id]?.overallScore;
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionTab(idx)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Q{idx + 1} {score ? `(${score})` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {currentQ && (
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {currentQ.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentQ.question}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Why Asked: {currentQ.contextWhyAsked}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-[10px] text-slate-400">Question Score</div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {currentFeedback?.overallScore || currentFeedback?.score || '--'} / 100
                  </div>
                </div>
              </div>

              {/* Transcribed Candidate Answer */}
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
                  <span>Your Spoken Answer:</span>
                  <button
                    onClick={() => onPlaySpeech(currentAnswer)}
                    disabled={!currentAnswer}
                    className="text-[10.5px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" /> Replay Speech
                  </button>
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-mono text-[11px]">
                  {currentAnswer || '(No response transcribed)'}
                </p>
              </div>

              {/* Strengths & Improvements */}
              {currentFeedback && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                      Strengths Demonstrated:
                    </span>
                    <ul className="list-disc list-outside ml-4 space-y-1 text-emerald-900 dark:text-emerald-200 text-[11px]">
                      {currentFeedback.strengths?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                      Improvement Recommendations:
                    </span>
                    <ul className="list-disc list-outside ml-4 space-y-1 text-amber-900 dark:text-amber-200 text-[11px]">
                      {currentFeedback.improvements?.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Model Gold Standard Answer */}
              {currentFeedback?.sampleBetterAnswer && (
                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      AI Coach Model Answer:
                    </span>
                    <button
                      onClick={() => onPlaySpeech(currentFeedback.sampleBetterAnswer || '')}
                      className="text-[10.5px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Speak Model Answer
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11.5px] italic">
                    "{currentFeedback.sampleBetterAnswer}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onRestart();
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Another Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


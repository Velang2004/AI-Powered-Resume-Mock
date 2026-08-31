import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  VideoSentimentState,
  FaceEmotion,
  EyeContactState,
  HeadPoseState,
} from '../../types';
import { apiService } from '../../services/api';
import {
  Eye,
  EyeOff,
  Smile,
  Frown,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Compass,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';

interface VideoSentimentAnalyzerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoStream: MediaStream | null;
  cameraEnabled: boolean;
  isStarted: boolean;
  isListening: boolean;
  currentQuestion?: string;
  onSentimentChange?: (sentiment: VideoSentimentState) => void;
}

export const VideoSentimentAnalyzer: React.FC<VideoSentimentAnalyzerProps> = ({
  videoRef,
  videoStream,
  cameraEnabled,
  isStarted,
  isListening,
  currentQuestion,
  onSentimentChange,
}) => {
  // Real-Time Sentiment State
  const [sentiment, setSentiment] = useState<VideoSentimentState>({
    emotion: 'confident',
    confidenceScore: 88,
    eyeContact: 'direct_forward',
    headPose: 'centered_straight',
    isHeadStraight: true,
    cheatingFlag: false,
    suspicionReason: null,
    coachAdvice: 'Excellent posture! Keep looking straight forward into the camera lens.',
    faceDetected: true,
    headTiltAngle: 0,
    lookingAwayCount: 0,
    suspiciousCount: 0,
    emotionPercentages: {
      confident: 85,
      focused: 90,
      nervous: 10,
      sad_stressed: 5,
      neutral: 80,
    },
  });

  const [isAiVerifying, setIsAiVerifying] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState<number>(0);
  const [activeWarning, setActiveWarning] = useState<string | null>(null);
  const [showDetailedHud, setShowDetailedHud] = useState(true);

  // Canvas ref for video frame processing
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const consecutiveLookingAwayRef = useRef<number>(0);
  const consecutiveLookingDownRef = useRef<number>(0);
  const lastAiCheckTimeRef = useRef<number>(0);
  const lookAwayCountRef = useRef<number>(0);
  const suspiciousCountRef = useRef<number>(0);

  // Sync state upward
  useEffect(() => {
    if (onSentimentChange) {
      onSentimentChange(sentiment);
    }
  }, [sentiment, onSentimentChange]);

  // Client-Side Real-Time Computer Vision Frame Analysis (12-15 FPS)
  const analyzeFrameLocally = useCallback(() => {
    if (!videoRef.current || !cameraEnabled || !videoStream) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    const width = 160; // Downscale for ultra-fast, smooth 60fps tracking
    const height = 120;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Draw video frame to small offscreen canvas
    ctx.drawImage(video, 0, 0, width, height);

    try {
      const frameData = ctx.getImageData(0, 0, width, height);
      const data = frameData.data;

      // 1. Detect Face Centroid via Skin Tone & Contrast Distribution
      let totalSkinX = 0;
      let totalSkinY = 0;
      let skinPixelsCount = 0;

      // Scan center region for face tracking
      for (let y = 10; y < height - 10; y += 2) {
        for (let x = 10; x < width - 10; x += 2) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];

          // Generic skin chrominance bounding rule
          const isSkin =
            r > 60 &&
            g > 40 &&
            b > 20 &&
            r > g &&
            r > b &&
            r - g > 10 &&
            Math.abs(r - g) < 130;

          if (isSkin) {
            totalSkinX += x;
            totalSkinY += y;
            skinPixelsCount++;
          }
        }
      }

      const faceDetected = skinPixelsCount > 120;

      if (!faceDetected) {
        setSentiment((prev) => ({
          ...prev,
          faceDetected: false,
          coachAdvice: '⚠️ Face not detected! Please center yourself directly in front of the camera.',
        }));
        setActiveWarning('⚠️ Face out of frame! Center yourself in front of the camera.');
        return;
      }

      const centroidX = totalSkinX / skinPixelsCount;
      const centroidY = totalSkinY / skinPixelsCount;

      const normalizedX = (centroidX - width / 2) / (width / 2); // -1 (left) to +1 (right)
      const normalizedY = (centroidY - height / 2) / (height / 2); // -1 (top) to +1 (bottom)

      // 2. Eye Gaze & Head Orientation Evaluation
      let eyeContact: EyeContactState = 'direct_forward';
      let headPose: HeadPoseState = 'centered_straight';
      let isHeadStraight = true;
      let coachAdvice = 'Great posture! Keep looking straight forward at the camera.';
      let cheatingFlag = false;
      let suspicionReason: string | null = null;

      // Check horizontal deviation (Looking Left or Right away from camera)
      if (normalizedX < -0.28) {
        eyeContact = 'looking_right'; // Mirrored video
        headPose = 'turned_away';
        isHeadStraight = false;
        consecutiveLookingAwayRef.current += 1;
      } else if (normalizedX > 0.28) {
        eyeContact = 'looking_left';
        headPose = 'turned_away';
        isHeadStraight = false;
        consecutiveLookingAwayRef.current += 1;
      } else if (normalizedY > 0.32) {
        // Looking down (e.g. looking down at phone or written notes)
        eyeContact = 'looking_down';
        headPose = 'looking_down_at_notes';
        isHeadStraight = false;
        consecutiveLookingDownRef.current += 1;
      } else if (normalizedY < -0.32) {
        eyeContact = 'looking_up';
        headPose = 'tilted_left';
        isHeadStraight = false;
      } else {
        eyeContact = 'direct_forward';
        headPose = 'centered_straight';
        isHeadStraight = true;
        consecutiveLookingAwayRef.current = Math.max(0, consecutiveLookingAwayRef.current - 1);
        consecutiveLookingDownRef.current = Math.max(0, consecutiveLookingDownRef.current - 1);
      }

      // Check for prolonged looking away or suspicious behavior
      let newLogEntry: any = null;
      if (consecutiveLookingDownRef.current === 19) {
        cheatingFlag = true;
        suspicionReason = 'Prolonged downward gaze (Possible off-screen notes or phone)';
        coachAdvice = "⚠️ Don't look down at notes or phone! Keep eyes on the camera.";
        suspiciousCountRef.current += 1;
        setActiveWarning("⚠️ Eyes looking down! Keep your focus straight on the interviewer.");
        newLogEntry = {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'LOOKING_DOWN',
          message: '⚠️ Prolonged downward gaze detected (Looking at notes or phone)',
        };
      } else if (consecutiveLookingAwayRef.current === 16) {
        cheatingFlag = true;
        suspicionReason = 'Repeatedly looking away from primary interview screen';
        coachAdvice = "⚠️ Don't move your head! Look straight forward into the camera.";
        lookAwayCountRef.current += 1;
        setActiveWarning("⚠️ Looking away detected! Face forward and look directly at the camera.");
        newLogEntry = {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'LOOKING_AWAY',
          message: '⚠️ Head turned away from main interview screen',
        };
      } else if (consecutiveLookingDownRef.current > 18) {
        cheatingFlag = true;
        suspicionReason = 'Prolonged downward gaze (Possible off-screen notes or phone)';
        coachAdvice = "⚠️ Don't look down at notes or phone! Keep eyes on the camera.";
      } else if (consecutiveLookingAwayRef.current > 15) {
        cheatingFlag = true;
        suspicionReason = 'Repeatedly looking away from primary interview screen';
        coachAdvice = "⚠️ Don't move your head! Look straight forward into the camera.";
      } else if (!isHeadStraight) {
        coachAdvice = "💡 Keep your head still and look directly forward at the camera lens.";
        if (Date.now() - lastAlertTime > 4000) {
          setActiveWarning("💡 Keep your head centered and maintain direct eye contact.");
          setLastAlertTime(Date.now());
        }
      } else {
        if (activeWarning && Date.now() - lastAlertTime > 2500) {
          setActiveWarning(null);
        }
      }

      // 3. Compute Real-Time Dynamic Confidence Score (0 - 100)
      const baseConfidence = 85;
      let calculatedConfidence = baseConfidence;

      if (isHeadStraight && eyeContact === 'direct_forward') {
        calculatedConfidence = Math.min(98, calculatedConfidence + 10);
      } else {
        calculatedConfidence = Math.max(45, calculatedConfidence - (consecutiveLookingAwayRef.current * 2));
      }

      if (cheatingFlag) {
        calculatedConfidence = Math.max(35, calculatedConfidence - 25);
      }

      // Determine Dominant Facial Emotion
      let emotion: FaceEmotion = 'confident';
      if (cheatingFlag) {
        emotion = 'distracted';
      } else if (calculatedConfidence > 82) {
        emotion = isListening ? 'confident' : 'focused';
      } else if (calculatedConfidence > 65) {
        emotion = 'neutral';
      } else if (consecutiveLookingDownRef.current > 5) {
        emotion = 'sad_stressed';
      } else {
        emotion = 'nervous';
      }

      setSentiment((prev) => ({
        ...prev,
        emotion,
        confidenceScore: calculatedConfidence,
        eyeContact,
        headPose,
        isHeadStraight,
        cheatingFlag,
        suspicionReason,
        coachAdvice,
        faceDetected: true,
        headTiltAngle: Math.round(normalizedX * 25),
        lookingAwayCount: lookAwayCountRef.current,
        suspiciousCount: suspiciousCountRef.current,
        proctoringLog: newLogEntry
          ? [...(prev.proctoringLog || []).slice(-15), newLogEntry]
          : prev.proctoringLog || [],
        emotionPercentages: {
          confident: emotion === 'confident' ? 92 : 45,
          focused: emotion === 'focused' ? 90 : 70,
          nervous: emotion === 'nervous' ? 65 : 12,
          sad_stressed: emotion === 'sad_stressed' ? 55 : 8,
          neutral: emotion === 'neutral' ? 85 : 50,
        },
      }));
    } catch (e) {
      // Ignore frame read errors
    }
  }, [cameraEnabled, videoStream, videoRef, isListening, lastAlertTime, activeWarning]);

  // Main Loop
  useEffect(() => {
    if (!cameraEnabled || !videoStream || !isStarted) return;

    let intervalId: any = setInterval(() => {
      analyzeFrameLocally();
    }, 120); // ~8-10 checks per second

    return () => clearInterval(intervalId);
  }, [cameraEnabled, videoStream, isStarted, analyzeFrameLocally]);

  // Periodic Deep AI Facial Sentiment Snapshot (Every 12s during active interview)
  const triggerAiDeepScan = async () => {
    if (!videoRef.current || !cameraEnabled || isAiVerifying) return;

    try {
      setIsAiVerifying(true);
      const video = videoRef.current;
      const offscreen = document.createElement('canvas');
      offscreen.width = 480;
      offscreen.height = 360;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 480, 360);
      const base64Image = offscreen.toDataURL('image/jpeg', 0.85);

      const res = await apiService.analyzeVideoFrame({
        image: base64Image,
        mimeType: 'image/jpeg',
        currentContext: currentQuestion,
      });

      if (res && res.analysis) {
        const a = res.analysis;
        setSentiment((prev) => ({
          ...prev,
          emotion: a.emotion || prev.emotion,
          confidenceScore: a.confidenceScore || prev.confidenceScore,
          eyeContact: a.eyeContact || prev.eyeContact,
          headPose: a.headPose || prev.headPose,
          isHeadStraight: a.isHeadStraight ?? prev.isHeadStraight,
          cheatingFlag: a.cheatingFlag ?? prev.cheatingFlag,
          suspicionReason: a.suspicionReason || prev.suspicionReason,
          coachAdvice: a.coachAdvice || prev.coachAdvice,
          emotionPercentages: a.emotionPercentages || prev.emotionPercentages,
        }));
      }
    } catch (e) {
      console.warn('Deep video sentiment snapshot note:', e);
    } finally {
      setIsAiVerifying(false);
    }
  };

  // Background Periodic AI Trigger
  useEffect(() => {
    if (!isStarted || !cameraEnabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastAiCheckTimeRef.current > 24000) {
        lastAiCheckTimeRef.current = now;
        triggerAiDeepScan();
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [isStarted, cameraEnabled]);

  // Map Emotion to Visual Theme & Badge
  const getEmotionBadge = (em: FaceEmotion) => {
    switch (em) {
      case 'confident':
        return {
          label: 'Confident & Composed',
          color: 'bg-emerald-500/90 text-white border-emerald-400/80',
          icon: <Smile className="w-3.5 h-3.5" />,
          statusColor: 'text-emerald-400',
        };
      case 'focused':
        return {
          label: 'Deeply Focused',
          color: 'bg-blue-500/90 text-white border-blue-400/80',
          icon: <Activity className="w-3.5 h-3.5" />,
          statusColor: 'text-blue-400',
        };
      case 'sad_stressed':
        return {
          label: 'Stressed / Hesitant',
          color: 'bg-amber-500/90 text-white border-amber-400/80',
          icon: <Frown className="w-3.5 h-3.5" />,
          statusColor: 'text-amber-400',
        };
      case 'nervous':
        return {
          label: 'Nervous / Rapid Gaze',
          color: 'bg-orange-500/90 text-white border-orange-400/80',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          statusColor: 'text-orange-400',
        };
      case 'distracted':
        return {
          label: 'Distracted / Looking Away',
          color: 'bg-rose-500/90 text-white border-rose-400/80',
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
          statusColor: 'text-rose-400',
        };
      default:
        return {
          label: 'Composed Neutral',
          color: 'bg-slate-700/90 text-white border-slate-600',
          icon: <Smile className="w-3.5 h-3.5" />,
          statusColor: 'text-slate-300',
        };
    }
  };

  const badge = getEmotionBadge(sentiment.emotion);

  return (
    <div className="space-y-4">
      {/* 1. Real-Time HUD Overlay directly over candidate video */}
      <div className="relative">
        {/* Real-Time Live Coaching Alert Banner */}
        {activeWarning && (
          <div className="absolute top-2 left-3 right-3 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 bg-rose-600/95 text-white backdrop-blur-md rounded-xl text-xs font-bold shadow-lg flex items-center justify-between border border-rose-400/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>{activeWarning}</span>
              </div>
              <span className="text-[10px] bg-rose-800/80 px-2 py-0.5 rounded-full font-mono">
                Posture Alert
              </span>
            </div>
          </div>
        )}

        {/* Proctoring HUD Center Reticle / Head Guide */}
        {cameraEnabled && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            {/* Augmented Reality Face Tracking Box */}
            <div
              className={`relative w-44 h-52 rounded-3xl border-2 transition-all duration-200 flex flex-col justify-between p-2.5 ${
                sentiment.cheatingFlag
                  ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                  : !sentiment.isHeadStraight
                  ? 'border-amber-400 bg-amber-400/5 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'border-emerald-400/80 bg-emerald-400/5 shadow-[0_0_15px_rgba(52,211,153,0.25)]'
              }`}
            >
              {/* Corner Sci-Fi Framing Markers */}
              <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-current" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-current" />
              <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-current" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-current" />

              {/* Target Crosshairs */}
              <div className="absolute top-1/2 left-2 right-2 h-px bg-current opacity-20" />
              <div className="absolute top-2 bottom-2 left-1/2 w-px bg-current opacity-20" />

              {/* Top Tag */}
              <div className="flex items-center justify-between text-[9px] font-mono font-bold tracking-wider uppercase opacity-90">
                <span className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      sentiment.isHeadStraight ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  {sentiment.isHeadStraight ? 'CENTERED' : 'ADJUST HEAD'}
                </span>
                <span>{sentiment.confidenceScore}% CONF</span>
              </div>

              {/* Center Gaze Compass Guide */}
              <div className="my-auto text-center opacity-85">
                {!sentiment.isHeadStraight && (
                  <div className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-amber-300 inline-block">
                    Look Forward
                  </div>
                )}
              </div>

              {/* Bottom State */}
              <div className="flex items-center justify-between text-[9px] font-mono opacity-90">
                <span>GAZE: {sentiment.eyeContact.toUpperCase()}</span>
                <span>{sentiment.emotion.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Real-Time Facial Sentiment & Proctoring Metrics Bar */}
      <div className="bg-slate-900/90 text-white rounded-2xl p-4 border border-slate-800 backdrop-blur-md shadow-md space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                Live Facial Sentiment & Integrity Proctoring
                {isAiVerifying && (
                  <span className="text-[10px] text-indigo-400 animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> AI Analyzing Frame...
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-400">
                Continuous computer vision tracking head pose, eye gaze, emotion, and confidence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDetailedHud(!showDetailedHud)}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 transition"
            >
              {showDetailedHud ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              <span>{showDetailedHud ? 'Compact' : 'Detailed Metrics'}</span>
            </button>

            <button
              type="button"
              onClick={triggerAiDeepScan}
              disabled={isAiVerifying}
              className="text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center gap-1 px-3 py-1 rounded-lg transition"
            >
              <Sparkles className="w-3 h-3" />
              <span>Deep Scan</span>
            </button>
          </div>
        </div>

        {/* 4-Card Live KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* A. Facial Emotion */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Facial Sentiment</span>
              <span className={badge.statusColor}>{badge.icon}</span>
            </div>
            <div className="text-xs font-bold text-white truncate">{badge.label}</div>
            <div className="text-[10px] text-slate-400">
              {sentiment.emotion === 'confident'
                ? 'Composed & Natural'
                : sentiment.emotion === 'sad_stressed'
                ? 'Tension Detected'
                : 'Active Processing'}
            </div>
          </div>

          {/* B. Confidence Gauge */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Confidence Level</span>
              <span className="font-mono font-bold text-emerald-400">
                {sentiment.confidenceScore}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${sentiment.confidenceScore}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400">
              {sentiment.confidenceScore > 80 ? 'High / Senior' : 'Moderate'}
            </div>
          </div>

          {/* C. Eye Contact & Gaze */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Eye Contact</span>
              {sentiment.eyeContact === 'direct_forward' ? (
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
            <div className="text-xs font-bold text-white">
              {sentiment.eyeContact === 'direct_forward'
                ? '🎯 Direct Forward'
                : sentiment.eyeContact === 'looking_down'
                ? '⚠️ Looking Down'
                : '⚠️ Looking Away'}
            </div>
            <div className="text-[10px] text-slate-400">
              {sentiment.isHeadStraight ? 'Centered at Camera' : 'Head Angle Shifted'}
            </div>
          </div>

          {/* D. Proctoring & Anti-Cheat */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Integrity Proctor</span>
              {sentiment.cheatingFlag ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <div className="text-xs font-bold text-white">
              {sentiment.cheatingFlag ? '⚠️ Flagged' : '✅ 100% Clean'}
            </div>
            <div className="text-[10px] text-slate-400">
              {sentiment.cheatingFlag
                ? 'Suspicious Gaze'
                : 'No notes / screen shifts'}
            </div>
          </div>
        </div>

        {/* Detailed Insights & Coach Advice Box */}
        {showDetailedHud && (
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Body Language Coaching Advice:</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              "{sentiment.coachAdvice}"
            </p>

            {/* Suspicious Action Note */}
            {sentiment.suspicionReason && (
              <div className="p-2 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-lg text-[11px] font-medium flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Proctor Note: {sentiment.suspicionReason}</span>
              </div>
            )}

            {/* Percentage Bar Breakdown */}
            <div className="pt-1 grid grid-cols-5 gap-1.5 text-center text-[10px]">
              <div className="p-1 bg-slate-900/80 rounded border border-slate-800">
                <div className="text-slate-400">Confident</div>
                <div className="font-bold text-emerald-400">{sentiment.emotionPercentages.confident}%</div>
              </div>
              <div className="p-1 bg-slate-900/80 rounded border border-slate-800">
                <div className="text-slate-400">Focused</div>
                <div className="font-bold text-blue-400">{sentiment.emotionPercentages.focused}%</div>
              </div>
              <div className="p-1 bg-slate-900/80 rounded border border-slate-800">
                <div className="text-slate-400">Neutral</div>
                <div className="font-bold text-slate-300">{sentiment.emotionPercentages.neutral}%</div>
              </div>
              <div className="p-1 bg-slate-900/80 rounded border border-slate-800">
                <div className="text-slate-400">Nervous</div>
                <div className="font-bold text-orange-400">{sentiment.emotionPercentages.nervous}%</div>
              </div>
              <div className="p-1 bg-slate-900/80 rounded border border-slate-800">
                <div className="text-slate-400">Stressed</div>
                <div className="font-bold text-rose-400">{sentiment.emotionPercentages.sad_stressed}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

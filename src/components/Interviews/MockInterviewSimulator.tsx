import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, InterviewQuestion, InterviewFeedbackReport, ProctoringLogEntry } from '../../types';
import { apiService } from '../../services/api';
import {
  generateInstantResumeQuestions,
  evaluateAnswerInstantly,
  formatSpokenTranscript,
  getTailoredSampleAnswer,
} from '../../utils/interviewEngine';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Award,
  Clock,
  Send,
  MessageSquare,
  Bot,
  UserCheck,
  HelpCircle,
  FileText,
  Volume1,
  BarChart3,
  Lightbulb,
  Zap,
  Flame,
  Check,
  Wand2,
  Trash2,
  Activity,
  Video,
  VideoOff,
  Radio,
  RefreshCw,
  Sliders,
  ShieldAlert,
  AlertTriangle,
  Eye,
  Ear,
  Square,
  Repeat,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { SpeechSpeedometer } from './SpeechSpeedometer';
import {
  InterviewerPersonaCard,
  INTERVIEWER_PERSONAS,
  InterviewerPersona,
} from './InterviewerPersonaCard';
import { StarAnswerGuideModal } from './StarAnswerGuideModal';
import { VoiceInterviewReportModal } from './VoiceInterviewReportModal';
import { VideoSentimentAnalyzer } from './VideoSentimentAnalyzer';
import { VideoSentimentState } from '../../types';

interface MockInterviewSimulatorProps {
  resumeData: ResumeData;
}

export const MockInterviewSimulator: React.FC<MockInterviewSimulatorProps> = ({ resumeData }) => {
  // Session Configuration
  const [interviewType, setInterviewType] = useState<string>('technical');
  const [difficulty, setDifficulty] = useState<string>('senior');
  const [jobTarget, setJobTarget] = useState(
    resumeData.personal.title || 'Senior Full-Stack & Systems Engineer'
  );
  const [selectedPersona, setSelectedPersona] = useState<InterviewerPersona>(INTERVIEWER_PERSONAS[0]);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Status & Progress
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Video Sentiment & Proctoring State
  const [videoSentiment, setVideoSentiment] = useState<VideoSentimentState | null>(null);


  // Questions and Candidate Responses
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [candidateAnswers, setCandidateAnswers] = useState<{ [qId: string]: string }>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<{ [qId: string]: InterviewFeedbackReport }>({});

  // Audio & Microphone Management
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const isListeningRef = useRef(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [repeatCounts, setRepeatCounts] = useState<{ [qId: string]: number }>({});
  const [repeatSpeed, setRepeatSpeed] = useState<'normal' | 'slow'>('normal');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [lastAudioBase64, setLastAudioBase64] = useState<string | null>(null);
  const [lastAudioMimeType, setLastAudioMimeType] = useState<string>('audio/webm');

  // Video / Camera Management for Real-World Video Call Experience
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const candidateVideoRef = useRef<HTMLVideoElement | null>(null);

  // Mic Test State on Pre-Interview Screen
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [testMicVolume, setTestMicVolume] = useState(0);
  const [testMicResult, setTestMicResult] = useState<string | null>(null);

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const volumeIntervalRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Modals
  const [isStarGuideOpen, setIsStarGuideOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Overall Timers
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [questionTimeElapsed, setQuestionTimeElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
        setQuestionTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isStarted, isFinished]);

  // Clean up media streams, camera, and speech synthesis on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      stopAudioStreams();
      stopVideoStream();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Tab Switch & Window Focus Loss Anti-Cheat Detector
  useEffect(() => {
    if (!isStarted || isFinished) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setVideoSentiment((prev) => {
          const tabSwitchCount = (prev?.tabSwitchCount || 0) + 1;
          const newEntry: ProctoringLogEntry = {
            id: 'tab_' + Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            type: 'TAB_SWITCH',
            message: `⚠️ Tab switch / Browser window minimized (Incident #${tabSwitchCount})`,
          };
          return {
            ...(prev || {
              emotion: 'distracted',
              confidenceScore: 60,
              eyeContact: 'looking_away' as const,
              headPose: 'turned_away' as const,
              isHeadStraight: false,
              cheatingFlag: true,
              suspicionReason: 'Tab switch or window focus lost',
              coachAdvice: '⚠️ Candidate switched browser tabs during live interview.',
              faceDetected: true,
              headTiltAngle: 0,
              lookingAwayCount: 1,
              suspiciousCount: 1,
              emotionPercentages: { confident: 30, focused: 20, nervous: 70, sad_stressed: 40, neutral: 30 },
            }),
            cheatingFlag: true,
            suspicionReason: 'Browser tab switched or window focus lost',
            suspiciousCount: (prev?.suspiciousCount || 0) + 1,
            tabSwitchCount,
            proctoringLog: [...(prev?.proctoringLog || []).slice(-15), newEntry],
          };
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isStarted, isFinished]);

  // Auto-acquire real world webcam stream on startup
  useEffect(() => {
    let isMounted = true;
    const requestRealWebcam = async () => {
      if (cameraEnabled && !videoStream) {
        try {
          const vStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: false,
          });
          if (isMounted) {
            setVideoStream(vStream);
            if (candidateVideoRef.current) {
              candidateVideoRef.current.srcObject = vStream;
              candidateVideoRef.current.play().catch(() => {});
            }
          }
        } catch (err) {
          console.warn('Real hardware webcam fallback check:', err);
        }
      }
    };
    requestRealWebcam();
    return () => {
      isMounted = false;
    };
  }, [cameraEnabled, isStarted, videoStream]);

  // Bind video element whenever videoStream or cameraEnabled updates
  useEffect(() => {
    if (candidateVideoRef.current && videoStream && cameraEnabled) {
      candidateVideoRef.current.srcObject = videoStream;
      candidateVideoRef.current.play().catch(() => {});
    }
  }, [videoStream, cameraEnabled, isStarted]);

  const stopAudioStreams = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }
  };

  const stopVideoStream = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
  };

  // Helper to generate interactive synthetic video stream when hardware camera is unavailable
  const createSyntheticVideoStream = (): MediaStream => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    let angle = 0;
    const drawFrame = () => {
      if (!ctx) return;
      angle += 0.04;

      // Dark sleek camera canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 480);

      // Tech Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < 640; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 480);
        ctx.stroke();
      }
      for (let y = 0; y < 480; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }

      // Candidate Head & Shoulders
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(320, 420, 160, 90, 0, 0, Math.PI * 2);
      ctx.fill();

      const headX = 320 + Math.sin(angle) * 4;
      const headY = 220 + Math.cos(angle * 0.8) * 3;
      ctx.beginPath();
      ctx.arc(headX, headY, 75, 0, Math.PI * 2);
      ctx.fill();

      // Tracking reticle box
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.strokeRect(headX - 85, headY - 95, 170, 190);

      // Corner reticles
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(headX - 85, headY - 75); ctx.lineTo(headX - 85, headY - 95); ctx.lineTo(headX - 65, headY - 95); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(headX + 65, headY - 95); ctx.lineTo(headX + 85, headY - 95); ctx.lineTo(headX + 85, headY - 75); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(headX - 85, headY + 75); ctx.lineTo(headX - 85, headY + 95); ctx.lineTo(headX - 65, headY + 95); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(headX + 65, headY + 95); ctx.lineTo(headX + 85, headY + 95); ctx.lineTo(headX + 85, headY + 75); ctx.stroke();

      // Eye tracking points
      ctx.fillStyle = '#34d399';
      ctx.beginPath(); ctx.arc(headX - 25, headY - 15, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(headX + 25, headY - 15, 6, 0, Math.PI * 2); ctx.fill();

      // Mouth arc
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(headX, headY + 15, 20, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();

      // HUD Text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('AI OPTICAL FACE TRACKER: ACTIVE', 20, 30);
      ctx.fillText('CONFIDENCE: 92% • GAZE: DIRECT FORWARD', 20, 50);

      requestAnimationFrame(drawFrame);
    };

    drawFrame();
    return canvas.captureStream(30);
  };

  // Toggle Video Camera with Fallback Synthetic Stream
  const toggleCamera = async () => {
    if (cameraEnabled) {
      stopVideoStream();
      setCameraEnabled(false);
    } else {
      try {
        const vStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        setVideoStream(vStream);
        setCameraEnabled(true);
        if (candidateVideoRef.current) {
          candidateVideoRef.current.srcObject = vStream;
        }
      } catch (err) {
        console.warn('Hardware camera fallback to synthetic video stream');
        const synthStream = createSyntheticVideoStream();
        setVideoStream(synthStream);
        setCameraEnabled(true);
        if (candidateVideoRef.current) {
          candidateVideoRef.current.srcObject = synthStream;
        }
      }
    }
  };

  // Pre-Interview Mic Test
  const handleTestMic = async () => {
    if (isTestingMic) {
      setIsTestingMic(false);
      stopAudioStreams();
      setTestMicVolume(0);
      return;
    }

    try {
      setIsTestingMic(true);
      setTestMicResult('Listening to microphone... Speak normally into your mic.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let maxSeen = 0;

      const interval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setTestMicVolume(normalized);
        if (normalized > maxSeen) maxSeen = normalized;
      }, 100);

      // Auto stop test after 4 seconds
      setTimeout(() => {
        clearInterval(interval);
        stream.getTracks().forEach((track) => track.stop());
        try {
          ctx.close();
        } catch (e) {}
        setIsTestingMic(false);
        setTestMicVolume(0);
        if (maxSeen > 5) {
          setTestMicResult('✅ Microphone is working perfectly! Audio levels detected clearly.');
        } else {
          setTestMicResult('⚠️ Low audio signal detected. Ensure your microphone is unmuted and speak closer to the mic.');
        }
      }, 4000);
    } catch (err: any) {
      setIsTestingMic(false);
      setTestMicResult('❌ Microphone access was denied. Please allow microphone access in your browser settings.');
    }
  };

  // Helper to initialize SpeechRecognition instance for real-time live words
  const initSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const chunk = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            final += chunk;
          } else {
            interim += chunk;
          }
        }

        if (final) {
          const formattedChunk = formatSpokenTranscript(final);
          setCandidateAnswer((prev) => {
            const safePrev = prev || '';
            if (!safePrev.trim()) return formattedChunk;
            const needsSpace = !safePrev.endsWith(' ') && !safePrev.endsWith('\n');
            return safePrev + (needsSpace ? ' ' : '') + formattedChunk;
          });
          setInterimTranscript('');
        } else {
          setInterimTranscript(interim);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('SpeechRecognition status note:', err.error);
        if (err.error === 'no-speech') return;
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setTimeout(() => {
              if (isListeningRef.current) {
                try {
                  recognition.start();
                } catch (err) {}
              }
            }, 150);
          }
        }
      };

      recognitionRef.current = recognition;
      return recognition;
    } catch (e) {
      console.warn('Speech recognition initialization note:', e);
      return null;
    }
  };

  // Multi-Engine Voice Recording & Cloud Transcription
  const toggleListening = async () => {
    if (isListening) {
      // STOP RECORDING
      isListeningRef.current = false;
      setIsListening(false);
      setInterimTranscript('');
      setMicVolume(0);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }

      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      // Stop MediaRecorder and trigger Gemini cloud audio transcription
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Stop microphone stream tracks
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
    } else {
      // START RECORDING
      setErrorMessage(null);
      setStatusNotification(null);
      setRecordingSeconds(0);
      audioChunksRef.current = [];

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMediaStream(stream);
        isListeningRef.current = true;
        setIsListening(true);

        // 1. Setup MediaRecorder for high-fidelity audio capture
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : (MediaRecorder.isTypeSupported('audio/ogg') ? 'audio/ogg' : '');
        }

        const recorderOptions = mimeType ? { mimeType } : undefined;
        const mediaRecorder = new MediaRecorder(stream, recorderOptions);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          if (audioChunksRef.current.length === 0) return;

          const actualMime = mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(audioUrl);
          setLastAudioMimeType(actualMime);

          // Convert Blob to Base64 and transcribe via Gemini STT
          try {
            setIsTranscribing(true);
            setStatusNotification('🎙️ Transcribing spoken voice with AI...');

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Data = (reader.result as string) || '';
              setLastAudioBase64(base64Data);

              const currentQ = questions[currentIndex];
              try {
                const res = await apiService.transcribeAudio({
                  audio: base64Data,
                  mimeType: actualMime,
                  questionContext: currentQ?.question,
                });

                if (res && res.transcript && typeof res.transcript === 'string' && res.transcript.trim()) {
                  const cleanedTranscript = formatSpokenTranscript(res.transcript);
                  setCandidateAnswer((prev) => {
                    const safePrev = prev || '';
                    if (!safePrev.trim()) return cleanedTranscript;
                    return safePrev + '\n\n' + cleanedTranscript;
                  });
                  setStatusNotification('✨ Spoken response transcribed accurately!');
                  setTimeout(() => setStatusNotification(null), 3500);
                } else if (!(candidateAnswer || '').trim()) {
                  setStatusNotification('Note: No audible speech detected. You can type or record again.');
                  setTimeout(() => setStatusNotification(null), 3500);
                }
              } catch (transcribeErr: any) {
                console.warn('Server transcription note:', transcribeErr);
              } finally {
                setIsTranscribing(false);
              }
            };
          } catch (blobErr) {
            console.warn('Audio processing note:', blobErr);
            setIsTranscribing(false);
          }
        };

        mediaRecorder.start(250); // Slice audio into 250ms chunks

        // 2. Setup Audio Volume Decibel Meter
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);
          audioContextRef.current = ctx;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          volumeIntervalRef.current = setInterval(() => {
            if (!isListeningRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(100, Math.round((avg / 128) * 100));
            setMicVolume(normalized);
          }, 100);
        } catch (audioErr) {
          console.warn('Audio context setup note:', audioErr);
        }

        // 3. Setup Recording Duration Timer
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);

        // 4. Start Browser SpeechRecognition in parallel for instant client live words
        const recognition = initSpeechRecognition();
        if (recognition) {
          try {
            recognition.start();
          } catch (e) {
            console.warn('Live speech recognition start note:', e);
          }
        }
      } catch (err: any) {
        console.error('Microphone permission error:', err);
        setErrorMessage(
          'Microphone access was denied or not found. Please enable microphone permissions in your browser or type your response below.'
        );
        isListeningRef.current = false;
        setIsListening(false);
      }
    }
  };

  // Re-transcribe last recorded audio with Gemini STT
  const handleReTranscribeAudio = async () => {
    if (!lastAudioBase64) {
      setErrorMessage('No previous audio recording found to re-transcribe.');
      return;
    }

    try {
      setIsTranscribing(true);
      setStatusNotification('🎙️ Re-transcribing audio via Gemini AI...');
      const currentQ = questions[currentIndex];

      const res = await apiService.transcribeAudio({
        audio: lastAudioBase64,
        mimeType: lastAudioMimeType,
        questionContext: currentQ?.question,
      });

      if (res && res.transcript && typeof res.transcript === 'string' && res.transcript.trim()) {
        const cleaned = formatSpokenTranscript(res.transcript);
        setCandidateAnswer(cleaned);
        setStatusNotification('✨ Audio re-transcribed successfully!');
      } else {
        setStatusNotification('Audio transcription completed.');
      }
      setTimeout(() => setStatusNotification(null), 3000);
    } catch (err) {
      setErrorMessage('Failed to re-transcribe audio.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Format candidate text manually
  const handleFormatAnswer = () => {
    if (!candidateAnswer) return;
    const formatted = formatSpokenTranscript(candidateAnswer);
    setCandidateAnswer(formatted);
    setStatusNotification('Transcript formatted with proper punctuation and capitalization.');
    setTimeout(() => setStatusNotification(null), 2500);
  };

  // Insert STAR Section
  const handleInsertStarSection = (prefix: string) => {
    setCandidateAnswer((prev) => {
      const trimmed = (prev || '').trim();
      if (!trimmed) return `${prefix}: `;
      return `${trimmed}\n\n${prefix}: `;
    });
  };

  // Insert Tailored Sample Answer
  const handleInsertSample = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const sample = getTailoredSampleAnswer(currentQ.question, interviewType);
    setCandidateAnswer(sample);
    setInterimTranscript('');
    setStatusNotification('Sample STAR spoken response inserted for testing.');
    setTimeout(() => setStatusNotification(null), 2500);
  };

  // Play spoken text with browser SpeechSynthesis or fallback
  const playSpeech = (text: string, persona = selectedPersona, customRateMultiplier = 1.0) => {
    if (!text) return;

    if (!ttsEnabled) {
      setTtsEnabled(true);
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.max(0.65, Math.min(1.5, speechRate * (persona.rate || 1.0) * customRateMultiplier));
      utterance.pitch = persona.pitch || 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
        if (englishVoices.length > 0) {
          utterance.voice = englishVoices[Math.abs(persona.name.length) % englishVoices.length];
        }
      }

      setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop currently playing speech synthesis
  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
    setStatusNotification('Audio playback stopped.');
    setTimeout(() => setStatusNotification(null), 1500);
  };

  // Dedicated function to Repeat the Question clearly
  const handleRepeatQuestion = (speed: 'normal' | 'slow' = repeatSpeed, withPoliteIntro = true) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    // If candidate's mic is currently recording, stop it so it doesn't transcribe the repeated question
    if (isListening) {
      toggleListening();
    }

    const currentCount = (repeatCounts[currentQ.id] || 0) + 1;
    setRepeatCounts((prev) => ({ ...prev, [currentQ.id]: currentCount }));

    const speedMultiplier = speed === 'slow' ? 0.82 : 1.0;
    const preamble = withPoliteIntro
      ? (currentCount === 1 ? `Sure! Let me repeat the question: ` : `No problem, let me ask again clearly: `)
      : '';
    const fullSpokenText = `${preamble}${currentQ.question}`;

    playSpeech(fullSpokenText, selectedPersona, speedMultiplier);

    setStatusNotification(
      `🔊 Interviewer repeating Question ${currentIndex + 1} (${speed === 'slow' ? 'Slow & Clear 0.82x' : '1.0x Normal'}) • Repeat #${currentCount}`
    );
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // Global Hotkey (Alt+R) for repeating current question quickly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted || isFinished) return;
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        handleRepeatQuestion('normal', true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, isFinished, currentIndex, questions, repeatSpeed, repeatCounts, selectedPersona, speechRate, isListening]);

  const handleTestPersonaVoice = (persona: InterviewerPersona) => {
    const sampleIntro = `Hello, I'm ${persona.name}. I will be conducting your ${interviewType.replace('_', ' ')} mock interview today.`;
    playSpeech(sampleIntro, persona);
  };

  // Launch Full Interview Session
  const handleStartInterview = async () => {
    setErrorMessage(null);
    setStatusNotification(null);

    // Stop any ongoing mic test
    if (isTestingMic) {
      setIsTestingMic(false);
      stopAudioStreams();
    }

    // Try starting camera stream if camera enabled
    if (cameraEnabled && !videoStream) {
      try {
        const vStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        setVideoStream(vStream);
        if (candidateVideoRef.current) {
          candidateVideoRef.current.srcObject = vStream;
        }
      } catch (e) {
        console.warn('Camera startup note:', e);
        const synthStream = createSyntheticVideoStream();
        setVideoStream(synthStream);
        if (candidateVideoRef.current) {
          candidateVideoRef.current.srcObject = synthStream;
        }
      }
    }

    // 1. Instantly generate tailored questions grounded in candidate's resume
    const instantQuestions = generateInstantResumeQuestions({
      resumeData,
      jobTitle: jobTarget,
      interviewType,
      difficulty,
    });

    setQuestions(instantQuestions);
    setCurrentIndex(0);
    setCandidateAnswer('');
    setInterimTranscript('');
    setCandidateAnswers({});
    setFeedbackHistory({});
    setIsStarted(true);
    setIsFinished(false);
    setSecondsElapsed(0);
    setQuestionTimeElapsed(0);

    // Play interviewer introductory greeting and first question
    if (instantQuestions.length > 0) {
      const firstQuestion = instantQuestions[0].question;
      setTimeout(() => {
        playSpeech(firstQuestion);
      }, 300);
    }

    // 2. Optionally fetch server-generated questions in background with fast timeout
    setIsGenerating(true);
    try {
      const timeoutPromise = new Promise<{ questions: InterviewQuestion[] }>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 2500)
      );
      const fetchPromise = apiService.generateInterviewQuestions({
        resumeData,
        jobTitle: jobTarget,
        interviewType,
        difficulty,
        count: 4,
      });

      const res = await Promise.race([fetchPromise, timeoutPromise]);
      if (res && res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
      }
    } catch (e: any) {
      // Smoothly maintain grounded instant questions
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit Answer for AI Evaluation
  const handleSubmitAnswer = async () => {
    const fullAnswer = ((candidateAnswer || '') + ' ' + (interimTranscript || '')).trim();
    if (!fullAnswer || !questions[currentIndex]) {
      setErrorMessage('Please record your voice answer or type your response before submitting.');
      return;
    }

    // Stop recording if currently listening
    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      setInterimTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
    }

    const currentQ = questions[currentIndex];

    // Save candidate answer
    setCandidateAnswers((prev) => ({
      ...prev,
      [currentQ.id]: fullAnswer,
    }));

    // 1. Compute Instant Client Evaluation (<50ms)
    const instantEval = evaluateAnswerInstantly({
      question: currentQ.question,
      candidateAnswer: fullAnswer,
      interviewType,
    });

    setFeedbackHistory((prev) => ({
      ...prev,
      [currentQ.id]: instantEval,
    }));

    // Speak instant coach feedback note
    if (ttsEnabled) {
      const score = instantEval.overallScore || instantEval.score || 0;
      const coachVoiceNote =
        score <= 25
          ? `Response recorded. Score is ${score} out of 100. ${instantEval.improvements?.[0] || 'Answer is incorrect.'}`
          : `Response recorded. Score is ${score} out of 100. ${instantEval.strengths?.[0] || ''}`;
      playSpeech(coachVoiceNote);
    }

    // 2. Async API evaluation to enrich with Gemini AI
    setIsEvaluating(true);
    try {
      const serverFeedback = await apiService.evaluateInterviewAnswer({
        question: currentQ.question,
        candidateAnswer: fullAnswer,
        interviewType,
      });

      if (serverFeedback) {
        setFeedbackHistory((prev) => ({
          ...prev,
          [currentQ.id]: serverFeedback,
        }));

        if (ttsEnabled) {
          const score = serverFeedback.overallScore ?? serverFeedback.score ?? 0;
          const coachVoiceNote =
            score <= 25
              ? `AI Evaluation updated: Score is ${score} out of 100. ${serverFeedback.improvements?.[0] || 'Answer is incorrect.'}`
              : `AI Evaluation updated: Score is ${score} out of 100. ${serverFeedback.strengths?.[0] || ''}`;
          playSpeech(coachVoiceNote, selectedPersona, 1.0);
        }
      }
    } catch (e) {
      // Keep instant evaluation
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move to next question or finish
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCandidateAnswer('');
      setInterimTranscript('');
      setRecordedAudioUrl(null);
      setLastAudioBase64(null);
      setQuestionTimeElapsed(0);
      const nextQ = questions[nextIdx].question;
      setTimeout(() => {
        playSpeech(nextQ);
      }, 300);
    } else {
      setIsFinished(true);
      setIsReportModalOpen(true);
    }
  };

  const handleRestartInterview = () => {
    setIsFinished(false);
    setIsStarted(false);
    setIsReportModalOpen(false);
    setCandidateAnswer('');
    setInterimTranscript('');
    setCandidateAnswers({});
    setFeedbackHistory({});
    setCurrentIndex(0);
    setSecondsElapsed(0);
    setQuestionTimeElapsed(0);
    setVideoSentiment(null);
    stopAudioStreams();
  };

  const currentQ = questions[currentIndex];
  const currentFeedback = currentQ ? feedbackHistory[currentQ.id] : null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-blue-600 text-white rounded-2xl shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Real-World AI Mock Interview Room
                  <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Video & Spoken Voice Studio
                  </span>
                </h1>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authentic technical interview simulation featuring live webcam & microphone feeds, continuous AI audio transcription, speech speedometer, and STAR answer scoring.
            </p>
          </div>

          {/* Quick Actions / Voice Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsStarGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>STAR Guide</span>
            </button>

            <button
              onClick={() => {
                const nextState = !ttsEnabled;
                setTtsEnabled(nextState);
                if (!nextState && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsAiSpeaking(false);
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                ttsEnabled
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
              title="Toggle AI Interviewer Spoken Voice"
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{ttsEnabled ? 'AI Voice: Active' : 'AI Voice: Muted'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Setup Form when not in active session */}
        {!isStarted && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Interview Domain
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value="technical">Full-Stack & Systems Architecture</option>
                  <option value="python_fastapi">Python, FastAPI & Microservices</option>
                  <option value="frontend_react">React Ecosystem & Frontend UI</option>
                  <option value="system_design">High-Throughput System Design</option>
                  <option value="behavioral">STAR Behavioral & Engineering Leadership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Seniority
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value="junior">Junior / Early Career (0-2 Yrs)</option>
                  <option value="mid">Mid-Level Engineer (2-5 Yrs)</option>
                  <option value="senior">Senior / Lead Engineer (5+ Yrs)</option>
                  <option value="principal">Staff / Principal Architect</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={jobTarget}
                  onChange={(e) => setJobTarget(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* AI Persona Selector */}
            <InterviewerPersonaCard
              selectedPersona={selectedPersona}
              onSelectPersona={setSelectedPersona}
              speechRate={speechRate}
              onChangeSpeechRate={setSpeechRate}
              onTestVoice={handleTestPersonaVoice}
            />

            {/* Device Pre-Check Bar (Camera & Mic Test) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Device Pre-Check & Hardware Calibration
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Verify your camera and microphone audio input levels before entering the interview room.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      cameraEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {cameraEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                    <span>{cameraEnabled ? 'Camera: ON' : 'Camera: OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestMic}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                      isTestingMic
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isTestingMic ? 'Testing Mic...' : 'Test Microphone'}</span>
                  </button>
                </div>
              </div>

              {/* Real-Time Mic Test Level Bar */}
              {isTestingMic && (
                <div className="space-y-1.5 pt-1 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <span>Live Mic Volume: {testMicVolume}%</span>
                    <span className="text-indigo-600 dark:text-indigo-400">Speak into your microphone now...</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 transition-all duration-75"
                      style={{ width: `${testMicVolume}%` }}
                    />
                  </div>
                </div>
              )}

              {testMicResult && (
                <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 pt-1">
                  {testMicResult}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Multi-Engine STT: MediaRecorder + Gemini Cloud Audio Understanding</span>
              </div>

              <button
                onClick={handleStartInterview}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Enter Video & Voice Interview Room</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline Notifications */}
      {errorMessage && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-amber-600 hover:text-amber-900 font-bold ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {statusNotification && (
        <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs text-indigo-800 dark:text-indigo-200 flex items-center gap-2 shadow-xs animate-in fade-in">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-semibold">{statusNotification}</span>
        </div>
      )}

      {/* Active Real-World Video & Voice Interview Stage */}
      {isStarted && !isFinished && currentQ && (
        <div className="space-y-6">
          {/* Real-World Video Call Stage (Dual Stream with Square Face Framing) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* 1. Interviewer Stream */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between aspect-square max-w-[380px] w-full mx-auto">
              {/* Interviewer Overlay Bar */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 shadow-xs">
                  <span className="text-base">{selectedPersona.avatar}</span>
                  <span>{selectedPersona.name}</span>
                  <span className="text-[10px] text-indigo-300 font-normal">({selectedPersona.company})</span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-semibold border border-slate-700 shadow-xs">
                  {isAiSpeaking ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold animate-pulse">
                      <Volume2 className="w-3.5 h-3.5" /> Speaking Question
                    </span>
                  ) : isListening ? (
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Radio className="w-3.5 h-3.5 animate-spin" /> Listening Intently...
                    </span>
                  ) : (
                    <span className="text-slate-400">Ready for Response</span>
                  )}
                </div>
              </div>

              {/* Animated Avatar Center */}
              <div className="my-auto py-2 flex flex-col items-center justify-center text-center z-10">
                <div className="relative">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-2xl transition-all duration-300 ${
                      isAiSpeaking
                        ? 'bg-gradient-to-tr from-indigo-500 to-blue-500 ring-8 ring-indigo-500/30 scale-105'
                        : 'bg-slate-800 border-2 border-slate-700'
                    }`}
                  >
                    {selectedPersona.avatar}
                  </div>
                  {isAiSpeaking && (
                    <span className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 text-white rounded-full text-[11px] ring-2 ring-slate-900">
                      <Volume2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-bold text-white">{selectedPersona.name}</h4>
                  <p className="text-[11px] text-slate-400">{selectedPersona.role}</p>
                </div>
              </div>

              {/* Replay Question Button Bar */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 z-10">
                <span className="text-[11px] text-slate-400">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-1.5">
                  {isAiSpeaking ? (
                    <button
                      type="button"
                      onClick={handleStopSpeech}
                      className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      title="Stop interviewer audio"
                    >
                      <Square className="w-3 h-3 fill-current" /> Stop
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRepeatQuestion('normal')}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs active:scale-95"
                        title="Repeat question audio"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Repeat Question
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRepeatQuestion('slow')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition border border-slate-700"
                        title="Repeat question clearly and slowly at 0.82x speed"
                      >
                        <Ear className="w-3 h-3" /> 0.82x
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Background ambient lighting */}
              <div className="absolute inset-0 bg-radial from-indigo-900/20 to-transparent pointer-events-none" />
            </div>

            {/* 2. Candidate Stream (Square Video Shape covering full face) */}
            <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between aspect-square max-w-[380px] w-full mx-auto">
              {/* Candidate Overlay Bar */}
              <div className="flex items-center justify-between z-20">
                <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-800 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Candidate (You)</span>
                </div>

                <div className="flex items-center gap-2">
                  {isListening && (
                    <div className="flex items-center gap-1.5 bg-rose-950/90 backdrop-blur-md text-rose-300 border border-rose-800 px-2.5 py-1 rounded-xl text-[11px] font-bold animate-pulse shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>REC {formatTime(recordingSeconds)}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`p-1.5 rounded-xl text-xs border transition shadow-xs ${
                      cameraEnabled
                        ? 'bg-slate-800/90 text-emerald-400 border-slate-700'
                        : 'bg-slate-800/90 text-slate-500 border-slate-700'
                    }`}
                    title="Toggle Video Camera"
                  >
                    {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Square Webcam Element with Full Face Coverage & Optical Tracking Reticle */}
              <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-slate-950 rounded-3xl">
                {cameraEnabled ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={candidateVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />

                    {/* Square Face Detection Framing Reticle */}
                    <div className="absolute inset-x-8 inset-y-12 border border-indigo-500/30 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                      <div className="flex justify-between">
                        <span className="w-3 h-3 border-t-2 border-l-2 border-indigo-400" />
                        <span className="w-3 h-3 border-t-2 border-r-2 border-indigo-400" />
                      </div>
                      <div className="flex justify-between">
                        <span className="w-3 h-3 border-b-2 border-l-2 border-indigo-400" />
                        <span className="w-3 h-3 border-b-2 border-r-2 border-indigo-400" />
                      </div>
                    </div>

                    {/* Live Facial Reaction Coaching Alert (Overlaid on Camera) */}
                    {videoSentiment && (
                      <div className="absolute top-14 inset-x-4 z-10 flex justify-center pointer-events-none">
                        <div
                          className={`px-3 py-1 rounded-xl text-[10.5px] font-bold backdrop-blur-md border shadow-lg flex items-center gap-1.5 transition-all duration-300 ${
                            videoSentiment.cheatingFlag || videoSentiment.emotion === 'suspicious_activity'
                              ? 'bg-rose-950/90 text-rose-200 border-rose-700 animate-bounce'
                              : !videoSentiment.isHeadStraight || videoSentiment.eyeContact === 'looking_away_side'
                              ? 'bg-amber-950/90 text-amber-200 border-amber-700 animate-pulse'
                              : videoSentiment.emotion === 'confident'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                              : 'bg-slate-900/80 text-slate-200 border-slate-700'
                          }`}
                        >
                          {videoSentiment.cheatingFlag ? (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                              <span>Alert: Look straight into the camera!</span>
                            </>
                          ) : !videoSentiment.isHeadStraight ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              <span>Alert: Keep your head upright & centered</span>
                            </>
                          ) : videoSentiment.emotion === 'confident' ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Reaction: Confident, engaging expression</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Reaction: Focused & steady posture</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-3xl shadow-inner">
                      🧑‍💻
                    </div>
                    <span className="text-xs font-semibold text-slate-500">Camera Disabled</span>
                  </div>
                )}
              </div>

              {/* Candidate Mic Level Bar */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 z-20 bg-slate-950/80 backdrop-blur-sm -mx-5 -mb-5 px-5 pb-5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isListening ? 'bg-rose-500 animate-ping' : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-[11px] text-slate-400">
                    {isListening ? `Live Mic: ${micVolume}%` : 'Mic Ready'}
                  </span>
                </div>

                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-75"
                    style={{ width: `${isListening ? micVolume : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deep Video Sentiment, Head Pose Stability & Anti-Cheat Analyzer */}
          <VideoSentimentAnalyzer
            videoRef={candidateVideoRef}
            videoStream={videoStream}
            cameraEnabled={cameraEnabled}
            isStarted={isStarted && !isFinished}
            isListening={isListening}
            currentQuestion={currentQ?.question}
            onSentimentChange={setVideoSentiment}
          />

          {/* Active Question & Live Voice Response Station */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Response Box */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                {/* Question Focus & Repeat Question Bar */}
                <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl font-bold text-xs">
                        Question {currentIndex + 1} of {questions.length}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        • {currentQ.category}
                      </span>
                      {repeatCounts[currentQ.id] ? (
                        <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-[10.5px] font-bold animate-pulse">
                          Repeated {repeatCounts[currentQ.id]}x
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTime(questionTimeElapsed)} (Total: {formatTime(secondsElapsed)})</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50/90 to-blue-50/60 dark:from-indigo-950/40 dark:to-slate-900/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Interviewer Prompt</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                          "{currentQ.question}"
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          Interviewer Context: {currentQ.contextWhyAsked}
                        </p>
                      </div>

                      {/* Prominent Repeat Question Action Buttons */}
                      <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0 pt-1">
                        {isAiSpeaking ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold animate-pulse">
                              <Volume2 className="w-4 h-4 animate-bounce" /> Speaking Question...
                            </span>
                            <button
                              type="button"
                              onClick={handleStopSpeech}
                              className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/80 hover:text-rose-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 transition flex items-center gap-1 shadow-xs"
                              title="Stop interviewer voice"
                            >
                              <Square className="w-3 h-3 fill-current" /> Stop
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRepeatQuestion('normal', true)}
                              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition flex items-center gap-1.5 ring-2 ring-indigo-500/20 active:scale-95"
                              title="Repeat the question with voice audio (Shortcut: Alt+R)"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span>Repeat Question</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRepeatQuestion('slow', true)}
                              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl text-xs border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1 shadow-xs active:scale-95"
                              title="Repeat question slowly and clearly at 0.82x speed"
                            >
                              <Ear className="w-3.5 h-3.5" />
                              <span>0.82x Slow</span>
                            </button>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <span>Missed the question? Click Repeat or press <kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-mono text-[9px] border border-slate-200 dark:border-slate-700">Alt+R</kbd></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Audio Visualizer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <AudioVisualizer
                    stream={mediaStream}
                    isListening={isListening}
                    isAiSpeaking={isAiSpeaking}
                  />
                </div>

                {/* Prominent Recording Buttons & Voice Controls */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Your Spoken Answer (Voice-to-Text):
                      </span>
                      {isListening && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 rounded-md text-[10.5px] font-bold border border-rose-200 dark:border-rose-800 animate-pulse">
                          <Activity className="w-3 h-3" /> Recording Spoken Audio ({micVolume}%)
                        </span>
                      )}
                      {isTranscribing && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-md text-[10.5px] font-bold border border-indigo-200 dark:border-indigo-800 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> AI Transcribing Audio...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleListening}
                        disabled={isTranscribing}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                          isListening
                            ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-4 h-4" />
                            <span>Stop & Transcribe Answer</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            <span>Record Spoken Answer</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRepeatQuestion('normal')}
                        disabled={isTranscribing}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 transition"
                        title="Hear the interviewer ask the question again"
                      >
                        <Ear className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Hear Question</span>
                      </button>

                      {lastAudioBase64 && !isListening && (
                        <button
                          type="button"
                          onClick={handleReTranscribeAudio}
                          disabled={isTranscribing}
                          className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 transition"
                          title="Re-run Gemini AI Audio Understanding on last recording"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isTranscribing ? 'animate-spin' : ''}`} />
                          <span>Re-transcribe</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audio Playback If Recorded */}
                  {recordedAudioUrl && !isListening && (
                    <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-semibold">
                        <Volume1 className="w-4 h-4 text-indigo-600" />
                        <span>Listen to your recorded answer:</span>
                      </div>
                      <audio controls src={recordedAudioUrl} className="h-8 max-w-[280px]" />
                    </div>
                  )}

                  {/* STAR Structure & Quick Insertion Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
                        Insert STAR:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleInsertStarSection('Situation')}
                        className="px-2.5 py-1 rounded bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-semibold text-[11px] transition"
                      >
                        + Situation
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertStarSection('Task')}
                        className="px-2.5 py-1 rounded bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-semibold text-[11px] transition"
                      >
                        + Task
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertStarSection('Action')}
                        className="px-2.5 py-1 rounded bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-semibold text-[11px] transition"
                      >
                        + Action
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertStarSection('Result')}
                        className="px-2.5 py-1 rounded bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-semibold text-[11px] transition"
                      >
                        + Result
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleFormatAnswer}
                        disabled={!candidateAnswer}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 font-bold text-[11px] disabled:opacity-40 transition"
                        title="Auto-format punctuation, capitalizations, and technical acronyms"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Format Transcript</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleInsertSample}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/80 border border-amber-200 dark:border-amber-800 font-bold text-[11px] transition"
                        title="Insert a sample spoken STAR answer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Insert Sample Answer</span>
                      </button>
                    </div>
                  </div>

                  {/* Transcript Textarea */}
                  <div className="relative">
                    <textarea
                      rows={6}
                      value={candidateAnswer}
                      onChange={(e) => setCandidateAnswer(e.target.value)}
                      placeholder="Click 'Record Spoken Answer' and speak clearly into your mic, or type your answer here using the STAR method..."
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs leading-relaxed text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    {interimTranscript && (
                      <div className="absolute bottom-3 left-4 right-4 bg-blue-50/95 dark:bg-slate-900/95 backdrop-blur-xs p-2.5 rounded-lg border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 italic flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span>Speaking: "{interimTranscript}"</span>
                      </div>
                    )}
                  </div>

                  {/* Real-Time Live STAR Structure Tags */}
                  {(() => {
                    const safeCandidate = candidateAnswer || '';
                    const safeInterim = interimTranscript || '';
                    const fullText = (safeCandidate + ' ' + safeInterim).toLowerCase();
                    const hasSit = /(when i was|at my previous|during my time|we had|in my role|the problem was|faced with)/i.test(fullText);
                    const hasTask = /(my responsibility|i needed to|the goal was|the requirement was|tasked with|i was responsible)/i.test(fullText);
                    const hasAct = /(i implemented|i architected|i configured|i refactored|i designed|i optimized|i resolved|we used|i built)/i.test(fullText);
                    const hasRes = /(resulted in|reduced by|increased by|achieved|slashed|improved by|percent|%|successfully delivered|metrics|latency)/i.test(fullText);
                    const wordsCount = (fullText || '').trim().split(/\s+/).filter(Boolean).length;

                    return (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>STAR Structure Detector:</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-semibold text-[10.5px] transition flex items-center gap-1 ${
                              hasSit
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : 'bg-slate-200 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {hasSit && <Check className="w-3 h-3" />} [S] Situation
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-md font-semibold text-[10.5px] transition flex items-center gap-1 ${
                              hasTask
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : 'bg-slate-200 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {hasTask && <Check className="w-3 h-3" />} [T] Task
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-md font-semibold text-[10.5px] transition flex items-center gap-1 ${
                              hasAct
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : 'bg-slate-200 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {hasAct && <Check className="w-3 h-3" />} [A] Action
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-md font-semibold text-[10.5px] transition flex items-center gap-1 ${
                              hasRes
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : 'bg-slate-200 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {hasRes && <Check className="w-3 h-3" />} [R] Result
                          </span>
                        </div>

                        <div className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {wordsCount} words spoken
                        </div>
                      </div>
                    );
                  })()}

                  {/* Submit / Finish Question */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsStarGuideOpen(true)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> View STAR Strategy Guide
                      </button>
                      {candidateAnswer && (
                        <button
                          type="button"
                          onClick={() => {
                            setCandidateAnswer('');
                            setInterimTranscript('');
                            setRecordedAudioUrl(null);
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 ml-2"
                        >
                          Clear Text
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleSubmitAnswer}
                      disabled={isEvaluating || (!(candidateAnswer || '').trim() && !(interimTranscript || '').trim())}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Scoring Candidate Answer...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Submit & Score Response</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant AI Evaluation Feedback Card */}
              {currentFeedback && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Question Evaluation & Spoken Coaching
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Score:</span>
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm rounded-xl border border-emerald-200 dark:border-emerald-800">
                        {currentFeedback.overallScore || currentFeedback.score || 85}/100
                      </span>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl space-y-2">
                      <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Key Strengths
                      </h5>
                      <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                        {(currentFeedback.strengths || ['Good structured explanation']).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-2">
                      <h5 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-600" /> High-Impact Improvements
                      </h5>
                      <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                        {(currentFeedback.improvements || ['Incorporate more quantitative metrics']).map((imp, i) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Gemini AI Suggested Model STAR Answer */}
                  {currentFeedback.sampleBetterAnswer && (
                    <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Gemini AI Suggested Model STAR Answer (100/100 Benchmark)</span>
                        </h5>
                        <button
                          type="button"
                          onClick={() => {
                            setCandidateAnswer(currentFeedback.sampleBetterAnswer || '');
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition flex items-center gap-1 shadow-xs active:scale-95"
                          title="Copy suggested correct answer into candidate response text box"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Load Model Answer to Textbox</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                        "{currentFeedback.sampleBetterAnswer}"
                      </p>
                    </div>
                  )}

                  {/* Next Question Navigation */}
                  <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
                    >
                      <span>
                        {currentIndex < questions.length - 1
                          ? 'Proceed to Next Question'
                          : 'Complete Interview & View Final Report'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Stats & Speedometer */}
            <div className="lg:col-span-4 space-y-6">
              {/* Live Speech Speedometer */}
              <SpeechSpeedometer
                transcript={candidateAnswer + (interimTranscript ? ` ${interimTranscript}` : '')}
                timeElapsedSeconds={questionTimeElapsed}
                isRecording={isListening}
              />

              {/* Ideal Answer Hints */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    What Interviewers Look For
                  </h4>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  {(currentQ.idealAnswerHints || [
                    'Clear problem definition',
                    'Specific trade-off decisions',
                    'Quantified engineering outcome',
                  ]).map((hint, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-500 font-bold shrink-0">•</span>
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Overall Progress */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Interview Progress
                </h4>
                <div className="space-y-2">
                  {questions.map((q, idx) => {
                    const answered = Boolean(candidateAnswers[q.id]);
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          if (answered || isCurrent) {
                            setCurrentIndex(idx);
                            setCandidateAnswer(candidateAnswers[q.id] || '');
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl text-left text-xs transition flex items-center justify-between ${
                          isCurrent
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 font-bold text-indigo-900 dark:text-indigo-200'
                            : answered
                            ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-medium'
                            : 'opacity-40 text-slate-400'
                        }`}
                      >
                        <span className="truncate pr-2">
                          Q{idx + 1}: {q.category}
                        </span>
                        {answered ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
                        ) : (
                          <span className="text-[10px] text-slate-400">Pending</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAR Answer Strategy Guide Modal */}
      <StarAnswerGuideModal
        isOpen={isStarGuideOpen}
        onClose={() => setIsStarGuideOpen(false)}
      />

      {/* Voice Interview Performance Report Modal */}
      <VoiceInterviewReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        questions={questions}
        feedbackHistory={feedbackHistory}
        answers={candidateAnswers}
        totalDurationSeconds={secondsElapsed}
        domain={jobTarget || (interviewType ? interviewType.toUpperCase() : 'Technical Engineering')}
        difficulty={difficulty}
        personaName={selectedPersona.name}
        onRestart={handleRestartInterview}
        onPlaySpeech={playSpeech}
        isAiSpeaking={isAiSpeaking}
        videoSentiment={videoSentiment || undefined}
      />
    </div>
  );
};

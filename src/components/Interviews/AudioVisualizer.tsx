import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isListening: boolean;
  isAiSpeaking: boolean;
  themeColor?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  stream,
  isListening,
  isAiSpeaking,
  themeColor = '#4f46e5',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Web Audio API Analyser when user stream is available and active
  useEffect(() => {
    if (isListening && stream) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch (err) {
        console.warn('Web Audio API visualization initialization skipped:', err);
      }
    } else {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isListening, stream]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (isListening && analyserRef.current) {
        // Render real-time live microphone spectrum
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const barCount = 28;
        const barWidth = (width / barCount) * 0.65;
        const gap = (width / barCount) * 0.35;

        for (let i = 0; i < barCount; i++) {
          const index = Math.floor((i / barCount) * bufferLength);
          const rawVal = dataArray[index] || 0;
          const barHeight = Math.max(4, (rawVal / 255) * (height - 8));
          const x = i * (barWidth + gap) + gap / 2;
          const y = (height - barHeight) / 2;

          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#3b82f6');
          gradient.addColorStop(0.5, '#6366f1');
          gradient.addColorStop(1, '#8b5cf6');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 3, 3]);
          ctx.fill();
        }
      } else if (isAiSpeaking) {
        // Render lively pulsing AI voice wave
        phase += 0.12;
        const barCount = 32;
        const barWidth = (width / barCount) * 0.6;
        const gap = (width / barCount) * 0.4;

        for (let i = 0; i < barCount; i++) {
          const sinFactor = Math.sin(phase + i * 0.35);
          const cosFactor = Math.cos(phase * 0.8 + i * 0.2);
          const barHeight = Math.max(6, (Math.abs(sinFactor * 0.65 + cosFactor * 0.35)) * (height - 10));
          const x = i * (barWidth + gap) + gap / 2;
          const y = (height - barHeight) / 2;

          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(0.5, '#06b6d4');
          gradient.addColorStop(1, '#3b82f6');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 3, 3]);
          ctx.fill();
        }
      } else {
        // Subtle ambient idle state line
        phase += 0.03;
        const barCount = 24;
        const barWidth = (width / barCount) * 0.5;
        const gap = (width / barCount) * 0.5;

        for (let i = 0; i < barCount; i++) {
          const gentleWave = Math.sin(phase + i * 0.3) * 3 + 4;
          const x = i * (barWidth + gap) + gap / 2;
          const y = (height - gentleWave) / 2;

          ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, gentleWave, [2, 2, 2, 2]);
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, isAiSpeaking, themeColor]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-full h-12 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={380}
          height={48}
          className="w-full max-w-[380px] h-12"
        />
      </div>
      <div className="text-[10px] font-medium tracking-wide mt-1 flex items-center gap-1.5">
        {isListening ? (
          <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block mr-0.5" />
            Live Microphone Active • Listening & Transcribing...
          </span>
        ) : isAiSpeaking ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block mr-0.5" />
            AI Coach Speaking...
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">Audio Ready • Press microphone to speak</span>
        )}
      </div>
    </div>
  );
};

"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  audioLevel: number;
  isRecording: boolean;
  emotion: string;
  emotionConfidence: number;
}

const EMOTION_COLORS: Record<string, string> = {
  happy: "text-emerald-400",
  neutral: "text-blue-400",
  surprised: "text-yellow-400",
  sad: "text-blue-300",
  angry: "text-red-400",
  fearful: "text-orange-400",
  disgusted: "text-purple-400",
};

const EMOTION_LABELS: Record<string, string> = {
  happy: "Confident",
  neutral: "Composed",
  surprised: "Alert",
  sad: "Low energy",
  angry: "Tense",
  fearful: "Nervous",
  disgusted: "Uncertain",
};

export default function CamPanel({ audioLevel, isRecording, emotion, emotionConfidence }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setCamReady(true);
        }
      })
      .catch(() => setCamError(true));

    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  const bars = 20;
  const activeEmotionColor = EMOTION_COLORS[emotion] ?? "text-zinc-400";
  const activeEmotionLabel = EMOTION_LABELS[emotion] ?? emotion;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Cam feed */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-white/8 bg-zinc-900">
        {!camReady && !camError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        {camError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <p className="text-xs">Camera unavailable</p>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover scale-x-[-1]"
        />

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-300 text-xs font-medium">REC</span>
          </div>
        )}

        {/* Emotion badge */}
        {camReady && emotion && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm">
            <span className={`text-xs font-medium ${activeEmotionColor}`}>
              {activeEmotionLabel}
            </span>
          </div>
        )}
      </div>

      {/* Audio level visualizer */}
      <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-500 font-medium">Microphone</span>
          {isRecording ? (
            <span className="text-xs text-red-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="text-xs text-zinc-600">Idle</span>
          )}
        </div>
        <div className="flex items-end gap-0.5 h-8">
          {Array.from({ length: bars }).map((_, i) => {
            const threshold = i / bars;
            const active = audioLevel > threshold;
            return (
              <div
                key={i}
                style={{ height: `${20 + Math.sin(i * 0.5) * 60}%` }}
                className={`flex-1 rounded-full transition-colors duration-75 ${
                  active
                    ? i / bars < 0.6 ? "bg-emerald-400" : i / bars < 0.8 ? "bg-yellow-400" : "bg-red-400"
                    : "bg-white/10"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Emotion confidence breakdown */}
      {camReady && emotion && (
        <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
          <p className="text-xs text-zinc-500 font-medium mb-2">Presence score</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  emotionConfidence > 0.7 ? "bg-emerald-400" : emotionConfidence > 0.4 ? "bg-blue-400" : "bg-zinc-500"
                }`}
                style={{ width: `${Math.round(emotionConfidence * 100)}%` }}
              />
            </div>
            <span className={`text-xs font-semibold tabular-nums ${activeEmotionColor}`}>
              {Math.round(emotionConfidence * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

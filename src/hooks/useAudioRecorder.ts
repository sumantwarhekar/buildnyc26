"use client";

import { useRef, useState, useCallback } from "react";

export type RecorderState = "idle" | "recording" | "processing";

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const getMimeType = () => {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio level analyser
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const tick = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(avg / 128);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();

      const mimeType = getMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setState("recording");
    } catch (err) {
      console.error("Mic error:", err);
    }
  }, []);

  const stopRecording = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return resolve(null);

      cancelAnimationFrame(animFrameRef.current);
      setAudioLevel(0);
      setState("processing");

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
        const file = new File([blob], `recording.${ext}`, { type: mimeType });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setState("idle");
        resolve(file);
      };

      recorder.stop();
    });
  }, []);

  return { state, audioLevel, startRecording, stopRecording };
}

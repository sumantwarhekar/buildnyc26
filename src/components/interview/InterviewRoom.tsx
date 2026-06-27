"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CamPanel from "./CamPanel";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

interface Question {
  id: string;
  question: string;
  hint: string;
}

interface TierData {
  label: string;
  questions: Question[];
}

interface SessionMeta {
  company: string;
  role: string;
  topic: string;
  skills: string[];
  tiers: Record<string, TierData>;
}

interface LLMFeedback {
  candidate_evaluation: string;
  technical_score: number;
  tier_progression: boolean;
  next_dialogue: string;
  interview_complete: boolean;
}

interface Turn {
  question: string;
  transcript: string;
  score: number;
  feedback: string;
  coaching: string;
}

const TIER_LABELS: Record<string, string> = {
  "1": "Fundamentals",
  "2": "Architecture",
  "3": "Expert Debug",
  "4": "System Design",
};

const TIER_COLORS: Record<string, string> = {
  "1": "text-violet-400 border-violet-500/30 bg-violet-500/10",
  "2": "text-blue-400 border-blue-500/30 bg-blue-500/10",
  "3": "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  "4": "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
};

type Stage = "ready" | "recording" | "processing" | "feedback" | "complete";

export default function InterviewRoom({
  sessionId,
  session,
}: {
  sessionId: string;
  session: SessionMeta;
}) {
  const router = useRouter();
  const { state: recorderState, audioLevel, startRecording, stopRecording } = useAudioRecorder();

  const [stage, setStage] = useState<Stage>("ready");
  const [currentTier, setCurrentTier] = useState("1");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showHints, setShowHints] = useState(true);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [lastFeedback, setLastFeedback] = useState<LLMFeedback | null>(null);
  const [transcript, setTranscript] = useState("");
  const [emotion] = useState("neutral");
  const [emotionConfidence] = useState(0.72);
  const [error, setError] = useState("");
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  const tiers = session.tiers;
  const currentTierData = tiers[currentTier];
  const currentQuestion = currentTierData?.questions[questionIndex];
  const tierColor = TIER_COLORS[currentTier] ?? TIER_COLORS["1"];
  const totalQuestions = Object.values(tiers).reduce((s, t) => s + t.questions.length, 0);
  const answeredCount = turns.length;

  const handleStartRecording = async () => {
    setError("");
    await startRecording();
    setStage("recording");
  };

  const handleStopRecording = useCallback(async () => {
    setStage("processing");
    const audioFile = await stopRecording();
    if (!audioFile) {
      setError("No audio captured. Please try again.");
      setStage("ready");
      return;
    }

    try {
      // 1. Transcribe
      const formData = new FormData();
      formData.append("audio", audioFile);
      const transcribeRes = await fetch("/api/transcribe", { method: "POST", body: formData });
      const { transcript: text } = await transcribeRes.json();
      setTranscript(text ?? "");

      // 2. Evaluate
      const emotionData = { happy: 0.1, neutral: 0.7, sad: 0.05, angry: 0.02, fear: 0.08, surprise: 0.03, disgust: 0.02 };
      const evalRes = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: session.topic,
          transcript: text,
          emotion: emotionData,
          currentTier: parseInt(currentTier),
          history: historyRef.current,
        }),
      });

      const feedback: LLMFeedback = await evalRes.json();
      setLastFeedback(feedback);

      // Update history
      historyRef.current = [
        ...historyRef.current,
        { role: "user", content: text ?? "" },
        { role: "assistant", content: JSON.stringify(feedback) },
      ];

      // Save turn
      setTurns((prev) => [
        ...prev,
        {
          question: currentQuestion?.question ?? "",
          transcript: text ?? "",
          score: feedback.technical_score,
          feedback: feedback.candidate_evaluation,
          coaching: feedback.next_dialogue,
        },
      ]);

      if (feedback.interview_complete) {
        setStage("complete");
      } else {
        setStage("feedback");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setStage("ready");
    }
  }, [currentQuestion, currentTier, session.topic, stopRecording]);

  const handleNext = () => {
    if (!lastFeedback) return;

    if (lastFeedback.tier_progression) {
      const nextTier = String(parseInt(currentTier) + 1);
      if (tiers[nextTier]) {
        setCurrentTier(nextTier);
        setQuestionIndex(0);
      }
    } else {
      const nextIndex = questionIndex + 1;
      if (nextIndex < currentTierData.questions.length) {
        setQuestionIndex(nextIndex);
      } else {
        const nextTier = String(parseInt(currentTier) + 1);
        if (tiers[nextTier]) {
          setCurrentTier(nextTier);
          setQuestionIndex(0);
        }
      }
    }

    setLastFeedback(null);
    setTranscript("");
    setStage("ready");
  };

  const scoreColor = (s: number) =>
    s >= 80 ? "text-emerald-400" : s >= 60 ? "text-blue-400" : s >= 40 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/5 px-6 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/interview/${sessionId}`)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <span className="text-sm font-medium text-white">{session.company}</span>
            <span className="text-zinc-600 mx-2">·</span>
            <span className="text-sm text-zinc-400">{session.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${tierColor}`}>
            Tier {currentTier} — {TIER_LABELS[currentTier]}
          </span>
          <span className="text-xs text-zinc-500">{answeredCount}/{totalQuestions} answered</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — AI Assistant */}
        <div className="w-1/2 flex flex-col border-r border-white/5 overflow-y-auto">
          {/* Progress bar */}
          <div className="h-0.5 bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-blue-500"
              animate={{ width: `${(answeredCount / Math.max(totalQuestions, 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex-1 p-8 flex flex-col gap-6 w-full">
            {/* AI greeting / status */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 text-sm font-bold">
                AI
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 mb-1">Skopus AI Interviewer</p>
                <AnimatePresence mode="wait">
                  {stage === "ready" && (
                    <motion.p key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-zinc-300 text-sm leading-relaxed">
                      {turns.length === 0
                        ? `Let's begin. I'll be your interviewer today for the ${session.role} role at ${session.company}. Take your time, speak clearly, and remember — it's a conversation.`
                        : lastFeedback?.next_dialogue ?? "Ready for the next question."}
                    </motion.p>
                  )}
                  {stage === "recording" && (
                    <motion.p key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-zinc-300 text-sm">
                      I&apos;m listening… take your time.
                    </motion.p>
                  )}
                  {stage === "processing" && (
                    <motion.p key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-zinc-400 text-sm">
                      Analyzing your response…
                    </motion.p>
                  )}
                  {stage === "feedback" && lastFeedback && (
                    <motion.p key="fb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-zinc-300 text-sm leading-relaxed">
                      {lastFeedback.next_dialogue}
                    </motion.p>
                  )}
                  {stage === "complete" && (
                    <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 text-sm">
                      Great work! You&apos;ve completed the interview. Let me put together your report.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Current question */}
            {currentQuestion && stage !== "complete" && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-2xl border border-white/10 bg-white/3 p-6 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${tierColor}`}>
                      {TIER_LABELS[currentTier]}
                    </span>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                        showHints
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                          : "border-white/10 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                      {showHints ? "Hide answer" : "Show answer"}
                    </button>
                  </div>

                  <p className="text-white text-lg leading-relaxed font-medium">
                    {currentQuestion.question}
                  </p>

                  <AnimatePresence>
                    {showHints && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-amber-500/20 pt-4 mt-2">
                          <p className="text-xs text-amber-400 font-semibold uppercase tracking-widest mb-2">Model answer — key points</p>
                          <p className="text-zinc-300 text-sm leading-relaxed">{currentQuestion.hint}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Transcript */}
            <AnimatePresence>
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-white/8 bg-white/2 px-5 py-4"
                >
                  <p className="text-xs text-zinc-500 mb-2 font-medium">Your answer</p>
                  <p className="text-zinc-300 text-sm leading-relaxed">{transcript}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback card */}
            <AnimatePresence>
              {stage === "feedback" && lastFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/3 p-6 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Answer Analysis</p>
                    <span className={`text-2xl font-bold tabular-nums ${scoreColor(lastFeedback.technical_score)}`}>
                      {lastFeedback.technical_score}/100
                    </span>
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed">{lastFeedback.candidate_evaluation}</p>

                  <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
                    lastFeedback.tier_progression
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                  }`}>
                    {lastFeedback.tier_progression ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Advancing to the next tier
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        Let&apos;s dig deeper on this tier
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
            )}

            {/* Past turns */}
            {turns.length > 0 && stage !== "feedback" && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-zinc-600 font-semibold uppercase tracking-widest">Previous answers</p>
                {[...turns].reverse().map((t, i) => (
                  <div key={i} className="rounded-xl border border-white/6 bg-white/2 px-4 py-3 flex items-center justify-between gap-4">
                    <p className="text-zinc-500 text-xs truncate flex-1">{t.question}</p>
                    <span className={`text-sm font-bold shrink-0 tabular-nums ${scoreColor(t.score)}`}>{t.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom controls */}
          <div className="border-t border-white/5 p-6">
            <div>
              {stage === "ready" && (
                <button
                  onClick={handleStartRecording}
                  className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-semibold text-sm transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="6" />
                  </svg>
                  Start recording your answer
                </button>
              )}

              {stage === "recording" && (
                <button
                  onClick={handleStopRecording}
                  className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-sm transition-all hover:bg-white/90 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="1" />
                  </svg>
                  Stop recording
                </button>
              )}

              {stage === "processing" && (
                <div className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-zinc-400 text-sm">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Analyzing your answer…
                </div>
              )}

              {stage === "feedback" && (
                <button
                  onClick={handleNext}
                  className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-sm transition-all hover:bg-white/90 flex items-center justify-center gap-2"
                >
                  Next question
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              )}

              {stage === "complete" && (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  View your report
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Cam feed */}
        <div className="w-1/2 p-5 flex flex-col">
          <CamPanel
            audioLevel={audioLevel}
            isRecording={stage === "recording"}
            emotion={emotion}
            emotionConfidence={emotionConfidence}
          />
        </div>
      </div>
    </div>
  );
}

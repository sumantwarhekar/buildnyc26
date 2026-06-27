"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  question: string;
  hint: string;
}

interface TierData {
  label: string;
  questions: Question[];
}

interface Props {
  sessionId: string;
  company: string;
  role: string;
  topic: string;
  summary: string;
  skills: string[];
  tiers: Record<string, TierData>;
}

const TIER_COLORS = {
  "1": { border: "border-violet-500/30", bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-400" },
  "2": { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  "3": { border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-400" },
  "4": { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
};

export default function SessionPreview({ sessionId, company, role, topic, summary, skills, tiers }: Props) {
  const router = useRouter();
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  const totalQuestions = Object.values(tiers).reduce((s, t) => s + t.questions.length, 0);

  const handleStart = () => {
    router.push(`/interview/${sessionId}/live`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-[#09090b] overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors mb-8 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <p className="text-zinc-500 text-sm mb-1">Interview Preview</p>
          <h1 className="text-3xl font-bold text-white mb-2">{topic}</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="font-medium text-zinc-200">{company}</span>
            <span className="text-zinc-600">·</span>
            <span>{role}</span>
            <span className="text-zinc-600">·</span>
            <span>{totalQuestions} questions across 4 tiers</span>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/8 bg-white/3 p-6 mb-6"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">What this interview covers</h2>
          <p className="text-zinc-300 text-sm leading-relaxed">{summary}</p>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/8 bg-white/3 p-6 mb-6"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Technical skills being tested</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-zinc-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col gap-3 mb-10"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Question breakdown</h2>

          {(["1", "2", "3", "4"] as const).map((tier) => {
            const t = tiers[tier];
            const colors = TIER_COLORS[tier];
            const isExpanded = expandedTier === tier;

            return (
              <div key={tier} className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden`}>
                <button
                  onClick={() => setExpandedTier(isExpanded ? null : tier)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <div>
                      <span className={`text-xs font-semibold ${colors.text}`}>Tier {tier}</span>
                      <span className="text-white font-semibold ml-2">{t.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 text-sm">{t.questions.length} questions</span>
                    <svg
                      className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/8 divide-y divide-white/5">
                        {t.questions.map((q, i) => (
                          <div key={q.id} className="px-5 py-4 flex gap-4">
                            <span className="text-zinc-600 text-xs font-mono mt-0.5 w-6 shrink-0">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div className="flex flex-col gap-1">
                              <p className="text-zinc-200 text-sm">{q.question}</p>
                              <p className="text-zinc-500 text-xs leading-relaxed">{q.hint}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>

        {/* Start CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between gap-4 sticky bottom-6"
        >
          <div className="rounded-2xl border border-white/8 bg-[#09090b]/90 backdrop-blur px-5 py-3 flex-1 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">{totalQuestions} questions ready</p>
              <p className="text-zinc-500 text-xs">AI will adapt based on your answers</p>
            </div>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              Start interview
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

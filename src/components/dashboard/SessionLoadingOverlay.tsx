"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  { label: "Searching the web for company intel…", duration: 6000 },
  { label: "Analyzing role requirements…", duration: 5000 },
  { label: "Building your 4-tier questions…", duration: 5000 },
  { label: "Almost ready…", duration: 4000 },
];

const TOTAL = STAGES.reduce((s, st) => s + st.duration, 0);
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
  company: string;
  role: string;
}

export default function SessionLoadingOverlay({ company, role }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const e = Date.now() - start;
      setElapsed(Math.min(e, TOTAL));

      // update stage
      let acc = 0;
      for (let i = 0; i < STAGES.length; i++) {
        acc += STAGES[i].duration;
        if (e < acc) {
          setStageIndex(i);
          break;
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min(elapsed / TOTAL, 0.97); // cap at 97% until redirect
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center px-6"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm text-center">
        {/* Circle progress */}
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Track */}
            <circle
              cx="60" cy="60" r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
            />
            {/* Progress */}
            <motion.circle
              cx="60" cy="60" r={RADIUS}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.3s ease" }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
          </svg>

          {/* Percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white tabular-nums">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-white">
            Preparing your interview
          </h2>
          <p className="text-zinc-400 text-sm">
            {company} · {role}
          </p>
        </div>

        {/* Stage label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-sm text-zinc-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
            {STAGES[stageIndex].label}
          </motion.div>
        </AnimatePresence>

        {/* Stage dots */}
        <div className="flex gap-2">
          {STAGES.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                i <= stageIndex ? "bg-violet-400" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

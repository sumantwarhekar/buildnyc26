"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SessionLoadingOverlay from "./SessionLoadingOverlay";
import SessionPreview from "./SessionPreview";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SessionData {
  sessionId: string;
  company: string;
  role: string;
  topic: string;
  summary: string;
  skills: string[];
  tiers: Record<string, { label: string; questions: { id: string; question: string; hint: string }[] }>;
}

const steps = ["company", "role", "jd"] as const;

export default function NewSessionModal({ open, onClose }: Props) {
  const [step, setStep] = useState<(typeof steps)[number]>("company");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  const reset = () => {
    setStep("company");
    setCompany("");
    setRole("");
    setJobDescription("");
    setError("");
    setLoading(false);
    setSessionData(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!company.trim() || !role.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(`[${data.stage ?? "unknown"}] ${data.error}${data.detail ? ` — ${data.detail}` : ""}`);

      setSessionData({ ...data, company, role });
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  // Full-screen loading overlay
  if (loading) {
    return (
      <AnimatePresence>
        <SessionLoadingOverlay company={company} role={role} />
      </AnimatePresence>
    );
  }

  // Full-screen preview after research is done
  if (sessionData) {
    return (
      <SessionPreview
        sessionId={sessionData.sessionId}
        company={sessionData.company}
        role={sessionData.role}
        topic={sessionData.topic}
        summary={sessionData.summary}
        skills={sessionData.skills}
        tiers={sessionData.tiers}
      />
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-[#111113] border border-white/10 rounded-2xl w-full max-w-lg p-8 pointer-events-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">New interview session</h2>
                  <p className="text-zinc-400 text-sm mt-1">
                    Tell us where you&apos;re interviewing — we&apos;ll research and build your questions.
                  </p>
                </div>
                <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors ml-4 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5 mb-8">
                {steps.map((s) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      steps.indexOf(s) <= steps.indexOf(step) ? "bg-violet-500" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-5">
                <AnimatePresence mode="wait">
                  {step === "company" && (
                    <motion.div
                      key="company"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      className="flex flex-col gap-1.5"
                    >
                      <label className="text-sm font-medium text-zinc-300">Company name</label>
                      <input
                        autoFocus
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && company.trim() && setStep("role")}
                        placeholder="e.g. Stripe, OpenAI, Google"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </motion.div>
                  )}

                  {step === "role" && (
                    <motion.div
                      key="role"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      className="flex flex-col gap-1.5"
                    >
                      <label className="text-sm font-medium text-zinc-300">Role / Position</label>
                      <input
                        autoFocus
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && role.trim() && setStep("jd")}
                        placeholder="e.g. Senior Frontend Engineer, Staff SWE"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </motion.div>
                  )}

                  {step === "jd" && (
                    <motion.div
                      key="jd"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      className="flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-300">Job description</label>
                        <span className="text-xs text-zinc-500">Optional but recommended</span>
                      </div>
                      <textarea
                        autoFocus
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here for more tailored questions."
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {step === "jd" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-sm"
                  >
                    <p className="text-zinc-400">
                      Interviewing at <span className="text-white font-medium">{company}</span> for{" "}
                      <span className="text-white font-medium">{role}</span>
                    </p>
                  </motion.div>
                )}

                {error && (
                  <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                {step !== "company" && (
                  <button
                    onClick={() => setStep(steps[steps.indexOf(step) - 1])}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm hover:text-white hover:border-white/20 transition-colors"
                  >
                    Back
                  </button>
                )}

                {step !== "jd" ? (
                  <button
                    onClick={() => setStep(steps[steps.indexOf(step) + 1])}
                    disabled={step === "company" ? !company.trim() : !role.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-500 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
                    </svg>
                    Research & build questions
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

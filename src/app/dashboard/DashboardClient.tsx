"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import NewSessionModal from "@/components/dashboard/NewSessionModal";
import Link from "next/link";

interface Session {
  id: string;
  topic: string;
  final_score: number | null;
  current_tier: number;
  created_at: string;
  completed_at: string | null;
}

interface Props {
  user: { email: string; fullName: string | null };
  sessions: Session[];
}

const tierLabels: Record<number, string> = {
  1: "Fundamentals",
  2: "Architecture",
  3: "Expert Debug",
  4: "System Design",
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
};

export default function DashboardClient({ user, sessions }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const avgScore = sessions.length
    ? Math.round(
        sessions
          .filter((s) => s.final_score !== null)
          .reduce((sum, s) => sum + (s.final_score ?? 0), 0) /
          Math.max(sessions.filter((s) => s.final_score !== null).length, 1)
      )
    : null;

  const completed = sessions.filter((s) => s.completed_at).length;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight text-white text-lg">
            Skopus <span className="gradient-text">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400 hidden sm:block">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-white">
            {user.fullName ? `Hey, ${user.fullName.split(" ")[0]} 👋` : "Dashboard"}
          </h1>
          <p className="text-zinc-400 mt-1">Ready for your next interview?</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
        >
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Sessions</p>
            <p className="text-3xl font-bold text-white">{sessions.length}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Completed</p>
            <p className="text-3xl font-bold text-white">{completed}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6 col-span-2 md:col-span-1">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Avg Score</p>
            <p className={`text-3xl font-bold ${avgScore !== null ? scoreColor(avgScore) : "text-zinc-600"}`}>
              {avgScore !== null ? `${avgScore}/100` : "—"}
            </p>
          </div>
        </motion.div>

        {/* Start new session CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10"
        >
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Start new session
          </button>
        </motion.div>

        <NewSessionModal open={modalOpen} onClose={() => setModalOpen(false)} />

        {/* Session history */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Recent sessions</h2>

          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-12 text-center">
              <p className="text-zinc-500 text-sm">No sessions yet. Start your first interview above.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.05 }}
                  className="rounded-2xl border border-white/8 bg-white/3 px-6 py-4 flex items-center justify-between gap-4 hover:border-white/15 hover:bg-white/5 transition-all cursor-pointer group"
                  onClick={() => router.push(`/interview/${session.id}`)}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{session.topic}</p>
                    <p className="text-zinc-500 text-xs">
                      {new Date(session.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                      {" · "}
                      <span className="text-zinc-400">Tier {session.current_tier} — {tierLabels[session.current_tier]}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {session.completed_at ? (
                      <span className={`text-lg font-bold ${session.final_score !== null ? scoreColor(session.final_score) : "text-zinc-500"}`}>
                        {session.final_score !== null ? `${session.final_score}` : "—"}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">
                        In progress
                      </span>
                    )}
                    <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

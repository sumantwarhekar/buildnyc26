"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;

export default function AnimatedHero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center pt-40 pb-32 px-6 overflow-hidden">
      {/* Glow orbs */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none"
        animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 left-[30%] w-[400px] h-[400px] rounded-full bg-blue-600/8 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
        <motion.span
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-400"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI-Powered &middot; Voice + Vision &middot; Adaptive Scenarios
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1]"
        >
          Ace your next
          <br />
          <span className="gradient-text">technical interview</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
          className="text-zinc-400 text-lg max-w-xl leading-relaxed"
        >
          Skopus AI puts you in a live session with an adaptive AI engineering
          manager. It listens, watches, and scores — so you can improve before
          it counts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-2"
        >
          <Link
            href="/auth/signup"
            className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started free
          </Link>
          <Link
            href="/auth/signin"
            className="px-6 py-3 rounded-xl border border-white/10 text-zinc-300 text-sm font-medium hover:border-white/20 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

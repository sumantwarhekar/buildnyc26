"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
      </svg>
    ),
    title: "Voice-Driven Interviews",
    description: "Speak your answers naturally. Groq Whisper transcribes in real-time with sub-second latency.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "Adaptive Difficulty",
    description: "4-tier escalation from fundamentals to system design. The AI advances only when you're ready.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
    title: "Emotion Intelligence",
    description: "On-device facial analysis tracks confidence and composure — entirely private, zero video uploads.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: "Detailed Score Reports",
    description: "Get a weighted performance report by email after each session — technical accuracy meets behavioral composure.",
  },
];

const tiers = [
  { label: "Tier 1", name: "Fundamentals", color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/30", text: "text-violet-400", bar: "bg-violet-400" },
  { label: "Tier 2", name: "Architecture", color: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/30", text: "text-blue-400", bar: "bg-blue-400" },
  { label: "Tier 3", name: "Expert Debug", color: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/30", text: "text-cyan-400", bar: "bg-cyan-400" },
  { label: "Tier 4", name: "System Design", color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-400", bar: "bg-emerald-400" },
];

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function TiersSection() {
  return (
    <Section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Adaptive Difficulty</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Four tiers. One session.</h2>
          <p className="text-zinc-400 mt-3 max-w-md mx-auto">
            The AI starts with the basics and escalates only when you demonstrate mastery.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-2xl border ${tier.border} bg-gradient-to-b ${tier.color} p-6 flex flex-col gap-2`}
            >
              <span className={`text-xs font-semibold ${tier.text}`}>{tier.label}</span>
              <span className="text-white font-semibold text-base">{tier.name}</span>
              <div className="mt-auto flex gap-1 pt-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className={`h-1 flex-1 rounded-full ${j <= i ? tier.bar : "bg-white/10"}`} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function FeaturesSection() {
  return (
    <Section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">What makes it different</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Built for real feedback</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-white/8 bg-white/3 p-6 flex flex-col gap-3 hover:border-white/15 hover:bg-white/5 transition-colors cursor-default"
            >
              <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center text-zinc-300">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-sm">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function CTASection() {
  return (
    <Section className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-white/8 bg-white/3 p-12 flex flex-col items-center gap-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-blue-600/10 pointer-events-none" />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white">Ready to level up?</h2>
          <p className="relative text-zinc-400 max-w-sm">
            Pick a topic, hit record, and let Skopus AI stress-test your knowledge in real time.
          </p>
          <Link
            href="/auth/signup"
            className="relative px-8 py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start your first session
          </Link>
        </motion.div>
      </div>
    </Section>
  );
}

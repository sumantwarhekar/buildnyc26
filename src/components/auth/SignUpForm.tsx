"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createBrowserClient } from "@/lib/supabase";

export default function SignUpForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSubmittedEmail(email);

    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message || error.code || JSON.stringify(error));
      console.error("Signup error:", error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center flex flex-col items-center gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Check your email</h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          We sent a confirmation link to <span className="text-zinc-200">{submittedEmail}</span>. Click it to activate your account.
        </p>
        <Link href="/auth/signin" className="text-sm text-zinc-400 hover:text-white transition-colors mt-2">
          Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm"
    >
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block mb-8 text-lg font-semibold">
          Skopus <span className="gradient-text">AI</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">Create an account</h1>
        <p className="text-zinc-400 mt-1 text-sm">Start practicing today — it&apos;s free</p>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-300 font-medium">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Smith"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-300 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-300 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            minLength={8}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-zinc-300 hover:text-white transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}

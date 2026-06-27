"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createBrowserClient } from "@/lib/supabase";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      console.log("Attempting sign in for:", email);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      console.log("Sign in response:", JSON.stringify({
        session: data?.session ? "exists" : null,
        user: data?.user?.email,
        error: error?.message,
        errorCode: error?.code,
      }));

      if (error) {
        setError(error.message || error.code || JSON.stringify(error));
      } else if (data.session) {
        window.location.href = "/dashboard";
      } else {
        setError("Sign in succeeded but no session was created. Please try again.");
      }
    } catch (err) {
      console.error("Unexpected sign in error:", err);
      setError(err instanceof Error ? err.message : "Unexpected error. Check console.");
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-zinc-400 mt-1 text-sm">Sign in to your account</p>
      </div>

      <form onSubmit={handleSignIn} className="flex flex-col gap-4">
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
            placeholder="••••••••"
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
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-zinc-300 hover:text-white transition-colors">
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}

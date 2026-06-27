import Link from "next/link";
import AnimatedHero from "@/components/landing/AnimatedHero";
import { TiersSection, FeaturesSection, CTASection } from "@/components/landing/AnimatedSections";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col bg-[#09090b] text-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight text-white text-lg">
            Skopus <span className="gradient-text">AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <AnimatedHero />
      <TiersSection />
      <FeaturesSection />
      <CTASection />

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-sm">
          <span>Skopus <span className="text-zinc-300 font-medium">AI</span></span>
          <span>Built for BuildNYC 2026</span>
        </div>
      </footer>
    </main>
  );
}

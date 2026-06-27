import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#09090b] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px] pointer-events-none" />
      <SignInForm />
    </main>
  );
}

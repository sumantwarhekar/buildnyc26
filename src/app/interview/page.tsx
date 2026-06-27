import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function InterviewPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center px-6">
      <div className="text-center flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">Welcome, {user.email}</h1>
        <p className="text-zinc-400">Interview session coming soon.</p>
      </div>
    </main>
  );
}

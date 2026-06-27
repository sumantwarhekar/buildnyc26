import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select("id, topic, final_score, current_tier, created_at, completed_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const fullName = user.user_metadata?.full_name as string | undefined;

  return (
    <DashboardClient
      user={{ email: user.email!, fullName: fullName ?? null }}
      sessions={sessions ?? []}
    />
  );
}

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import InterviewRoom from "@/components/interview/InterviewRoom";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function LiveInterviewPage({ params }: Props) {
  const { sessionId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: session } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) redirect("/dashboard");

  const meta = session.meta ?? {};

  return (
    <InterviewRoom
      sessionId={session.id}
      session={{
        company: meta.company ?? "",
        role: meta.role ?? "",
        topic: session.topic ?? "",
        skills: meta.skills ?? [],
        tiers: meta.tiers ?? {},
      }}
    />
  );
}

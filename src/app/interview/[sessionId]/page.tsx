import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SessionPreview from "@/components/dashboard/SessionPreview";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function InterviewSessionPage({ params }: Props) {
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
    <SessionPreview
      sessionId={session.id}
      company={meta.company ?? ""}
      role={meta.role ?? ""}
      topic={session.topic}
      summary={meta.summary ?? ""}
      skills={meta.skills ?? []}
      tiers={meta.tiers ?? {}}
    />
  );
}

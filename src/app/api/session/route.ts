import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const maxDuration = 60;

interface Question {
  id: string;
  question: string;
  hint: string;
}

interface TierData {
  label: string;
  questions: Question[];
}

async function generateTierQuestions(
  tier: number,
  research: string,
  company: string,
  role: string,
  count: number
): Promise<Question[]> {
  const tierMeta: Record<number, { label: string; instruction: string }> = {
    1: {
      label: "Fundamentals",
      instruction: `Generate ${count} baseline knowledge questions testing core terminology, concepts, and definitions relevant to this role. Questions should be approachable but reveal depth of understanding.`,
    },
    2: {
      label: "Architecture",
      instruction: `Generate ${count} questions probing the underlying WHY and HOW — architectural decisions, trade-offs, and system mechanics. Candidate should explain internals, not just definitions.`,
    },
    3: {
      label: "Expert Debug",
      instruction: `Generate ${count} scenario-based questions presenting broken code, performance issues, or failing systems. Each question should describe a specific problem to diagnose and fix.`,
    },
    4: {
      label: "System Design",
      instruction: `Generate ${count} system design and architectural trade-off questions at the staff/principal level. Questions should involve designing systems, scaling decisions, or evaluating architectural patterns at ${company}'s scale.`,
    },
  };

  const meta = tierMeta[tier];

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a Senior Engineering Manager at ${company} writing interview questions for a ${role} candidate.

${meta.instruction}

Return ONLY valid JSON:
{
  "questions": [
    { "question": "string", "hint": "string" }
  ]
}

Hints should be 1-2 sentences describing what a strong answer covers. Make questions specific to ${company}'s tech context where possible.`,
      },
      {
        role: "user",
        content: `Company research:\n${research}`,
      },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const raw = res.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(raw);
  const questions: Question[] = (parsed.questions ?? []).map(
    (q: { question: string; hint: string }, i: number) => ({
      id: `t${tier}-q${i + 1}`,
      question: q.question,
      hint: q.hint,
    })
  );
  return questions;
}

async function generateSkillsAndSummary(
  research: string,
  company: string,
  role: string,
  jobDescription: string
): Promise<{ skills: string[]; summary: string; topic: string }> {
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a technical recruiter analyzing a job opportunity. Return ONLY valid JSON:
{
  "topic": "<short interview focus title e.g. 'Frontend Systems at Stripe'>",
  "summary": "<2-3 sentence summary of what this role requires and what the interview will focus on>",
  "skills": ["skill1", "skill2", ... up to 12 key technical skills]
}`,
      },
      {
        role: "user",
        content: `Company: ${company}\nRole: ${role}\nResearch: ${research}\nJob Description: ${jobDescription || "Not provided"}`,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const raw = res.choices[0].message.content ?? "{}";
  return JSON.parse(raw);
}

export async function POST(req: NextRequest) {
  // Auth
  let user;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized", stage: "auth" }, { status: 401 });
    }
    user = data.user;
  } catch (e) {
    return NextResponse.json({ error: "Auth failed", stage: "auth", detail: String(e) }, { status: 500 });
  }

  let company: string, role: string, jobDescription: string;
  try {
    ({ company, role, jobDescription } = await req.json());
    if (!company || !role) {
      return NextResponse.json({ error: "Company and role required", stage: "input" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body", stage: "input" }, { status: 400 });
  }

  // Step 1: Web research
  let research = "";
  try {
    console.log("[session] researching via compound-beta...");
    const res = await groq.chat.completions.create({
      model: "compound-beta",
      messages: [{
        role: "user",
        content: `Research "${company}" and what it takes to succeed as a "${role}" there.
Cover: tech stack, engineering culture, common interview topics, recent news.
${jobDescription ? `Job Description:\n${jobDescription}` : ""}
Summarize in 4 focused paragraphs for interview prep.`,
      }],
    });
    research = res.choices[0].message.content ?? "";
    console.log("[session] research complete, chars:", research.length);
  } catch (e) {
    console.warn("[session] compound-beta fallback:", String(e));
    research = `${company} is hiring for ${role}. ${jobDescription || "Strong fundamentals, system design, and domain expertise are expected."}`;
  }

  // Step 2: Generate everything in parallel
  console.log("[session] generating questions + skills in parallel...");
  let skillsMeta: { skills: string[]; summary: string; topic: string };
  let t1: Question[], t2: Question[], t3: Question[], t4: Question[];

  try {
    [skillsMeta, t1, t2, t3, t4] = await Promise.all([
      generateSkillsAndSummary(research, company, role, jobDescription),
      generateTierQuestions(1, research, company, role, 15),
      generateTierQuestions(2, research, company, role, 13),
      generateTierQuestions(3, research, company, role, 12),
      generateTierQuestions(4, research, company, role, 10),
    ]);
    console.log("[session] questions generated — totals:", t1.length, t2.length, t3.length, t4.length);
  } catch (e) {
    console.error("[session] generation error:", e);
    return NextResponse.json({ error: "Question generation failed", stage: "questions", detail: String(e) }, { status: 500 });
  }

  const tiers: Record<string, TierData> = {
    "1": { label: "Fundamentals", questions: t1 },
    "2": { label: "Architecture", questions: t2 },
    "3": { label: "Expert Debug", questions: t3 },
    "4": { label: "System Design", questions: t4 },
  };

  // Step 3: Save to Supabase
  try {
    console.log("[session] saving to supabase...");
    const admin = getSupabaseAdmin();
    const { data: session, error: dbError } = await admin
      .from("interview_sessions")
      .insert({
        user_id: user.id,
        topic: skillsMeta.topic ?? `${role} at ${company}`,
        current_tier: 1,
        meta: {
          company,
          role,
          jobDescription,
          research,
          summary: skillsMeta.summary,
          skills: skillsMeta.skills,
          tiers,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error("[session] DB error:", dbError);
      return NextResponse.json({ error: dbError.message, stage: "database", code: dbError.code }, { status: 500 });
    }

    console.log("[session] created:", session.id);
    return NextResponse.json({
      sessionId: session.id,
      topic: skillsMeta.topic,
      summary: skillsMeta.summary,
      skills: skillsMeta.skills,
      tiers,
      company,
      role,
    });
  } catch (e) {
    console.error("[session] db error:", e);
    return NextResponse.json({ error: "Database error", stage: "database", detail: String(e) }, { status: 500 });
  }
}

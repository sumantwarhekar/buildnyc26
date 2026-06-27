import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { calculateFinalScore } from "@/lib/prompts";
import { TurnMetadata } from "@/types/interview";

export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      sessionId: string;
      userId: string;
      topic: string;
      email: string;
      turns: TurnMetadata[];
    };

    const { sessionId, userId, topic, email, turns } = body;

    const finalScore = calculateFinalScore(
      turns.map((t) => ({ technicalScore: t.technicalScore, tier: t.tier, emotion: t.emotion }))
    );

    // Persist to Supabase
    await getSupabaseAdmin()
      .from("interview_sessions")
      .update({ final_score: finalScore, completed_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("user_id", userId);

    // Send email report
    const tierSummary = [1, 2, 3, 4].map((tier) => {
      const tierTurns = turns.filter((t) => t.tier === tier);
      if (!tierTurns.length) return null;
      const avg = Math.round(tierTurns.reduce((s, t) => s + t.technicalScore, 0) / tierTurns.length);
      return { tier, avg, count: tierTurns.length };
    }).filter(Boolean);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Your Skopus AI Interview Report — ${topic}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#171717;padding:24px">
          <h1 style="font-size:24px;font-weight:700;margin-bottom:4px">Skopus AI Interview Report</h1>
          <p style="color:#666;margin-bottom:24px">Topic: <strong>${topic}</strong></p>

          <div style="background:#f4f4f5;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
            <p style="font-size:48px;font-weight:800;margin:0">${finalScore}</p>
            <p style="color:#666;margin:4px 0 0">Overall Score / 100</p>
          </div>

          <h2 style="font-size:16px;font-weight:600;margin-bottom:12px">Tier Breakdown</h2>
          ${tierSummary.map((t) => `
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e4e4e7">
              <span>Tier ${t!.tier} — ${["", "Fundamentals", "Architecture", "Expert Debug", "System Design"][t!.tier]}</span>
              <strong>${t!.avg}/100</strong>
            </div>
          `).join("")}

          <p style="margin-top:24px;color:#666;font-size:13px">
            Keep practicing on Skopus AI to sharpen your skills before the real thing.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, finalScore });
  } catch (error) {
    console.error("[report]", error);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}

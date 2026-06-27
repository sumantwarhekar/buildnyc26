import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { buildSystemPrompt, buildUserPayload } from "@/lib/prompts";
import { EmotionData, InterviewMessage, LLMResponse, Tier } from "@/types/interview";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      topic: string;
      transcript: string;
      emotion: EmotionData;
      currentTier: Tier;
      history: InterviewMessage[];
    };

    const { topic, transcript, emotion, currentTier, history } = body;

    const messages: InterviewMessage[] = [
      { role: "system", content: buildSystemPrompt(topic) },
      ...history,
      { role: "user", content: buildUserPayload(transcript, emotion, currentTier) },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed: LLMResponse = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[interview]", error);
    return NextResponse.json({ error: "Interview evaluation failed" }, { status: 500 });
  }
}

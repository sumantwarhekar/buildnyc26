import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/groq";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File;

    if (!audio) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: "whisper-large-v3",
      response_format: "json",
      language: "en",
    });

    return NextResponse.json({ transcript: transcription.text });
  } catch (error) {
    console.error("[transcribe]", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}

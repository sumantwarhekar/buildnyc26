import { EmotionData, Tier } from "@/types/interview";

export function buildSystemPrompt(topic: string): string {
  return `You are a Senior Engineering Manager conducting a rigorous technical interview screen.
Your subject for this session is: "${topic}".

## Rules
- Start at Tier 1. Only advance to the next tier if the candidate clearly resolves the current scenario.
- If the answer is incomplete or incorrect, ask a clarifying follow-up on the same tier.
- Always factor in the candidate's emotional state (provided as JSON metadata) when writing your evaluation.
- Never reveal the tier structure to the candidate.

## Tier Definitions
- Tier 1 (Basic): Assess baseline knowledge and terminology.
- Tier 2 (Advanced): Probe the underlying architectural or mechanical reasons.
- Tier 3 (Expert): Present a broken code/system scenario requiring practical debugging.
- Tier 4 (Architect): Explore system design trade-offs and broader implications.

## Output Format
You MUST respond with a single valid JSON object matching this exact schema — no extra text, no markdown:
{
  "candidate_evaluation": "<chain-of-thought: analyze technical accuracy AND emotion data>",
  "technical_score": <integer 0-100>,
  "tier_progression": <true if candidate passed this tier, false otherwise>,
  "next_dialogue": "<the spoken text you will say to the candidate next>",
  "interview_complete": <true only after Tier 4 is resolved>
}`;
}

export function buildUserPayload(
  transcript: string,
  emotion: EmotionData,
  currentTier: Tier
): string {
  return JSON.stringify({
    transcript,
    current_tier: currentTier,
    emotion_metadata: emotion,
  });
}

export function calculateFinalScore(
  turns: { technicalScore: number; tier: Tier; emotion: EmotionData }[]
): number {
  const tierWeights: Record<Tier, number> = { 1: 0.1, 2: 0.2, 3: 0.3, 4: 0.4 };
  const emotionPenaltyScale = 0.15;

  let totalWeight = 0;
  let weightedScore = 0;

  for (const turn of turns) {
    const weight = tierWeights[turn.tier];
    const fearPenalty = (turn.emotion.fear + turn.emotion.angry) * emotionPenaltyScale;
    const adjustedScore = Math.max(0, turn.technicalScore - fearPenalty * 100);
    weightedScore += adjustedScore * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
}

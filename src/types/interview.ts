export type Tier = 1 | 2 | 3 | 4;

export interface EmotionData {
  happy: number;
  neutral: number;
  sad: number;
  angry: number;
  fear: number;
  surprise: number;
  disgust: number;
}

export interface TurnMetadata {
  turnIndex: number;
  tier: Tier;
  transcript: string;
  emotion: EmotionData;
  technicalScore: number;
  tierProgression: boolean;
  candidateEvaluation: string;
  interviewerDialogue: string;
}

export interface LLMResponse {
  candidate_evaluation: string;
  technical_score: number;
  tier_progression: boolean;
  next_dialogue: string;
  interview_complete: boolean;
}

export interface InterviewSession {
  id: string;
  userId: string;
  topic: string;
  currentTier: Tier;
  turns: TurnMetadata[];
  finalScore: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface InterviewMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

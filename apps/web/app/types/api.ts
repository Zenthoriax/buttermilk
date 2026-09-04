// ============================================================
// OUTCOGNITO API TYPES
// Mirrors backend response shapes from services/backend/index.mjs
// ============================================================

export type EventCategory =
  | "development"
  | "ai"
  | "social"
  | "entertainment"
  | "productivity"
  | "shopping"
  | "general";

export type AICharacter =
  | "certified_hater"
  | "glazer3000"
  | "chronicallyonline"
  | "society_aunty"
  | "detective"
  | "linkedin_sigma"
  | "maincharacter";

export interface AIComment {
  id: string;
  character: AICharacter;
  text: string;
  replyTo: string | null;
  memeQuery: string | null;
}

export interface Post {
  postId: string;
  userId: string;
  username: string;
  eventId: string;
  category: EventCategory;
  eventType: string;
  postText: string;
  comments: AIComment[];
  roastability: number;
  createdAt: string;
}

export interface UserProfile {
  username: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface MeResponse {
  authenticated: boolean;
  userId: string;
  profile: UserProfile | null;
  profileExists?: boolean;
}

export interface OutcognitoEvent {
  eventId: string;
  category: EventCategory;
  eventType: string;
  description: string;
  stats?: {
    occurrence?: number;
    durationSeconds?: number;
    count?: number;
  };
  roastability: number;
  privacyLevel: "safe";
  timestamp: string;
}

export type CharacterId =
  | "certified_hater"
  | "glazer3000"
  | "chronicallyonline"
  | "society_aunty"
  | "detective"
  | "linkedin_sigma"
  | "maincharacter";

export type Meme = {
  id: string;
  filename: string;
  displayName: string;
  url: string;
  score: number;
  reactionType: string;
  intensity: number;
};

export type AIComment = {
  id: string;
  character: CharacterId;
  text: string;
  replyTo: string | null;
  memeQuery: string | null;
  meme: Meme | null;
};

export type FeedPost = {
  postId: string;
  userId: string;
  username: string;
  eventId: string;
  category: string;
  eventType: string;
  postText: string;
  comments: AIComment[];
  roastability: number;
  createdAt: string;
};

export type FeedResponse = {
  posts: FeedPost[];
  count: number;
};
// We define the EventCategory type here locally for the extension to use.
// This must strictly match the Zod schema contract from Phase 0.
export type EventCategory =
  | "development"
  | "ai"
  | "social"
  | "entertainment"
  | "productivity"
  | "shopping"
  | "general";

const DOMAIN_CATEGORY_MAP: Record<string, EventCategory> = {
  // Development
  "github.com": "development",
  "stackoverflow.com": "development",
  "gitlab.com": "development",
  "vercel.com": "development",

  // AI
  "chatgpt.com": "ai",
  "claude.ai": "ai",
  "gemini.google.com": "ai",
  "huggingface.co": "ai",

  // Social
  "instagram.com": "social",
  "reddit.com": "social",
  "twitter.com": "social",
  "x.com": "social",
  "facebook.com": "social",
  "linkedin.com": "social",

  // Entertainment
  "youtube.com": "entertainment",
  "netflix.com": "entertainment",
  "twitch.tv": "entertainment",
  "hulu.com": "entertainment",
  "disneyplus.com": "entertainment",
  "hotstar.com": "entertainment",

  // Productivity
  "notion.so": "productivity",
  "docs.google.com": "productivity",
  "trello.com": "productivity",

  // Shopping
  "amazon.com": "shopping",
  "flipkart.com": "shopping",
};

/**
 * Returns the broad behavioral category for a given hostname.
 * Falls back to "general" if the domain is not explicitly mapped.
 */
export function categorizeDomain(hostname: string): EventCategory {
  return DOMAIN_CATEGORY_MAP[hostname] || "general";
}
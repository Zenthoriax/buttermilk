import type {
  EventCategory,
} from "../../../../packages/event-schema/src/index";

const DOMAIN_CATEGORY_MAP:
  Record<
    string,
    EventCategory
  > = {

  // ==========================================================
  // DEVELOPMENT
  // ==========================================================

  "github.com":
    "development",

  "stackoverflow.com":
    "development",

  "gitlab.com":
    "development",

  "vercel.com":
    "development",

  "npmjs.com":
    "development",

  "developer.mozilla.org":
    "development",

  // ==========================================================
  // AI
  // ==========================================================

  "chatgpt.com":
    "ai",

  "claude.ai":
    "ai",

  "gemini.google.com":
    "ai",

  "perplexity.ai":
    "ai",

  "huggingface.co":
    "ai",

  // ==========================================================
  // SOCIAL
  // ==========================================================

  "instagram.com":
    "social",

  "reddit.com":
    "social",

  "twitter.com":
    "social",

  "x.com":
    "social",

  "facebook.com":
    "social",

  "linkedin.com":
    "social",

  // ==========================================================
  // ENTERTAINMENT
  // ==========================================================

  "youtube.com":
    "entertainment",

  "netflix.com":
    "entertainment",

  "twitch.tv":
    "entertainment",

  "hulu.com":
    "entertainment",

  "disneyplus.com":
    "entertainment",

  "hotstar.com":
    "entertainment",

  // ==========================================================
  // PRODUCTIVITY
  // ==========================================================

  "notion.so":
    "productivity",

  "docs.google.com":
    "productivity",

  "trello.com":
    "productivity",

  "figma.com":
    "productivity",

  // ==========================================================
  // SHOPPING
  // ==========================================================

  "amazon.com":
    "shopping",

  "amazon.in":
    "shopping",

  "flipkart.com":
    "shopping",
};

export function categorizeDomain(
  hostname:
    string
): EventCategory {

  for (
    const [
      domain,
      category,
    ]
    of Object.entries(
      DOMAIN_CATEGORY_MAP
    )
  ) {

    if (
      hostname ===
        domain ||

      hostname.endsWith(
        `.${domain}`
      )
    ) {

      return category;
    }
  }


  return "general";
}
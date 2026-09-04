import { z } from "zod";

export const OutcognitoEventSchema = z.object({
  eventId: z.string(),
  category: z.enum([
    "development",
    "ai",
    "social",
    "entertainment",
    "productivity",
    "shopping",
    "general",
  ]),
  eventType: z.string(),
  description: z.string(),
  stats: z
    .object({
      occurrence: z.number().optional(),
      durationSeconds: z.number().optional(),
      count: z.number().optional(),
    })
    .optional(),
  roastability: z.number().min(0).max(1),
  privacyLevel: z.literal("safe"),
  timestamp: z.string(),
});

export type OutcognitoEvent = z.infer<typeof OutcognitoEventSchema>;
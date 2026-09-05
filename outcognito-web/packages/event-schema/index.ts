import { z } from "zod";

export const OutcognitoEventSchema = z.object({
  eventId: z
    .string()
    .min(1)
    .max(128),

  category: z.enum([
    "development",
    "ai",
    "social",
    "entertainment",
    "productivity",
    "shopping",
    "general",
  ]),

  eventType: z
    .string()
    .min(1)
    .max(100),

  description: z
    .string()
    .min(1)
    .max(500),

  stats: z
    .object({
      occurrence: z
        .number()
        .int()
        .nonnegative()
        .optional(),

      durationSeconds: z
        .number()
        .nonnegative()
        .optional(),

      count: z
        .number()
        .int()
        .nonnegative()
        .optional(),
    })
    .optional(),

  roastability: z
    .number()
    .min(0)
    .max(1),

  privacyLevel: z.literal("safe"),

  timestamp: z
    .string()
    .datetime(),
});

export type OutcognitoEvent =
  z.infer<typeof OutcognitoEventSchema>;
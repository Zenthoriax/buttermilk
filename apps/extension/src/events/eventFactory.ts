import { OutcognitoEvent } from "../../../../packages/event-schema/src/index";

export function createReturnEvent(domain: string, category: string, occurrenceCount: number, timeWindowSeconds: number, roastScore: number): OutcognitoEvent {
  return {
    eventId: `evt_${crypto.randomUUID().slice(0, 8)}`,
    category: category as any, // Casts the string to fit your strict Zod enum
    eventType: "rapid_return",
    description: `User returned to ${domain} ${occurrenceCount} times in the last ${timeWindowSeconds / 60} minutes.`,
    stats: {
      occurrence: occurrenceCount,
      durationSeconds: timeWindowSeconds
    },
    roastability: parseFloat(roastScore.toFixed(2)),
    privacyLevel: "safe",
    timestamp: new Date().toISOString()
  };
}
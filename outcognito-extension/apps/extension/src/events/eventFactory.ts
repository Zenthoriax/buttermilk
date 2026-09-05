import {
  EventCategory,
  OutcognitoEvent,
} from "../../../../packages/event-schema/src/index";

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

export interface CreateEventInput {
  category:
    EventCategory;

  eventType:
    string;

  description:
    string;

  stats?: {
    occurrence?: number;
    durationSeconds?: number;
    count?: number;
  };

  roastability:
    number;
}

// ============================================================
// GENERIC EVENT FACTORY
// ============================================================

export function createOutcognitoEvent(
  input: CreateEventInput
): OutcognitoEvent {

  return {
    eventId:
      `evt_${Date.now()}_${crypto
        .randomUUID()
        .slice(0, 8)}`,

    category:
      input.category,

    eventType:
      input.eventType
        .slice(0, 100),

    description:
      input.description
        .slice(0, 500),

    ...(input.stats
      ? {
          stats:
            input.stats,
        }
      : {}),

    roastability:
      Number(
        clamp(
          input.roastability,
          0,
          1
        ).toFixed(2)
      ),

    privacyLevel:
      "safe",

    timestamp:
      new Date()
        .toISOString(),
  };
}

// ============================================================
// QUICK RETURN
// ============================================================

export function createQuickReturnEvent(
  category: EventCategory,
  secondsAway: number,
  occurrenceCount: number
): OutcognitoEvent {

  const label =
    category === "ai"
      ? "an AI assistant"
      : `a ${category} site`;


  const roastability =
    clamp(
      0.7 +
        (category === "ai"
          ? 0.1
          : 0) +
        Math.min(
          occurrenceCount * 0.02,
          0.1
        ) +
        (secondsAway <= 30
          ? 0.06
          : 0),
      0,
      0.96
    );


  return createOutcognitoEvent({
    category,

    eventType:
      category === "ai"
        ? "ai_return"
        : "quick_return",

    description:
      `User returned to ${label} only ${secondsAway} seconds after leaving.`,

    stats: {
      occurrence:
        occurrenceCount,

      durationSeconds:
        secondsAway,
    },

    roastability,
  });
}

// ============================================================
// REPEATED VISITS
// ============================================================

export function createRepeatedVisitEvent(
  category: EventCategory,
  count: number,
  windowMinutes: number
): OutcognitoEvent {

  const roastability =
    clamp(
      0.65 +
        Math.max(
          0,
          count - 5
        ) *
          0.05,
      0,
      0.95
    );


  return createOutcognitoEvent({
    category,

    eventType:
      "repeated_visits",

    description:
      `User returned to ${category} activity ${count} times within ${windowMinutes} minutes.`,

    stats: {
      occurrence:
        count,

      durationSeconds:
        windowMinutes *
        60,
    },

    roastability,
  });
}

// ============================================================
// RAPID SWITCHING
// ============================================================

export function createRapidSwitchEvent(
  switchCount: number,
  windowSeconds: number
): OutcognitoEvent {

  const roastability =
    clamp(
      0.68 +
        Math.max(
          0,
          switchCount - 6
        ) *
          0.035,
      0,
      0.95
    );


  return createOutcognitoEvent({
    category:
      "general",

    eventType:
      "rapid_switching",

    description:
      `User switched between browser activity categories ${switchCount} times within ${Math.round(
        windowSeconds /
          60
      )} minutes.`,

    stats: {
      count:
        switchCount,

      durationSeconds:
        windowSeconds,
    },

    roastability,
  });
}
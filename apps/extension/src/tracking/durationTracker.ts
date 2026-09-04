import { getSession, setSession, getDailyStats, setDailyStats } from "../storage/storage";
import { logValidatedEvent } from "../events/eventLogger";

/**
 * Calculates the time elapsed since the current tab was focused,
 * adds it to the daily statistics, and clears the active timer.
 */
export async function finalizeDuration() {
  const session = await getSession();

  // If we don't have a valid start time or domain, there's nothing to finalize
  if (!session.tabStartedAt || !session.currentDomain || !session.currentCategory) {
    return;
  }

  const now = Date.now();
  const durationSeconds = Math.floor((now - session.tabStartedAt) / 1000);

  // Clear the start time immediately so we don't double-count this block of time
  await setSession({ tabStartedAt: undefined });

  // Sanity check: prevent absurd values (e.g., if the browser was closed but suspended)
  // Max realistic single continuous session without idle/blur = 8 hours (28800 seconds)
  if (durationSeconds <= 0 || durationSeconds > 28800) {
    return;
  }

  const stats = await getDailyStats();

  // Ensure our record objects exist
  const domainsVisited = stats.domainsVisited || {};
  const categorySeconds = stats.categorySeconds || {};

  // Add the new duration to our existing totals
  domainsVisited[session.currentDomain] = (domainsVisited[session.currentDomain] || 0) + durationSeconds;
  categorySeconds[session.currentCategory] = (categorySeconds[session.currentCategory] || 0) + durationSeconds;

  // Save the updated stats back to storage
  await setDailyStats({
    activeSeconds: stats.activeSeconds + durationSeconds,
    domainsVisited,
    categorySeconds,
  });

  console.log(`[DurationTracker] Logged ${durationSeconds}s for ${session.currentDomain} (${session.currentCategory})`);

  // --- NEW: Construct and validate the strict event schema ---
  const rawEvent = {
    eventId: crypto.randomUUID(),
    category: session.currentCategory,
    eventType: "duration_logged",
    description: `User spent ${durationSeconds} seconds on ${session.currentDomain}.`,
    stats: {
      durationSeconds: durationSeconds,
    },
    roastability: 0.1, // Default baseline for now
    privacyLevel: "safe",
    timestamp: new Date().toISOString(),
  };

  // Pass it to our bouncer to validate against the Zod schema
  await logValidatedEvent(rawEvent);
}

/**
 * Starts the timer for the currently active tab.
 */
/**
 * Starts the timer for the currently active tab, but ONLY if Chrome is in focus.
 */
export async function startDuration() {
  const session = await getSession();
  
  // The Ghost Time Killer: Do not start the clock if Chrome is in the background
  if (session.browserFocused === false) {
    console.log("[DurationTracker] Blocked start: Chrome is not in focus.");
    return;
  }

  await setSession({ tabStartedAt: Date.now() });
  console.log("[DurationTracker] Timing started");
}
import { getSession, setSession, getDailyStats, setDailyStats } from "../storage/storage";

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
}

/**
 * Starts the timer for the currently active tab.
 */
export async function startDuration() {
  await setSession({ tabStartedAt: Date.now() });
  console.log("[DurationTracker] Timing started");
}
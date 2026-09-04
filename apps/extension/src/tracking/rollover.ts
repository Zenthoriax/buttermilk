import { getDailyStats, setDailyStats } from "../storage/storage";
import { DEFAULT_DAILY_STATS } from "../storage/defaults";

/**
 * Checks if the stored daily stats belong to a previous day.
 * If so, resets the daily stats to zero for the new day.
 */
export async function checkAndResetDailyStats() {
  const stats = await getDailyStats();
  
  // Get current local date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  if (stats.date !== today) {
    // A new day has started. Reset the stats, but stamp it with today's date.
    await setDailyStats({
      ...DEFAULT_DAILY_STATS,
      date: today,
    });
    console.log(`[Rollover] Midnight crossed. Daily stats reset for ${today}.`);
  }
}
import { processUrlThroughFirewall } from "../privacy/firewall";
import { categorizeDomain } from "./domainCategories";
import { getSession, setSession, pushRecentSignal, getDailyStats, setDailyStats } from "../storage/storage";
import { finalizeDuration, startDuration } from "./durationTracker";
import { analyzePatterns } from "../patterns/patternEngine"; // Updated import

export async function handleTabChange(rawUrl: string | undefined) {
  const safeHostname = await processUrlThroughFirewall(rawUrl);
  const session = await getSession();

  // If the user is navigating within the exact same allowed domain, keep the current timer running
  if (safeHostname && session.currentDomain === safeHostname) {
    return;
  }

  // Otherwise, we are leaving the current domain. Finalize its duration.
  await finalizeDuration();

  // If the new URL is blocked or tracking is paused, clear the session and stop tracking
  if (!safeHostname) {
    await setSession({ currentDomain: undefined, currentCategory: undefined });
    return;
  }

  const category = categorizeDomain(safeHostname);
  const now = new Date().toISOString();

  const dailyStats = await getDailyStats();
  
  // Check if this is an AI visit
  const aiIncrement = category === "ai" ? 1 : 0;

  await setDailyStats({ 
    tabSwitches: dailyStats.tabSwitches + 1,
    aiVisits: dailyStats.aiVisits + aiIncrement 
  });

  await setSession({
    currentDomain: safeHostname,
    currentCategory: category,
  });

  await pushRecentSignal({
    type: "tab_switch",
    domain: safeHostname,
    category: category,
    timestamp: now,
  });

  // Start the clock for the new domain
  await startDuration();

  // --- NEW: Trigger Universal Pattern Analysis ---
  await analyzePatterns(safeHostname, category);

  console.log(`[TabTracker] Tracked safe switch to: ${safeHostname} (${category})`);
}

export function initTabTracking() {
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      await handleTabChange(tab.url);
    } catch (error) {}
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.active) {
      await handleTabChange(changeInfo.url);
    }
  });
}
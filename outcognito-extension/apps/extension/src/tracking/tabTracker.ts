import { processUrlThroughFirewall } from "../privacy/firewall";
import { categorizeDomain } from "./domainCategories";
import { getSession, setSession, pushRecentSignal, getDailyStats, setDailyStats } from "../storage/storage";
import { finalizeDuration, startDuration } from "./durationTracker";
import { analyzePatterns } from "../patterns/patternEngine";

// NEW: The Mutex Lock to prevent Chrome from double-firing events
let isProcessing = false;

export async function handleTabChange(rawUrl: string | undefined) {
  if (isProcessing) return;
  isProcessing = true; // Lock the gates

  try {
    const safeHostname = await processUrlThroughFirewall(rawUrl);
    const session = await getSession();

    if (safeHostname && session.currentDomain === safeHostname) {
      return;
    }

    await finalizeDuration();

    if (!safeHostname) {
      await setSession({ currentDomain: undefined, currentCategory: undefined });
      return;
    }

    const category = categorizeDomain(safeHostname);
    const now = new Date().toISOString();
    const dailyStats = await getDailyStats();
    
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

    await startDuration();
    await analyzePatterns(safeHostname, category);

    console.log(`[TabTracker] Tracked safe switch to: ${safeHostname} (${category})`);
  } finally {
    // Keep the gates locked for 100ms to absorb duplicate Chrome events
    setTimeout(() => {
      isProcessing = false;
    }, 100);
  }
}

// RESTORED: The missing initialization function!
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
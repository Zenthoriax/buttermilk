import { processUrlThroughFirewall } from "../privacy/firewall";
import { categorizeDomain } from "./domainCategories";
import { getSession, setSession, pushRecentSignal, getDailyStats, setDailyStats } from "../storage/storage";

export async function handleTabChange(rawUrl: string | undefined) {
  // 1. Pass the URL through the Privacy Firewall
  const safeHostname = await processUrlThroughFirewall(rawUrl);
  if (!safeHostname) {
    return; // Stop processing if the domain is sensitive, invalid, or tracking is paused
  }

  // 2. Load the current session state
  const session = await getSession();

  // 3. Ignore if the user is just reloading the same domain
  if (session.currentDomain === safeHostname) {
    return;
  }

  // 4. Categorize the new domain
  const category = categorizeDomain(safeHostname);
  const now = new Date().toISOString();

  // 5. Increment our daily aggregate tab switch counter
  const dailyStats = await getDailyStats();
  await setDailyStats({ tabSwitches: dailyStats.tabSwitches + 1 });

  // 6. Update the session checkpoint
  await setSession({
    currentDomain: safeHostname,
    currentCategory: category,
  });

  // 7. Append a safe signal to our ring buffer
  await pushRecentSignal({
    type: "tab_switch",
    domain: safeHostname,
    category: category,
    timestamp: now,
  });

  console.log(`[TabTracker] Tracked safe switch to: ${safeHostname} (${category})`);
}

export function initTabTracking() {
  // Listen for the user switching between already-open tabs
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      await handleTabChange(tab.url);
    } catch (error) {
      // Failsafe: Tab might have closed immediately after activation
    }
  });

  // Listen for the user navigating to a new URL within the current tab
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.active) {
      await handleTabChange(changeInfo.url);
    }
  });
}
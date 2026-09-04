import { getSettings, pushRecentSignal } from "../storage/storage";

console.log(`[Outcognito] service worker booted at ${new Date().toISOString()}`);

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`[Outcognito] onInstalled fired, reason: ${details.reason}`);

  // 1. Test reading settings (this will return default settings if storage is empty)
  const settings = await getSettings();
  console.log("[Outcognito] Current settings:", settings);

  // 2. Test pushing a signal to the ring buffer
  await pushRecentSignal({
    type: "domain_enter",
    domain: "outcognito.com",
    category: "general",
    timestamp: new Date().toISOString(),
  });
  console.log("[Outcognito] Test signal pushed to recentSignals ring buffer.");
});
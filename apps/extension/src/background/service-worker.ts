import { initTabTracking } from "../tracking/tabTracker";
import { initWindowTracking } from "../tracking/windowTracker";
import { initIdleTracking } from "../tracking/idleTracker";
import { checkAndResetDailyStats } from "../tracking/rollover";
import { initLocalAPI } from "../api/messageHandler";
import { initCloudSync, syncEventsToCloud } from "../api/cloudSync";
import { logValidatedEvent } from "../events/eventLogger";

console.log(`[Outcognito] service worker booted at ${new Date().toISOString()}`);

// Initialize our tracking listeners
initTabTracking();
initWindowTracking();
initIdleTracking();
// Boot up the Local API
initLocalAPI();

// 1. Check for midnight rollover immediately when the worker wakes up
checkAndResetDailyStats();
// Boot up the automated Cloud Sync
initCloudSync();

// Optional: Add a debug listener so you can trigger a sync manually from the console
//chrome.runtime.onMessage.addListener((message) => {
//  if (message.type === "FORCE_SYNC") {
//    syncEventsToCloud();
//  }
//});

// 2. Schedule an alarm to wake the worker periodically to check for rollover
chrome.alarms.create("rollover_check", { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "rollover_check") {
    await checkAndResetDailyStats();
  }
});

// When the user clicks the extension icon in the toolbar, toggle the glass UI
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_DASHBOARD" }).catch(() => {
      console.log("[Outcognito] Could not toggle dashboard on this specific page (might be a restricted chrome:// page).");
    });
  }
});
// Expose the logger to the DevTools console for testing
(globalThis as any).testBouncer = logValidatedEvent;
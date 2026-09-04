import { initTabTracking } from "../tracking/tabTracker";
import { initWindowTracking } from "../tracking/windowTracker";
import { initIdleTracking } from "../tracking/idleTracker";
import { checkAndResetDailyStats } from "../tracking/rollover";

console.log(`[Outcognito] service worker booted at ${new Date().toISOString()}`);

// Initialize our tracking listeners
initTabTracking();
initWindowTracking();
initIdleTracking();

// 1. Check for midnight rollover immediately when the worker wakes up
checkAndResetDailyStats();

// 2. Schedule an alarm to wake the worker periodically to check for rollover
chrome.alarms.create("rollover_check", { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "rollover_check") {
    await checkAndResetDailyStats();
  }
});
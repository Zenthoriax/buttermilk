import { setSession } from "../storage/storage";

export function initIdleTracking() {
  // Set threshold to 60 seconds (the minimum allowed by Chrome)
  chrome.idle.setDetectionInterval(60);

  chrome.idle.onStateChanged.addListener(async (newState) => {
    console.log(`[IdleTracker] State changed to: ${newState}`);

    if (newState === "idle" || newState === "locked") {
      // User is away or machine is locked
      await setSession({ userIdle: true });
    } else if (newState === "active") {
      // User returned and is actively interacting with the machine
      await setSession({ userIdle: false });
    }
  });
}
import { setSession } from "../storage/storage";
import { finalizeDuration, startDuration } from "./durationTracker";

export function initIdleTracking() {
  chrome.idle.setDetectionInterval(60);

  chrome.idle.onStateChanged.addListener(async (newState) => {
    console.log(`[IdleTracker] State changed to: ${newState}`);

    if (newState === "idle" || newState === "locked") {
      // User walked away. Stop the clock.
      await finalizeDuration();
      await setSession({ userIdle: true });
    } else if (newState === "active") {
      // User returned. Restart the clock.
      await setSession({ userIdle: false });
      await startDuration();
    }
  });
}
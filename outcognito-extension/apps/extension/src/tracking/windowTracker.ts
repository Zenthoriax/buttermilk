import { pushRecentSignal, setSession } from "../storage/storage";
import { finalizeDuration, startDuration } from "./durationTracker";

export function initWindowTracking() {
  chrome.windows.onFocusChanged.addListener(async (windowId) => {
    const now = new Date().toISOString();

    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      // 1. Instantly lock the state FIRST so no background tabs can start the timer
      await setSession({ browserFocused: false });
      
      // 2. Now it is safe to finalize the current duration
      await finalizeDuration();
      
      await pushRecentSignal({
        type: "window_blur",
        timestamp: now,
      });
      
      console.log("[WindowTracker] Chrome lost focus. Timer locked.");
    } else {
      // Chrome regained focus. Unlock and resume timing.
      await setSession({ browserFocused: true });
      await startDuration();
      
      await pushRecentSignal({
        type: "window_focus",
        timestamp: now,
      });
      
      console.log("[WindowTracker] Chrome regained focus. Timer unlocked.");
    }
  });
}
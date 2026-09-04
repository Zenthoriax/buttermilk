import { pushRecentSignal, setSession } from "../storage/storage";
import { finalizeDuration, startDuration } from "./durationTracker";

export function initWindowTracking() {
  chrome.windows.onFocusChanged.addListener(async (windowId) => {
    const now = new Date().toISOString();

    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      // Chrome lost focus. Finalize current duration so we don't over-count.
      await finalizeDuration();
      await setSession({ browserFocused: false });
      
      await pushRecentSignal({
        type: "window_blur",
        timestamp: now,
      });
      
      console.log("[WindowTracker] Chrome lost focus");
    } else {
      // Chrome regained focus. Resume timing.
      await setSession({ browserFocused: true });
      await startDuration();
      
      await pushRecentSignal({
        type: "window_focus",
        timestamp: now,
      });
      
      console.log("[WindowTracker] Chrome regained focus");
    }
  });
}
import { pushRecentSignal, setSession } from "../storage/storage";

export function initWindowTracking() {
  chrome.windows.onFocusChanged.addListener(async (windowId) => {
    const now = new Date().toISOString();

    // WINDOW_ID_NONE means Chrome has completely lost focus to another OS application
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      await setSession({ browserFocused: false });
      
      await pushRecentSignal({
        type: "window_blur",
        timestamp: now,
      });
      
      console.log("[WindowTracker] Chrome lost focus");
    } else {
      // Chrome has regained focus
      await setSession({ browserFocused: true });
      
      await pushRecentSignal({
        type: "window_focus",
        timestamp: now,
      });
      
      console.log("[WindowTracker] Chrome regained focus");
    }
  });
}
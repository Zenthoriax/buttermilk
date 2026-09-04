import { initTabTracking } from "../tracking/tabTracker";
import { initWindowTracking } from "../tracking/windowTracker";
import { initIdleTracking } from "../tracking/idleTracker";

console.log(`[Outcognito] service worker booted at ${new Date().toISOString()}`);

// Initialize our tracking listeners
initTabTracking();
initWindowTracking();
initIdleTracking();
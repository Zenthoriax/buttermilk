import { initTabTracking } from "../tracking/tabTracker";

console.log(`[Outcognito] service worker booted at ${new Date().toISOString()}`);

// Initialize our tracking listeners
initTabTracking();
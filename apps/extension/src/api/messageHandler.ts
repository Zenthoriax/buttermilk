import { getDailyStats } from "../storage/storage";
import { syncEventsToCloud } from "./cloudSync";

export function initLocalAPI() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Endpoint 1: Fetch Daily Stats
    if (message.type === "GET_DAILY_STATS") {
      getDailyStats().then(stats => sendResponse({ success: true, data: stats }));
      return true; // Tells Chrome we will send the response asynchronously
    }

    // Endpoint 2: Fetch Event Ledger
    if (message.type === "GET_EVENT_LOG") {
      chrome.storage.local.get({ eventLog: [] }).then(storage => {
        sendResponse({ success: true, data: storage.eventLog });
      });
      return true;
    }
    // Endpoint 3: Force Cloud Sync
    if (message.type === "FORCE_SYNC") {
      syncEventsToCloud().then(() => sendResponse({ success: true, message: "Sync complete" }));
      return true; 
    }

    // Handle unknown endpoints
    sendResponse({ success: false, error: "Unknown API endpoint" });
    return false;
  });
  
  console.log("[Local API] Endpoints initialized and listening.");
}
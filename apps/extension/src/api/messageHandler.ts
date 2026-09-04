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

export function initExternalAPI() {
  const ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://outcognito.com",
  ];

  chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    const origin = sender.origin || "";
    const isAllowed = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));

    if (!isAllowed) {
      console.warn(`[External API] Rejected message from origin: ${origin}`);
      sendResponse({ success: false, error: "Unauthorized origin" });
      return true;
    }

    if (message.type === "PAIR") {
      const { token } = message;
      if (!token) {
        sendResponse({ success: false, error: "No access token provided" });
        return true;
      }

      chrome.storage.local
        .set({ authToken: token, pairedAt: new Date().toISOString() })
        .then(() => {
          console.log("🔗 [External API] Extension successfully paired with user token!");
          sendResponse({ success: true, message: "Paired successfully" });
        })
        .catch((err) => {
          console.error("🚨 [External API] Error saving pair token:", err);
          sendResponse({ success: false, error: err.message });
        });

      return true;
    }

    sendResponse({ success: false, error: "Unknown external message type" });
    return true;
  });

  console.log("[External API] Web pairing listener initialized.");
}
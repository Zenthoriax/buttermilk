import { OutcognitoEvent } from "../../../../packages/event-schema/src/index";

export async function syncEventsToCloud() {
  try {
    const storage = await chrome.storage.local.get({ eventLog: [] });
    const events: OutcognitoEvent[] = storage.eventLog;

    if (events.length === 0) {
      console.log("☁️ [Cloud Sync] No new events to sync.");
      return;
    }

    console.log(`☁️ [Cloud Sync] Attempting to sync ${events.length} events...`);

    // --- FUTURE CLOUD API CALL GOES HERE ---
    // Example: await fetch("https://api.outcognito.com/ingest", { method: "POST", body: JSON.stringify(events) });
    // For now, we simulate a successful 500ms network request:
    await new Promise(resolve => setTimeout(resolve, 500));

    // Upon successful sync, clear the local log so we don't upload duplicates next time
    await chrome.storage.local.set({ eventLog: [] });
    
    console.log("☁️ [Cloud Sync] ✅ Successfully synced and cleared local ledger.");
  } catch (error) {
    console.error("☁️ [Cloud Sync] 🚨 Sync failed. Keeping events locally.", error);
  }
}

export function initCloudSync() {
  // Set an alarm to trigger the sync every 15 minutes
  chrome.alarms.create("cloud_sync_alarm", { periodInMinutes: 15 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "cloud_sync_alarm") {
      syncEventsToCloud();
    }
  });

  console.log("[Cloud Sync] Automated sync initialized (15m interval).");
}
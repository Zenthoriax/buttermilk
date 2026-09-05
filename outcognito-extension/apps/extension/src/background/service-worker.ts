import {
  initTabTracking,
} from "../tracking/tabTracker";

import {
  initWindowTracking,
} from "../tracking/windowTracker";

import {
  initIdleTracking,
} from "../tracking/idleTracker";

import {
  checkAndResetDailyStats,
} from "../tracking/rollover";

import {
  initLocalAPI,
} from "../api/messageHandler";

import {
  initCloudSync,
  sendOutcognitoEvent,
} from "../api/cloudSync";

import {
  createOutcognitoEvent,
} from "../events/eventFactory";


console.log(
  `[Outcognito] Service worker booted at ${new Date().toISOString()}`
);


// ============================================================
// CORE SYSTEMS
// ============================================================

initTabTracking();

initWindowTracking();

initIdleTracking();

initLocalAPI();

initCloudSync();


// ============================================================
// DAILY ROLLOVER
// ============================================================

void checkAndResetDailyStats();


chrome.alarms.create(
  "rollover_check",
  {
    periodInMinutes:
      60,
  }
);


chrome.alarms
  .onAlarm
  .addListener(
    async alarm => {

      if (
        alarm.name ===
        "rollover_check"
      ) {

        await checkAndResetDailyStats();
      }
    }
  );


// ============================================================
// EXTENSION ICON
//
// We are not currently injecting the old dashboard content
// script. Open settings instead.
// ============================================================

chrome.action
  .onClicked
  .addListener(
    () => {

      void chrome.runtime
        .openOptionsPage();
    }
  );


// ============================================================
// DEVELOPMENT TEST
//
// Open:
// chrome://extensions
// → Outcognito
// → Service worker
// → Inspect
//
// Then run:
// outcognitoTestEvent()
// ============================================================

(
  globalThis as any
).outcognitoTestEvent =
  async () => {

    const event =
      createOutcognitoEvent({
        category:
          "ai",

        eventType:
          "ai_return",

        description:
          "User returned to an AI assistant only 47 seconds after leaving.",

        stats: {
          occurrence:
            3,

          durationSeconds:
            47,
        },

        roastability:
          0.94,
      });


    console.log(
      "[Outcognito] Sending manual integration test..."
    );


    const result =
      await sendOutcognitoEvent(
        event
      );


    console.log(
      "[Outcognito] Test result:",
      result
    );


    return result;
  };


console.log(
  "[Outcognito] Initialization complete."
);
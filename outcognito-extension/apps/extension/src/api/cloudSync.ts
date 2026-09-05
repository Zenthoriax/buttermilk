import {
  OutcognitoEvent,
} from "../../../../packages/event-schema/src/index";

import {
  getAuth,
  setAuth,
} from "../storage/storage";

export interface CloudSendResult {
  ok: boolean;
  status?: number;
  body?: any;
  reason?: string;
}

// ============================================================
// SEND ONE EVENT
// ============================================================

export async function sendOutcognitoEvent(
  event: OutcognitoEvent
): Promise<CloudSendResult> {

  const auth =
    await getAuth();


  if (
    !auth.accessToken ||
    !auth.apiBaseUrl
  ) {

    console.warn(
      "[Outcognito] Extension is not paired."
    );

    return {
      ok: false,
      reason:
        "not_paired",
    };
  }


  const apiBaseUrl =
    auth.apiBaseUrl
      .replace(/\/$/, "");


  try {

    const response =
      await fetch(
        `${apiBaseUrl}/events`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${auth.accessToken}`,
          },

          body:
            JSON.stringify(
              event
            ),
        }
      );


    let body: any =
      null;


    try {

      body =
        await response.json();

    } catch {
      body = null;
    }


    // --------------------------------------------------------
    // TOKEN EXPIRED
    // --------------------------------------------------------

    if (
      response.status === 401
    ) {

      await setAuth({
        needsRepair: true,
      });


      console.warn(
        "[Outcognito] Cognito session expired. Re-pair extension."
      );


      return {
        ok: false,
        status:
          response.status,

        body,

        reason:
          "auth_expired",
      };
    }


    // --------------------------------------------------------
    // BACKEND REJECTED EVENT
    // --------------------------------------------------------

    if (
      !response.ok
    ) {

      console.error(
        "[Outcognito] Backend rejected event:",
        response.status,
        body
      );


      return {
        ok: false,

        status:
          response.status,

        body,

        reason:
          "http_error",
      };
    }


    await setAuth({
      needsRepair: false,
    });


    console.log(
      "[Outcognito] Event accepted:",
      {
        eventId:
          event.eventId,

        status:
          response.status,

        publishEligible:
          body?.publishEligible,

        aiStatus:
          body?.aiStatus,

        postCreated:
          body?.postCreated,

        postId:
          body?.postId,
      }
    );


    return {
      ok: true,
      status:
        response.status,
      body,
    };

  } catch (
    error
  ) {

    console.error(
      "[Outcognito] Network request failed:",
      error
    );


    return {
      ok: false,
      reason:
        "network_error",
    };
  }
}

// ============================================================
// SYNC QUEUED EVENTS
// ============================================================

export async function syncEventsToCloud() {

  const storage =
    await chrome.storage.local.get({
      eventLog: [],
    });


  const events:
    OutcognitoEvent[] =
      storage.eventLog;


  if (
    events.length === 0
  ) {

    console.log(
      "[Cloud Sync] No events waiting."
    );


    return {
      attempted: 0,
      sent: 0,
      remaining: 0,
    };
  }


  console.log(
    `[Cloud Sync] Sending ${events.length} queued event(s).`
  );


  const remaining:
    OutcognitoEvent[] =
    [];


  let sent =
    0;


  for (
    let index = 0;
    index < events.length;
    index++
  ) {

    const event =
      events[index];


    const result =
      await sendOutcognitoEvent(
        event
      );


    if (
      result.ok
    ) {

      sent++;
      continue;
    }


    // Invalid event:
    // don't keep retrying forever.
    if (
      result.status === 400
    ) {

      console.error(
        "[Cloud Sync] Dropping permanently invalid event:",
        event.eventId
      );

      continue;
    }


    remaining.push(
      event
    );


    // Authentication failure means every subsequent
    // event will fail too.
    if (
      result.status === 401 ||
      result.reason ===
        "not_paired"
    ) {

      remaining.push(
        ...events.slice(
          index + 1
        )
      );

      break;
    }
  }


  await chrome.storage.local.set({
    eventLog:
      remaining,
  });


  console.log(
    "[Cloud Sync] Complete:",
    {
      attempted:
        events.length,

      sent,

      remaining:
        remaining.length,
    }
  );


  return {
    attempted:
      events.length,

    sent,

    remaining:
      remaining.length,
  };
}

// ============================================================
// FALLBACK PERIODIC SYNC
// ============================================================

export function initCloudSync() {

  chrome.alarms.create(
    "cloud_sync_alarm",
    {
      periodInMinutes:
        5,
    }
  );


  chrome.alarms
    .onAlarm
    .addListener(
      alarm => {

        if (
          alarm.name ===
          "cloud_sync_alarm"
        ) {

          void syncEventsToCloud();
        }
      }
    );


  console.log(
    "[Cloud Sync] Fallback sync initialized."
  );
}
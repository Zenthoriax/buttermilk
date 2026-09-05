import {
  getAuth,
  getDailyStats,
  setAuth,
} from "../storage/storage";

import {
  syncEventsToCloud,
} from "./cloudSync";

const EXPECTED_API_ORIGIN =
  "https://mrvn7840mi.execute-api.ap-south-1.amazonaws.com";

function normalizeApiUrl(
  value: string
): string | null {
  try {
    const url =
      new URL(value);

    if (
      url.protocol !== "https:" ||
      url.origin !==
        EXPECTED_API_ORIGIN
    ) {
      return null;
    }

    return url.origin;

  } catch {
    return null;
  }
}

export function initLocalAPI() {

  // ==========================================================
  // INTERNAL EXTENSION MESSAGES
  // ==========================================================

  chrome.runtime.onMessage.addListener(
    (
      message,
      _sender,
      sendResponse
    ) => {

      if (
        message.type ===
        "GET_DAILY_STATS"
      ) {

        getDailyStats()
          .then(stats => {
            sendResponse({
              success: true,
              data: stats,
            });
          });

        return true;
      }


      if (
        message.type ===
        "GET_EVENT_LOG"
      ) {

        chrome.storage.local
          .get({
            eventLog: [],
          })
          .then(storage => {

            sendResponse({
              success: true,
              data:
                storage.eventLog,
            });
          });

        return true;
      }


      if (
        message.type ===
        "FORCE_SYNC"
      ) {

        syncEventsToCloud()
          .then(result => {

            sendResponse({
              success: true,
              data: result,
            });
          });

        return true;
      }


      if (
        message.type ===
        "GET_PAIRING_STATUS"
      ) {

        getAuth()
          .then(auth => {

            sendResponse({
              success: true,

              paired:
                Boolean(
                  auth.accessToken &&
                  auth.apiBaseUrl
                ),

              needsRepair:
                auth.needsRepair,

              pairedAt:
                auth.pairedAt,
            });
          });

        return true;
      }


      sendResponse({
        success: false,
        error:
          "Unknown API endpoint",
      });

      return false;
    }
  );


  // ==========================================================
  // WEBSITE → EXTENSION
  // ==========================================================

  chrome.runtime
    .onMessageExternal
    .addListener(
      (
        message,
        sender,
        sendResponse
      ) => {

        // ------------------------------------------------------
        // PING
        // ------------------------------------------------------

        if (
          message?.type ===
          "OUTCOGNITO_PING"
        ) {

          console.log(
            "[Outcognito] Website ping received:",
            sender.url
          );

          sendResponse({
            ok: true,

            type:
              "OUTCOGNITO_PONG",
          });

          return;
        }


        // ------------------------------------------------------
        // ACCOUNT PAIRING
        // ------------------------------------------------------

        if (
          message?.type ===
          "OUTCOGNITO_PAIR"
        ) {

          const {
            accessToken,
            apiBaseUrl,
            pairedAt,
          } =
            message.payload || {};


          if (
            typeof accessToken !==
              "string" ||
            !accessToken
          ) {

            sendResponse({
              ok: false,
              paired: false,
              error:
                "Missing Cognito access token.",
            });

            return;
          }


          if (
            typeof apiBaseUrl !==
            "string"
          ) {

            sendResponse({
              ok: false,
              paired: false,
              error:
                "Missing API URL.",
            });

            return;
          }


          const normalizedApiUrl =
            normalizeApiUrl(
              apiBaseUrl
            );


          if (
            !normalizedApiUrl
          ) {

            sendResponse({
              ok: false,
              paired: false,
              error:
                "Unexpected backend URL.",
            });

            return;
          }


          setAuth({
            accessToken,

            apiBaseUrl:
              normalizedApiUrl,

            pairedAt:
              typeof pairedAt ===
                "string"
                ? pairedAt
                : new Date()
                    .toISOString(),

            needsRepair:
              false,
          })
            .then(() => {

              console.log(
                "[Outcognito] Account paired successfully."
              );

              sendResponse({
                ok: true,
                paired: true,
              });
            })
            .catch(error => {

              console.error(
                "[Outcognito] Failed to store pairing:",
                error
              );

              sendResponse({
                ok: false,
                paired: false,
                error:
                  "Storage failed.",
              });
            });


          // Keep channel open for setAuth().
          return true;
        }
      }
    );


  console.log(
    "[Local API] Internal + external message handlers initialized."
  );
}
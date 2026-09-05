import {
  EventCategory,
  OutcognitoEvent,
} from "../../../../packages/event-schema/src/index";

import {
  createQuickReturnEvent,
  createRapidSwitchEvent,
  createRepeatedVisitEvent,
} from "../events/eventFactory";

import {
  logValidatedEvent,
} from "../events/eventLogger";

import {
  syncEventsToCloud,
} from "../api/cloudSync";

interface Visit {
  domain:
    string;

  category:
    EventCategory;

  time:
    number;
}

interface CooldownMap {
  [key: string]:
    number;
}

const HISTORY_WINDOW_MS =
  10 * 60 * 1000;

const QUICK_RETURN_MAX_MS =
  2 * 60 * 1000;

const RAPID_SWITCH_WINDOW_MS =
  3 * 60 * 1000;

const COOLDOWNS = {
  quickReturn:
    5 * 60 * 1000,

  repeatedVisits:
    10 * 60 * 1000,

  rapidSwitching:
    10 * 60 * 1000,
};

async function canEmit(
  key: string,
  cooldownMs: number
) {

  const storage =
    await chrome.storage.local.get({
      patternCooldowns: {},
    });


  const cooldowns:
    CooldownMap =
    storage.patternCooldowns;


  const now =
    Date.now();


  const last =
    cooldowns[key] ||
    0;


  if (
    now - last <
    cooldownMs
  ) {

    return false;
  }


  cooldowns[key] =
    now;


  await chrome.storage.local.set({
    patternCooldowns:
      cooldowns,
  });


  return true;
}

async function emitEvent(
  event:
    OutcognitoEvent,

  cooldownKey:
    string,

  cooldownMs:
    number
) {

  const allowed =
    await canEmit(
      cooldownKey,
      cooldownMs
    );


  if (!allowed) {
    return;
  }


  const logged =
    await logValidatedEvent(
      event
    );


  if (!logged) {
    return;
  }


  console.log(
    "[Pattern Engine] Incident detected:",
    {
      type:
        event.eventType,

      category:
        event.category,

      roastability:
        event.roastability,
    }
  );


  // Send immediately.
  // Alarm-based sync remains as backup.
  await syncEventsToCloud();
}

export async function analyzePatterns(
  domain:
    string,

  category:
    EventCategory
) {

  const now =
    Date.now();


  const storage =
    await chrome.storage.session.get({
      globalHistory: [],
    });


  let history:
    Visit[] =
    storage.globalHistory;


  // Remove stale history first.
  history =
    history.filter(
      visit =>
        now -
          visit.time <=
        HISTORY_WINDOW_MS
    );


  // Previous visit to SAME domain,
  // before recording the current one.
  const previousSameDomain =
    [...history]
      .reverse()
      .find(
        visit =>
          visit.domain ===
          domain
      );


  history.push({
    domain,
    category,
    time:
      now,
  });


  await chrome.storage.session.set({
    globalHistory:
      history,
  });


  // ==========================================================
  // DETECTOR 1 — QUICK RETURN
  // ==========================================================

  if (
    previousSameDomain
  ) {

    const millisecondsAway =
      now -
      previousSameDomain.time;


    const secondsAway =
      Math.round(
        millisecondsAway /
          1000
      );


    if (
      millisecondsAway >=
        5_000 &&
      millisecondsAway <=
        QUICK_RETURN_MAX_MS
    ) {

      const visitCount =
        history.filter(
          visit =>
            visit.domain ===
            domain
        ).length;


      const event =
        createQuickReturnEvent(
          category,
          secondsAway,
          visitCount
        );


      await emitEvent(
        event,

        `quick_return:${domain}`,

        COOLDOWNS.quickReturn
      );


      return;
    }
  }


  // ==========================================================
  // DETECTOR 2 — RAPID SWITCHING
  // ==========================================================

  const rapidHistory =
    history.filter(
      visit =>
        now -
          visit.time <=
        RAPID_SWITCH_WINDOW_MS
    );


  let categorySwitches =
    0;


  for (
    let i = 1;
    i < rapidHistory.length;
    i++
  ) {

    if (
      rapidHistory[i]
        .category !==
      rapidHistory[i - 1]
        .category
    ) {

      categorySwitches++;
    }
  }


  if (
    categorySwitches >=
    6
  ) {

    const event =
      createRapidSwitchEvent(
        categorySwitches,
        RAPID_SWITCH_WINDOW_MS /
          1000
      );


    await emitEvent(
      event,

      "rapid_switching",

      COOLDOWNS
        .rapidSwitching
    );


    return;
  }


  // ==========================================================
  // DETECTOR 3 — REPEATED CATEGORY VISITS
  // ==========================================================

  const categoryVisits =
    history.filter(
      visit =>
        visit.category ===
        category
    ).length;


  if (
    categoryVisits >=
    5
  ) {

    const event =
      createRepeatedVisitEvent(
        category,
        categoryVisits,
        10
      );


    await emitEvent(
      event,

      `repeated:${category}`,

      COOLDOWNS
        .repeatedVisits
    );
  }
}
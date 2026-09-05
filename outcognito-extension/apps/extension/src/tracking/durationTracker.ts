import {
  getDailyStats,
  getSession,
  setDailyStats,
  setSession,
} from "../storage/storage";

export async function finalizeDuration() {

  const session =
    await getSession();


  if (
    !session.tabStartedAt ||
    !session.currentDomain ||
    !session.currentCategory
  ) {

    return;
  }


  const now =
    Date.now();


  const durationSeconds =
    Math.floor(
      (
        now -
        session.tabStartedAt
      ) /
        1000
    );


  // Clear immediately to prevent
  // double counting.
  await setSession({
    tabStartedAt:
      undefined,
  });


  // Ignore invalid / ghost sessions.
  if (
    durationSeconds <= 0 ||
    durationSeconds >
      28_800
  ) {

    return;
  }


  const stats =
    await getDailyStats();


  const domainsVisited =
    {
      ...(stats
        .domainsVisited ||
        {}),
    };


  const categorySeconds =
    {
      ...(stats
        .categorySeconds ||
        {}),
    };


  domainsVisited[
    session.currentDomain
  ] =
    (
      domainsVisited[
        session.currentDomain
      ] ||
      0
    ) +
    durationSeconds;


  categorySeconds[
    session.currentCategory
  ] =
    (
      categorySeconds[
        session.currentCategory
      ] ||
      0
    ) +
    durationSeconds;


  await setDailyStats({
    activeSeconds:
      stats.activeSeconds +
      durationSeconds,

    domainsVisited,

    categorySeconds,
  });


  console.log(
    `[DurationTracker] ${durationSeconds}s → ${session.currentCategory}`
  );
}

export async function startDuration() {

  const session =
    await getSession();


  if (
    session.browserFocused ===
      false ||
    session.userIdle ===
      true
  ) {

    return;
  }


  if (
    !session.currentDomain ||
    !session.currentCategory
  ) {

    return;
  }


  await setSession({
    tabStartedAt:
      Date.now(),
  });


  console.log(
    "[DurationTracker] Timing started."
  );
}
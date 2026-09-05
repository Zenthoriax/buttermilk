import {
  extractHostname,
} from "./hostname";

import {
  DEFAULT_IGNORED_DOMAINS,
} from "./defaultIgnoredDomains";

import {
  getSettings,
} from "../storage/storage";

function matchesDomainRule(
  hostname:
    string,

  rule:
    string
) {

  const normalizedRule =
    rule
      .toLowerCase()
      .replace(
        /^www\./,
        ""
      );


  return (
    hostname ===
      normalizedRule ||

    hostname.endsWith(
      `.${normalizedRule}`
    )
  );
}

export async function isDomainAllowed(
  hostname:
    string
): Promise<boolean> {

  // ==========================================================
  // BUILT-IN PRIVACY BLOCKLIST
  // ==========================================================

  for (
    const ignoredDomain
    of DEFAULT_IGNORED_DOMAINS
  ) {

    if (
      matchesDomainRule(
        hostname,
        ignoredDomain
      )
    ) {

      return false;
    }
  }


  // ==========================================================
  // USER BLOCKLIST
  // ==========================================================

  const settings =
    await getSettings();


  for (
    const ignoredDomain
    of settings.ignoredDomains
  ) {

    if (
      matchesDomainRule(
        hostname,
        ignoredDomain
      )
    ) {

      return false;
    }
  }


  return true;
}

export async function processUrlThroughFirewall(
  rawUrl:
    string | undefined
): Promise<string | null> {

  const settings =
    await getSettings();


  if (
    !settings.enabled
  ) {

    return null;
  }


  const hostname =
    extractHostname(
      rawUrl
    );


  if (
    !hostname
  ) {

    return null;
  }


  const allowed =
    await isDomainAllowed(
      hostname
    );


  if (
    !allowed
  ) {

    return null;
  }


  return hostname;
}
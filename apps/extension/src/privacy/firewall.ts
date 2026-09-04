import { extractHostname } from "./hostname";
import { DEFAULT_IGNORED_DOMAINS } from "./defaultIgnoredDomains";
import { getSettings } from "../storage/storage";

/**
 * Checks a cleaned hostname against both the default blocklist 
 * and the user's custom ignored domains.
 */
export async function isDomainAllowed(hostname: string): Promise<boolean> {
  // 1. Check hardcoded sensitive domains
  if (DEFAULT_IGNORED_DOMAINS.has(hostname)) {
    return false;
  }

  // 2. Check user's custom ignored domains from storage
  const settings = await getSettings();
  if (settings.ignoredDomains.includes(hostname)) {
    return false;
  }

  return true;
}

/**
 * The main entry point for the privacy firewall.
 * Takes a raw URL and returns a safe hostname if tracking is allowed, 
 * or null if it should be blocked/ignored.
 */
export async function processUrlThroughFirewall(rawUrl: string | undefined): Promise<string | null> {
  // 1. If tracking is globally paused by the user, block everything.
  const settings = await getSettings();
  if (!settings.enabled) {
    return null;
  }

  // 2. Safely extract the hostname (stripping paths, queries, etc.)
  const hostname = extractHostname(rawUrl);
  if (!hostname) {
    return null; // Block invalid or non-web URLs (like chrome://)
  }

  // 3. Check if the domain is allowed
  const allowed = await isDomainAllowed(hostname);
  if (!allowed) {
    return null;
  }

  // 4. Return the safe, normalized hostname for tracking
  return hostname;
}
/**
 * Safely extracts the hostname from a raw URL.
 * Strips all paths, query parameters, and fragments.
 * Removes "www." prefixes for consistent matching.
 * Returns null if the URL is invalid or not a standard web page (e.g., chrome://)
 */
export function extractHostname(rawUrl: string | undefined): string | null {
  if (!rawUrl) return null;

  try {
    const urlObj = new URL(rawUrl);

    // We only track standard web browsing, not local files or browser settings
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return null;
    }

    let hostname = urlObj.hostname;

    // Strip "www." to ensure "www.youtube.com" and "youtube.com" are treated identically
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }

    return hostname;
  } catch (error) {
    // If the URL is malformed, we fail safely and return null
    return null;
  }
}
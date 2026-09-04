import { getSettings, pushRecentSignal, setSettings } from "../storage/storage";
import { processUrlThroughFirewall } from "../privacy/firewall";
import { categorizeDomain } from "../tracking/domainCategories";

console.log(`[Outcognito] service worker booted at ${new Date().toISOString()}`);

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`[Outcognito] onInstalled fired, reason: ${details.reason}`);

  // Test Category 1: Known Development
  console.log("[Category Test 1] github.com ->", categorizeDomain("github.com"));

  // Test Category 2: Known AI
  console.log("[Category Test 2] chatgpt.com ->", categorizeDomain("chatgpt.com"));

  // Test Category 3: Unknown / Fallback
  console.log("[Category Test 3] random-site.com ->", categorizeDomain("random-site.com"));
});
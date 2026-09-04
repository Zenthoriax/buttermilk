import { getSettings, pushRecentSignal, setSettings } from "../storage/storage";
import { processUrlThroughFirewall } from "../privacy/firewall";

console.log(`[Outcognito] service worker booted at ${new Date().toISOString()}`);

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`[Outcognito] onInstalled fired, reason: ${details.reason}`);

  // Test 1: Normal URL with path, query, and "www."
  const safe1 = await processUrlThroughFirewall("https://www.github.com/zenthoriax/outcognito?secret=123");
  console.log("[Firewall Test 1] Normal URL:", safe1);

  // Test 2: Sensitive URL (from default ignored list)
  const safe2 = await processUrlThroughFirewall("https://mail.google.com/mail/u/0/#inbox");
  console.log("[Firewall Test 2] Sensitive URL:", safe2);

  // Test 3: Paused tracking state
  await setSettings({ enabled: false });
  const safe3 = await processUrlThroughFirewall("https://news.ycombinator.com");
  console.log("[Firewall Test 3] Paused State:", safe3);

  // Reset settings back to active for future phases
  await setSettings({ enabled: true });
});
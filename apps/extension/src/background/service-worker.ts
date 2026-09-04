console.log("[Outcognito] service worker booted at", new Date().toISOString());

chrome.runtime.onInstalled.addListener((details) => {
  console.log("[Outcognito] onInstalled fired, reason:", details.reason);
});
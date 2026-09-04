console.log("[Outcognito] service worker booted at",new Date().toISOString());chrome.runtime.onInstalled.addListener(o=>{console.log("[Outcognito] onInstalled fired, reason:",o.reason)});

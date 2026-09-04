import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  DEFAULT_SESSION,
  DEFAULT_DAILY_STATS,
  DEFAULT_AUTH,
} from "./defaults";

// -- SETTINGS --
export async function getSettings() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...data[STORAGE_KEYS.SETTINGS] };
}

export async function setSettings(settings: Partial<typeof DEFAULT_SETTINGS>) {
  const current = await getSettings();
  await chrome.storage.local.set({
    [STORAGE_KEYS.SETTINGS]: { ...current, ...settings },
  });
}

// -- SESSION --
export async function getSession() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.SESSION);
  return { ...DEFAULT_SESSION, ...data[STORAGE_KEYS.SESSION] };
}

export async function setSession(session: Partial<typeof DEFAULT_SESSION>) {
  const current = await getSession();
  await chrome.storage.local.set({
    [STORAGE_KEYS.SESSION]: { ...current, ...session },
  });
}

// -- DAILY STATS --
export async function getDailyStats() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.DAILY_STATS);
  return { ...DEFAULT_DAILY_STATS, ...data[STORAGE_KEYS.DAILY_STATS] };
}

export async function setDailyStats(stats: Partial<typeof DEFAULT_DAILY_STATS>) {
  const current = await getDailyStats();
  await chrome.storage.local.set({
    [STORAGE_KEYS.DAILY_STATS]: { ...current, ...stats },
  });
}

// -- AUTH --
export async function getAuth() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.AUTH);
  return { ...DEFAULT_AUTH, ...data[STORAGE_KEYS.AUTH] };
}

export async function setAuth(auth: Partial<typeof DEFAULT_AUTH>) {
  const current = await getAuth();
  await chrome.storage.local.set({
    [STORAGE_KEYS.AUTH]: { ...current, ...auth },
  });
}

// -- RECENT SIGNALS (RING BUFFER) --

export interface BrowserSignal {
  type: "domain_enter" | "domain_leave" | "tab_switch" | "window_focus" | "window_blur";
  domain?: string;
  category?: string;
  timestamp: string;
  durationSeconds?: number;
}

export async function getRecentSignals(): Promise<BrowserSignal[]> {
  const data = await chrome.storage.local.get(STORAGE_KEYS.RECENT_SIGNALS);
  return data[STORAGE_KEYS.RECENT_SIGNALS] || [];
}

export async function pushRecentSignal(signal: BrowserSignal) {
  const signals = await getRecentSignals();
  signals.push(signal);

  // Ring buffer logic: keep only the newest 200 signals
  if (signals.length > 200) {
    signals.splice(0, signals.length - 200);
  }

  await chrome.storage.local.set({
    [STORAGE_KEYS.RECENT_SIGNALS]: signals,
  });
}
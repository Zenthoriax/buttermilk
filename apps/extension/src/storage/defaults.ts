export const STORAGE_KEYS = {
  SETTINGS: "settings",
  SESSION: "session",
  DAILY_STATS: "dailyStats",
  RECENT_SIGNALS: "recentSignals",
  AUTH: "auth",
} as const;

export const DEFAULT_SETTINGS = {
  enabled: true,
  ignoredDomains: [] as string[],
};

export const DEFAULT_SESSION = {
  currentDomain: undefined as string | undefined,
  currentCategory: undefined as string | undefined,
  tabStartedAt: undefined as number | undefined,
  browserFocused: true,
  userIdle: false,
};

export const DEFAULT_DAILY_STATS = {
  date: new Date().toISOString().split("T")[0],
  tabSwitches: 0,
  activeSeconds: 0,
  aiVisits: 0,
  domainsVisited: {} as Record<string, number>,
  categorySeconds: {} as Record<string, number>,
};

export const DEFAULT_AUTH = {
  authToken: undefined as string | undefined,
  pairedAt: undefined as string | undefined,
};
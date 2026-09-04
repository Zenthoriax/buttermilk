# Outcognito — ZENTHORIAX Build Plan

This file contains the complete implementation roadmap for **ZENTHORIAX**.

Do the phases in order.

Do not jump to UI polish, cloud integration, or advanced behavior detection before the lower layers are stable.

---

# Phase 0 — Shared Event Contract

## Goal

Lock the event format before building the extension.

## Step 0.1 — Create package

```text
packages/event-schema/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

## Step 0.2 — Add Zod schema

```ts
import { z } from "zod";

export const OutcognitoEventSchema = z.object({
  eventId: z.string(),
  category: z.enum([
    "development",
    "ai",
    "social",
    "entertainment",
    "productivity",
    "shopping",
    "general",
  ]),
  eventType: z.string(),
  description: z.string(),
  stats: z.object({
    occurrence: z.number().optional(),
    durationSeconds: z.number().optional(),
    count: z.number().optional(),
  }).optional(),
  roastability: z.number().min(0).max(1),
  privacyLevel: z.literal("safe"),
  timestamp: z.string(),
});

export type OutcognitoEvent =
  z.infer<typeof OutcognitoEventSchema>;
```

## Step 0.3 — Freeze contract

Do not randomly change:

- category values
- field names
- timestamp format
- API endpoint
- auth header format

Recommended:

```text
POST /events
```

## Done when

A fake event passes schema validation.

---

# Phase 1 — Extension Skeleton

## Goal

Create a minimal working Manifest V3 extension.

## Folder structure

```text
apps/extension/
├── public/
│   ├── manifest.json
│   └── icons/
│
├── src/
│   ├── background/
│   │   └── service-worker.ts
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.ts
│   ├── tracking/
│   ├── privacy/
│   ├── storage/
│   ├── patterns/
│   ├── events/
│   ├── api/
│   ├── auth/
│   ├── config/
│   └── types/
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Manifest permissions

```json
{
  "manifest_version": 3,
  "name": "Outcognito",
  "version": "0.1.0",
  "permissions": [
    "tabs",
    "storage",
    "idle",
    "alarms"
  ],
  "host_permissions": [
    "http://localhost/*"
  ],
  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup.html"
  }
}
```

Do not add content scripts.

## Done when

- extension loads
- popup opens
- service worker logs boot message

---

# Phase 2 — Persistent Storage

## Goal

Make tracking survive Manifest V3 service-worker suspension.

## Create

```text
src/storage/storage.ts
src/storage/defaults.ts
```

## Storage groups

```text
settings
session
dailyStats
recentSignals
auth
```

## Suggested keys

```ts
export const STORAGE_KEYS = {
  SETTINGS: "settings",
  SESSION: "session",
  DAILY_STATS: "dailyStats",
  RECENT_SIGNALS: "recentSignals",
  AUTH: "auth",
} as const;
```

## Build wrapper functions

```text
getSettings
setSettings

getSession
setSession

getDailyStats
setDailyStats

getRecentSignals
pushRecentSignal

getAuth
setAuth
```

## Ring buffer

Maximum:

```text
200 safe signals
```

Remove oldest when limit is exceeded.

## Daily state

Example:

```ts
{
  date: "2026-09-04",
  tabSwitches: 0,
  activeSeconds: 0,
  domainsVisited: {},
  categorySeconds: {},
  aiVisits: 0
}
```

## Done when

- reload service worker
- storage remains
- ring buffer remains capped

---

# Phase 3 — Privacy Firewall

## Goal

Block sensitive browsing information before tracking logic.

## Create

```text
src/privacy/hostname.ts
src/privacy/firewall.ts
src/privacy/defaultIgnoredDomains.ts
```

## Hostname sanitizer

Input:

```text
https://www.youtube.com/watch?v=abc
```

Output:

```text
youtube.com
```

Do not store the full URL.

## Processing order

```text
tab.url
↓
extract hostname
↓
discard path/query
↓
privacy check
↓
tracking
```

## Ignore categories

Include default protection for:

- banking
- payments
- email
- authentication
- password managers
- cloud storage
- other obviously sensitive services

## Core function

```ts
isDomainAllowed(hostname: string): boolean
```

## User exclusions

Storage support:

```ts
addIgnoredDomain(domain)
removeIgnoredDomain(domain)
```

## Done when

- sensitive site produces no signal
- full URL never appears in storage
- no content script exists

---

# Phase 4 — Domain Categorization

## Create

```text
src/tracking/domainCategories.ts
```

## Categories

```text
development
ai
social
entertainment
productivity
shopping
general
```

## Example map

```ts
const DOMAIN_CATEGORY_MAP = {
  "github.com": "development",
  "stackoverflow.com": "development",
  "chatgpt.com": "ai",
  "claude.ai": "ai",
  "gemini.google.com": "ai",
  "instagram.com": "social",
  "reddit.com": "social",
  "youtube.com": "entertainment",
};
```

Unknown:

```text
general
```

## Done when

Known and unknown domains classify correctly.

---

# Phase 5 — Tab Tracking

## Goal

Track domain-level browser behavior.

## Use

```ts
chrome.tabs.onActivated
chrome.tabs.onUpdated
```

## On tab activation

1. load previous session
2. finalize old duration
3. get current active tab
4. extract hostname
5. privacy check
6. categorize
7. increment tab-switch count
8. update session checkpoint
9. append safe signal
10. trigger pattern evaluation

## On tab update

Only react to meaningful hostname changes.

Avoid processing every loading event.

## Done when

GitHub → YouTube → ChatGPT produces valid safe signals.

---

# Phase 6 — Window Focus Tracking

## Use

```ts
chrome.windows.onFocusChanged
```

## Goal

Do not count browser time while the user is working in another application.

Flow:

```text
Chrome loses focus
↓
finalize active duration
↓
pause browser timing

Chrome regains focus
↓
resume timing
```

---

# Phase 7 — Idle Tracking

## Use

```ts
chrome.idle.onStateChanged
```

States:

```text
active
idle
locked
```

If idle/locked:

```text
finalize duration
stop active timing
```

If active:

```text
resume allowed-domain timing
```

---

# Phase 8 — Duration Tracking

## Create

```text
src/tracking/durationTracker.ts
```

Persist:

```text
currentDomain
currentCategory
tabStartedAt
```

Do not keep timing only in memory.

## Done when

Service-worker restart does not produce absurd duration values.

---

# Phase 9 — Behavioral Memory

## Track

```text
tab switches today
time per category
time per domain
AI visits
domain return counts
productive ↔ distraction transitions
```

## Midnight rollover

If stored date differs from current local date:

```text
reset daily stats
keep auth
keep settings
```

---

# Phase 10 — Pattern Engine

## Structure

```text
src/patterns/
├── patternEngine.ts
├── tabInsanity.ts
├── aiDependency.ts
├── distraction.ts
├── giveUp.ts
├── relapse.ts
└── roastability.ts
```

---

## Pattern 1 — Tab Insanity

Example:

```text
>= 18 switches
within 60 seconds
```

---

## Pattern 2 — AI Dependency

Example:

```text
>= 5 AI entries
within 20 minutes
```

---

## Pattern 3 — Distraction

Example repeated transition:

```text
development
→ entertainment
→ development
→ social
→ development
→ entertainment
```

---

## Pattern 4 — Give Up

Heuristic:

```text
sustained productive/development period
followed by
sustained entertainment/social period
```

Do not infer emotional state beyond behavior.

---

## Pattern 5 — Relapse

Repeated return to distracting domain/category after leaving it.

---

## Cooldowns

Example:

```text
tab_insanity:
10-minute cooldown
```

Without cooldown, one burst can create many duplicate events.

## Done when

Fake signals can deterministically trigger every V1 pattern.

---

# Phase 11 — Roastability

## Create

```text
src/patterns/roastability.ts
```

Use rule-based scoring.

Example:

```text
tab_insanity
base: 0.55
+ extra score based on switches beyond threshold
max: 0.95
```

Clamp:

```ts
Math.max(0, Math.min(1, score))
```

Important:

```text
Do not discard low-score events.
```

---

# Phase 12 — Event Factory

## Create

```text
src/events/createEvent.ts
```

Build:

```ts
const event = {
  eventId: crypto.randomUUID(),
  category,
  eventType,
  description,
  stats,
  roastability,
  privacyLevel: "safe",
  timestamp: new Date().toISOString(),
};
```

Then:

```ts
OutcognitoEventSchema.parse(event);
```

## Reject locally if malformed

Never send malformed events.

---

# Phase 13 — API Client

## Create

```text
src/config/environment.ts
src/api/client.ts
```

## API base

Development:

```text
http://localhost:4000
```

Production:

```text
real backend URL
```

Use one:

```text
API_BASE
```

## Implement

```ts
sendEvent(event)
```

Steps:

1. validate event
2. read token
3. build request
4. POST JSON
5. attach Bearer token if present
6. handle errors
7. preserve same `eventId` on retry

## Done when

Real browsing creates an event visible in the local backend terminal.

---

# Phase 14 — Popup UI

## Required information

```text
Watching / Paused
Privacy shield status
Today's tab switches
AI time
Entertainment time
Account connection state
```

## Pause logic

When paused:

```ts
settings.enabled = false;
```

Every tracker must respect this.

The UI must not merely pretend to pause.

---

# Phase 15 — Pairing

## Goal

Allow website login to connect extension to user.

## Manifest

```json
{
  "externally_connectable": {
    "matches": [
      "https://outcognito.com/*",
      "http://localhost:3000/*"
    ]
  }
}
```

## Service worker

Use:

```ts
chrome.runtime.onMessageExternal
```

Validate:

```text
sender.origin
```

Allowed only:

```text
production Outcognito origin
localhost dev origin
```

## Store

```text
authToken
pairedAt
```

Never print real tokens in normal logs.

---

# Phase 16 — Authenticated API Delivery

Every real event request:

```http
Content-Type: application/json
Authorization: Bearer <token>
```

Handle:

```text
401
403
400
5xx
network failure
```

Do not crash extension.

---

# Phase 17 — Cloud Swap

Once local integration works:

```text
change API_BASE
```

Add production backend origin to:

```text
host_permissions
```

Do not rewrite API logic.

---

# Phase 18 — Reliability Testing

## Test 1 — Service-worker restart

Tracking should continue correctly.

## Test 2 — Browser restart

Settings/auth survive.

Timing should not count browser-closed time.

## Test 3 — Sensitive domain

Expected:

```text
no signal
no duration
no pattern
```

## Test 4 — Pause

Expected:

```text
no tracking
```

## Test 5 — Backend offline

Expected:

```text
extension stays alive
```

## Test 6 — Duplicate retry

Same `eventId` is preserved.

## Test 7 — Ring buffer overflow

Expected:

```text
only newest 200 remain
```

## Test 8 — Date rollover

Expected:

```text
daily stats reset
auth/settings remain
```

---

# Phase 19 — Polish

Only after everything above works.

Priorities:

1. clean popup
2. privacy explanation
3. connection state
4. ignored-domain settings
5. error messages
6. icon
7. demo-friendly stats

Do not waste time on unnecessary animations.

---

# ZENTHORIAX Fastest Work Order

```text
1. Event schema
2. MV3 skeleton
3. Storage
4. Privacy firewall
5. Domain categorization
6. Tab tracking
7. Window tracking
8. Idle tracking
9. Duration tracking
10. Behavioral memory
11. One pattern
12. Roastability
13. Event factory
14. Local API send
15. Verify end-to-end
16. Remaining patterns
17. Popup
18. Pairing
19. Authenticated API
20. Cloud swap
21. Reliability testing
22. Polish
```

---

# Minimum Demo Cut

If time becomes critical, keep:

- MV3 extension
- persistent state
- privacy firewall
- hostname-only tracking
- tab/window/idle tracking
- 1–2 patterns
- event validation
- API delivery
- simple popup
- pause/resume

Cut first:

- advanced popup animations
- custom ignored-domain UI
- extra patterns
- deep analytics

Never cut:

- privacy boundary
- persistent storage
- shared schema
- working extension → backend event delivery

---

# ZENTHORIAX Definition of Done

Your work is complete when:

```text
Chrome event
↓
privacy filter
↓
tracking
↓
persistent memory
↓
pattern detection
↓
roastability
↓
event creation
↓
Zod validation
↓
authenticated POST /events
↓
backend receives valid event
```

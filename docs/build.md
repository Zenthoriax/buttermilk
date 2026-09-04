# Outcognito — Person A Build Plan

This file is the implementation plan for **Person A: Browser Extension + Privacy Layer**.

Do the phases in order.

Do not start polishing the UI, AWS integration, or complex pattern logic before the lower phases pass their checks.

---

# Phase 0 — Freeze the Shared Contract

## Goal

Make sure Person A and Person B speak the exact same data format before building independently.

## Step 0.1 — Create the shared schema package

Repository structure:

```text
outcognito/
├── apps/
│   ├── extension/
│   └── web/
├── packages/
│   └── event-schema/
└── services/
    └── backend/
```

Inside:

```text
packages/event-schema/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

## Step 0.2 — Define the Zod event schema

Create:

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
  stats: z
    .object({
      occurrence: z.number().optional(),
      durationSeconds: z.number().optional(),
      count: z.number().optional(),
    })
    .optional(),
  roastability: z.number().min(0).max(1),
  privacyLevel: z.literal("safe"),
  timestamp: z.string(),
});

export type OutcognitoEvent = z.infer<typeof OutcognitoEventSchema>;
```

## Step 0.3 — Agree with Person B

Freeze:

- category names,
- property names,
- timestamp format,
- API path,
- error response format.

Recommended API:

```text
POST /events
```

Development base:

```text
http://localhost:4000
```

Production:

```text
https://api.outcognito.com
```

or the API Gateway URL during the hackathon.

## Done when

Person A and Person B can both import/validate the same fake event.

## Suggested commit

```text
feat(schema): add shared Outcognito event contract
```

---

# Phase 1 — Create the Extension Skeleton

## Goal

Install a minimal Manifest V3 extension and prove the service worker + popup work.

## Step 1.1 — Create folders

Recommended extension structure:

```text
apps/extension/
├── public/
│   ├── icons/
│   └── manifest.json
├── src/
│   ├── background/
│   │   └── service-worker.ts
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   ├── tracking/
│   ├── patterns/
│   ├── privacy/
│   ├── storage/
│   ├── api/
│   ├── auth/
│   ├── config/
│   └── types/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Step 1.2 — Create Manifest V3

Initial permissions:

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

Do **not** add:

```text
scripting
content_scripts
<all_urls>
```

for V1.

## Step 1.3 — Test installation

1. Build extension.
2. Open Chrome.
3. Visit `chrome://extensions`.
4. Enable Developer Mode.
5. Click **Load unpacked**.
6. Select the generated extension/dist directory.
7. Open the extension popup.
8. Inspect the service worker console.

## Step 1.4 — Add a boot log

Service worker:

```ts
console.log("[Outcognito] service worker started");
```

## Done when

- extension loads without manifest errors,
- popup opens,
- service-worker console prints the boot message.

## Suggested commit

```text
feat(extension): create MV3 extension skeleton
```

---

# Phase 2 — Build Persistent State First

## Goal

Prevent MV3 service-worker suspension from destroying tracking data.

Do this **before** complicated trackers.

## Step 2.1 — Define storage keys

Example:

```ts
export const STORAGE_KEYS = {
  SETTINGS: "settings",
  SESSION: "session",
  DAILY_STATS: "dailyStats",
  RECENT_SIGNALS: "recentSignals",
  AUTH: "auth",
} as const;
```

## Step 2.2 — Create storage wrapper

Create:

```text
src/storage/storage.ts
```

Functions:

```ts
getSettings()
setSettings()

getSession()
setSession()

getDailyStats()
setDailyStats()

getRecentSignals()
pushRecentSignal()

getAuth()
setAuth()
```

Avoid calling `chrome.storage.local` everywhere in the project.

Use this wrapper.

## Step 2.3 — Create default settings

```ts
{
  enabled: true,
  ignoredDomains: []
}
```

## Step 2.4 — Create daily stats

Example:

```ts
{
  date: "2026-09-04",
  tabSwitches: 0,
  activeSeconds: 0,
  domainsVisited: {},
  categorySeconds: {}
}
```

Reset when local calendar date changes.

## Step 2.5 — Build capped ring buffer

Store only the latest safe signals.

Example maximum:

```text
200 signals
```

When item 201 arrives, remove the oldest item.

## Step 2.6 — Add alarm initialization

Create a repeating Chrome alarm for periodic housekeeping/checkpoint logic.

Never assume an alarm exists forever; ensure it exists whenever the service worker initializes.

## Done when

1. Create sample state.
2. Reload the extension.
3. Restart service worker.
4. State still exists.
5. Ring buffer never exceeds limit.

## Suggested commit

```text
feat(storage): add durable MV3 extension state
```

---

# Phase 3 — Build the Privacy Firewall

## Goal

Ensure sensitive activity is blocked before it reaches tracking/pattern logic.

This phase is critical.

## Step 3.1 — Create hostname sanitizer

Input:

```text
https://www.youtube.com/watch?v=abc
```

Output:

```text
youtube.com
```

Never store:

```text
/watch?v=abc
```

## Step 3.2 — Create ignored-domain config

Create:

```text
src/privacy/defaultIgnoredDomains.ts
```

Start with sensitive categories such as:

- banking,
- payments,
- email,
- authentication,
- password managers,
- cloud storage.

Avoid pretending the list can cover every sensitive site.

The important design is:

```text
URL
↓
extract hostname
↓
privacy check
↓
ONLY THEN tracking
```

## Step 3.3 — Build function

```ts
isDomainAllowed(hostname: string): boolean
```

## Step 3.4 — Add user exclusions

Create the storage support now even if the settings UI comes later.

```ts
addIgnoredDomain(domain)
removeIgnoredDomain(domain)
```

## Step 3.5 — Test forbidden data

Search the extension source for accidental use of:

```text
tab.url
```

It is acceptable only to extract the hostname and immediately discard the rest.

No content script should exist.

## Done when

- full URL is never stored,
- ignored domains produce no tracking signal,
- allowed domains produce only normalized hostname data,
- source code contains no page-content collection.

## Suggested commit

```text
feat(privacy): add domain-only privacy firewall
```

---

# Phase 4 — Domain Categorization

## Goal

Convert domains into broad behavioral categories.

## Step 4.1 — Create static map

Create:

```text
src/tracking/domainCategories.ts
```

Example:

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

Unknown domains:

```text
general
```

## Step 4.2 — Create helper

```ts
categorizeDomain(domain: string): EventCategory
```

## Step 4.3 — Keep categories small

Do not create 40 categories during the hackathon.

Use the shared categories only.

## Done when

A unit/manual test passes for:

- known development site,
- known AI site,
- known social site,
- unknown site → general.

## Suggested commit

```text
feat(tracking): add domain categorization
```

---

# Phase 5 — Tab and Window Tracking

## Goal

Capture safe browser behavior.

## Step 5.1 — Listen for tab activation

Use:

```ts
chrome.tabs.onActivated
```

When active tab changes:

1. finalize duration for previous domain,
2. get current active tab,
3. extract hostname,
4. pass hostname through privacy firewall,
5. categorize hostname,
6. increment tab-switch statistics,
7. update session checkpoint,
8. append safe signal to ring buffer.

## Step 5.2 — Listen for URL/domain changes

Use:

```ts
chrome.tabs.onUpdated
```

Only process relevant changes.

Do not log every loading event.

If hostname changes inside the active tab:

1. close previous domain duration,
2. sanitize new hostname,
3. privacy-check,
4. begin new domain session.

## Step 5.3 — Track window focus

Use:

```ts
chrome.windows.onFocusChanged
```

When browser loses focus:

- finalize active timing.

When browser regains focus:

- start/resume safe timing.

## Step 5.4 — Track idle state

Use:

```ts
chrome.idle.onStateChanged
```

When user becomes idle/locked:

- stop counting active browsing time.

When active:

- resume from current allowed domain.

## Step 5.5 — Never depend on an in-memory timer

Persist:

```ts
{
  currentDomain,
  currentCategory,
  tabStartedAt
}
```

after meaningful state transitions.

## Done when

Test:

1. GitHub → YouTube → ChatGPT.
2. Observe safe signals.
3. Tab-switch count increments.
4. Durations are reasonable.
5. Lock/idle does not keep counting time.
6. Reload service worker mid-session.
7. Tracking recovers from stored checkpoint.

## Suggested commit

```text
feat(tracking): add persistent tab window and idle tracking
```

---

# Phase 6 — Behavioral Memory / Daily Stats

## Goal

Build enough local context for pattern detection without storing complete history.

## Step 6.1 — Update aggregates

Track:

```text
tab switches today
time per category
time per domain
number of returns to domains
number of AI visits
number of distraction transitions
```

## Step 6.2 — Date rollover

When current date differs from stored date:

1. reset daily aggregates,
2. keep settings/auth,
3. clear or trim old transient signals.

## Step 6.3 — Keep only what V1 needs

Do not build analytics dashboards inside the extension.

The popup only needs a few useful counters.

## Done when

The stored object gives enough information to answer:

```text
How many tab switches today?
How long on AI?
How many times did the user return to a domain?
What recent category transitions happened?
```

## Suggested commit

```text
feat(memory): add local behavioral summaries
```

---

# Phase 7 — Pattern Engine

## Goal

Convert browser signals into safe `OutcognitoEvent` candidates.

Create:

```text
src/patterns/
├── patternEngine.ts
├── relapse.ts
├── giveUp.ts
├── tabInsanity.ts
├── aiDependency.ts
└── distraction.ts
```

Keep rules simple and deterministic.

---

## Step 7.1 — Tab Insanity

Example V1 rule:

```text
>= 18 tab switches within 60 seconds
```

Output concept:

```json
{
  "eventType": "tab_insanity",
  "description": "User switched tabs 18 times within one minute."
}
```

---

## Step 7.2 — AI Dependency

Example V1 rule:

```text
Repeatedly return to AI category during a short work session.
```

Possible signal:

```text
AI category opened >= 5 times in 20 minutes
```

---

## Step 7.3 — Distraction

Example:

```text
productivity/development
→ entertainment/social
→ productivity/development
→ entertainment/social
```

several times inside a defined window.

---

## Step 7.4 — Give Up

Example V1 heuristic:

```text
sustained development/productivity activity
followed by
extended entertainment/social activity
```

Avoid claiming the user emotionally "gave up."

Internally it is only a heuristic event name.

---

## Step 7.5 — Relapse

Example:

```text
User leaves a repeatedly visited distraction domain,
returns again shortly afterward,
and repeats the cycle.
```

---

## Step 7.6 — Prevent spam

Each pattern needs a cooldown.

Example:

```text
tab_insanity cooldown = 10 minutes
```

Without cooldowns, a single behavior burst may generate many duplicate events.

## Step 7.7 — Generate event ID

Use:

```ts
crypto.randomUUID()
```

## Done when

You can feed fake recent signals into Pattern Engine and reliably trigger each event.

## Suggested commit

```text
feat(patterns): add V1 behavior pattern engine
```

---

# Phase 8 — Roastability Engine

## Goal

Assign a consistent `0..1` score to each detected event.

Create:

```text
src/patterns/roastability.ts
```

## Step 8.1 — Start rule-based

Do not use an AI model in the browser.

Example:

```ts
tab_insanity:
  base 0.55
  + 0.01 per switch above threshold
  capped at 0.95
```

Different patterns can have different scoring functions.

## Step 8.2 — Clamp

Always:

```ts
Math.max(0, Math.min(1, score))
```

## Step 8.3 — Do not filter

Important:

```text
Pattern detected
↓
score calculated
↓
event validated
↓
SEND EVENT
```

Do not do:

```text
if score < 0.60 → delete
```

Person B owns public-feed filtering.

## Done when

Every pattern produces a predictable score in `0..1`.

## Suggested commit

```text
feat(patterns): add roastability scoring
```

---

# Phase 9 — Event Factory + Runtime Validation

## Goal

Create one trusted path for event creation.

Create:

```text
src/events/createEvent.ts
```

## Step 9.1 — Create event

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

## Step 9.2 — Validate

```ts
const validated =
  OutcognitoEventSchema.parse(event);
```

If validation fails:

- log development error,
- do not transmit malformed data.

## Step 9.3 — Privacy assertion

Before sending, event should contain no:

- URL path,
- page title if it may expose private content,
- raw page text,
- tokens,
- input values.

## Done when

Malformed test event is rejected.

Valid test event passes.

## Suggested commit

```text
feat(events): add validated event factory
```

---

# Phase 10 — API Client + Local Bridge

## Goal

Send Person A events to Person B without AWS.

Create:

```text
src/config/environment.ts
src/api/client.ts
```

## Step 10.1 — Centralize API base

Example:

```ts
export const API_BASE =
  import.meta.env.DEV
    ? "http://localhost:4000"
    : "https://api.outcognito.com";
```

Do not scatter URLs through the codebase.

## Step 10.2 — Implement

```ts
sendEvent(event)
```

Flow:

1. validate with Zod,
2. obtain stored token,
3. POST JSON,
4. attach authorization if available,
5. handle timeout/network errors,
6. retry carefully if needed.

## Step 10.3 — Idempotency

Because `eventId` is client-generated, retrying the same event should preserve the same `eventId`.

Never generate a new ID for every retry.

## Step 10.4 — Test with Person B local server

Expected local loop:

```text
Open supported website
↓
extension detects signal
↓
pattern triggers
↓
POST http://localhost:4000/events
↓
Person B terminal prints event
```

## Done when

A real event generated by browsing appears in Person B's local backend terminal.

This is one of the biggest milestones.

## Suggested commit

```text
feat(api): connect extension to local event endpoint
```

---

# Phase 11 — Popup UI

## Goal

Give the user visibility and control.

Keep it small.

## Required UI

```text
OUTCOGNITO

● Watching
Privacy shield: Active

Today
42 tab switches
18 min AI
12 min entertainment

[ Pause Monitoring ]

Connected as: ...
[ Open Profile ]
[ Settings ]
```

## Step 11.1 — Status

Read:

```text
enabled
auth state
privacy state
```

## Step 11.2 — Today stats

Read local aggregates only.

## Step 11.3 — Pause button

When paused:

```ts
settings.enabled = false
```

Tracking handlers should check it before processing signals.

Do not merely hide the UI.

## Step 11.4 — First-run privacy message

Explain that the tabs permission is used for domain-level behavior tracking and that Outcognito does not read page contents.

## Done when

User can:

- see watching/paused state,
- pause,
- resume,
- view simple daily stats,
- see whether pairing exists.

## Suggested commit

```text
feat(popup): add monitoring controls and daily stats
```

---

# Phase 12 — Website ↔ Extension Pairing

## Goal

Replace hardcoded development token with actual login handoff.

Do this after localhost event posting works.

## Step 12.1 — Manifest external connection

Add:

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

Use the actual deployment domain when known.

## Step 12.2 — Extension listener

In service worker:

```ts
const ALLOWED_ORIGINS = [
  "https://outcognito.com",
  "http://localhost:3000",
];

chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (!ALLOWED_ORIGINS.includes(sender.origin ?? "")) {
      return;
    }

    if (message.type === "PAIR") {
      chrome.storage.local
        .set({ authToken: message.token })
        .then(() => sendResponse({ ok: true }));

      return true;
    }
  }
);
```

## Step 12.3 — Person B connect page

Person B's website sends:

```ts
chrome.runtime.sendMessage(
  EXTENSION_ID,
  {
    type: "PAIR",
    token: sessionToken,
  },
  (response) => {
    // show connected state
  }
);
```

## Step 12.4 — Stabilize extension ID for development

Because the website needs an extension ID, use a stable development extension identity.

Agree on this with Person B before building `/connect`.

## Step 12.5 — Store token safely

Extension storage:

```text
authToken
pairedAt
```

Never print production tokens into normal logs.

## Step 12.6 — API authorization

Every real API request:

```http
Authorization: Bearer <token>
```

## Done when

1. User logs into local Outcognito.
2. Opens connect page.
3. Website sends PAIR.
4. Extension receives message.
5. Token appears in extension storage.
6. Popup shows Connected.
7. API request uses stored token.

## Suggested commit

```text
feat(auth): add website extension pairing
```

---

# Phase 13 — Cloud Swap

## Goal

Move the already-working local client to Person B's AWS API.

Do not redesign the extension.

## Step 13.1 — Add production API host permission

Example:

```json
{
  "host_permissions": [
    "http://localhost/*",
    "https://api.outcognito.com/*"
  ]
}
```

or API Gateway's invoke origin during development.

## Step 13.2 — Change environment config

Only `API_BASE` should change.

## Step 13.3 — Test CORS together

Backend must accept extension requests including:

```text
Origin: chrome-extension://<extension-id>
Authorization header
Content-Type: application/json
```

## Step 13.4 — Test rejected auth

Cases:

```text
missing token
expired token
invalid token
```

Extension should not crash.

Show disconnected/reconnect state where appropriate.

## Done when

Real browser behavior reaches deployed backend through authenticated API.

## Suggested commit

```text
feat(api): connect extension to cloud backend
```

---

# Phase 14 — Reliability Testing

## Goal

Break the extension before the judges do.

## Test A — Service worker restart

1. Browse.
2. Kill/restart extension service worker.
3. Continue browsing.
4. Ensure counters remain correct.

## Test B — Browser restart

1. Browse.
2. Close Chrome.
3. Reopen.
4. Ensure settings/auth persist.
5. Ensure tracking resumes correctly.

## Test C — Sensitive domain

Visit excluded site.

Expected:

```text
No event.
No duration.
No stored hostname if excluded.
```

## Test D — Pause

Pause monitoring.

Browse several sites.

Expected:

```text
No new signals.
No pattern events.
```

## Test E — Network failure

Stop backend.

Trigger event.

Expected:

```text
Extension remains operational.
No crash.
Error handled.
```

## Test F — Duplicate retry

Send same `eventId` twice.

Person B should deduplicate server-side.

## Test G — Ring buffer

Generate more than maximum signals.

Expected:

```text
storage contains max N newest entries only
```

## Test H — Midnight rollover

Mock/change date handling.

Expected:

```text
daily stats reset
settings/auth remain
```

## Suggested commit

```text
test(extension): add V1 reliability checks
```

---

# Phase 15 — Demo Polish

Only now spend time here.

## Person A polish priorities

1. Clean popup styling.
2. Watching/paused visual state.
3. Privacy explanation.
4. Connection status.
5. User ignored-domain settings if time remains.
6. Error states.
7. Extension icon.
8. Demo-friendly stats.

Do not spend hours on animations.

---

# Person A Daily Work Order

If time is extremely limited, follow this order:

```text
1. Shared event schema
2. Extension skeleton
3. Storage wrapper
4. Privacy firewall
5. Tab/window/idle tracking
6. Domain categorization
7. Ring buffer + daily aggregates
8. One pattern only
9. Event validation
10. Local API send
11. End-to-end test with Person B
12. Remaining patterns
13. Popup
14. Pairing
15. Cloud swap
16. Polish
```

---

# Minimum Demo Cut

If time runs out, keep:

- Manifest V3 extension
- domain-only tracking
- privacy firewall
- persistent state
- one or two patterns
- shared Zod event
- localhost or cloud event delivery
- simple popup
- working AI response on Person B side

Cut first:

1. memes,
2. custom ignored-domain UI,
3. fancy popup animation,
4. detailed analytics,
5. additional patterns.

Never cut:

- shared schema,
- privacy boundary,
- persistent storage strategy,
- working extension → backend bridge.

---

# Person A Definition of Done

Your side is finished when this exact sequence works:

```text
1. Install Outcognito extension.
2. Extension says Watching.
3. Browse normal supported websites.
4. Only hostnames/categories are used.
5. Sensitive domain is ignored.
6. Behavior signals persist safely.
7. Pattern Engine recognizes a behavior.
8. Event receives a roastability score.
9. Event passes Zod validation.
10. Event is POSTed to backend.
11. Backend receives the exact event.
12. User can pause/resume tracking.
13. Website can pair account to extension.
14. Stored token authorizes API requests.
15. Service-worker restart does not break tracking.
```

At that point Person A's main hackathon responsibility is complete.

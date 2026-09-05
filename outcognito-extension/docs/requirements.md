# Outcognito — Requirements

This document defines the recommended project stack and the specific requirements for **Person A's Chrome extension**, while also recording the shared technologies Person A must integrate with.

---

# 1. Development Environment

## Required

- Windows 11, macOS, or Linux
- Google Chrome or Chromium-based browser
- Node.js
- npm
- Git
- GitHub
- VS Code
- Chrome Developer Mode

## Recommended

Use the current Node.js LTS release supported by the team's dependencies.

Both teammates should use the same Node major version.

Verify:

```bash
node --version
npm --version
git --version
```

---

# 2. Languages

## TypeScript

Primary language for Person A.

Use TypeScript for:

- service worker,
- trackers,
- pattern engine,
- API client,
- storage helpers,
- popup logic,
- shared event schema.

Why:

- shared types with Person B,
- safer event contract,
- fewer accidental property mistakes,
- good Chrome API typings.

## HTML

Used for extension popup.

## CSS

Used for extension popup styling.

## JSON

Used for:

- `manifest.json`,
- package configuration,
- static data/config if appropriate.

---

# 3. Extension Platform

## Chrome Extensions Manifest V3

Required.

The V1 extension must use:

- background service worker,
- `chrome.tabs`,
- `chrome.windows`,
- `chrome.storage`,
- `chrome.idle`,
- `chrome.alarms`,
- `chrome.runtime` external messaging.

No content scripts are required for V1.

---

# 4. Build Tool

## Vite

Recommended for Person A.

Purpose:

- compile/bundle TypeScript,
- build popup assets,
- development workflow,
- environment variables,
- production builds.

A custom/simple build configuration may be needed to ensure the MV3 service worker and popup files end up in the expected output paths.

Alternative:

A minimal `tsc` + asset-copy script is also acceptable if Vite configuration becomes a time sink.

The hackathon priority is reliability, not framework cleverness.

---

# 5. UI Framework

## Recommended: no heavy UI framework for V1

The popup is small.

Use:

```text
HTML + CSS + TypeScript
```

This avoids React lifecycle/build complexity inside the extension.

If the team already has a working React extension scaffold, React may be used, but it is not necessary for Person A's deliverable.

---

# 6. Core npm Dependencies

## Runtime

### Zod

```bash
npm install zod
```

Purpose:

- runtime validation of `OutcognitoEvent`,
- safe API boundary,
- shared validation with backend.

---

## Development

### TypeScript

```bash
npm install -D typescript
```

### Vite

```bash
npm install -D vite
```

### Chrome Type Definitions

```bash
npm install -D @types/chrome
```

### Optional test framework

Vitest:

```bash
npm install -D vitest
```

Use this for pure logic such as:

- domain sanitizer,
- category mapping,
- pattern rules,
- roastability scoring,
- event validation.

---

# 7. Do Not Add Unless Actually Needed

Avoid dependency bloat.

Person A does **not** need these for V1:

- TensorFlow
- PyTorch
- LangChain
- database client
- AWS SDK
- OpenAI SDK
- Bedrock SDK
- scraping libraries
- Puppeteer
- Selenium
- page-content parsers
- Redux
- large state-management libraries

Person B handles backend AI/AWS dependencies.

---

# 8. Chrome Manifest Permissions

Recommended V1 permissions:

```json
{
  "permissions": [
    "tabs",
    "storage",
    "idle",
    "alarms"
  ]
}
```

### `tabs`

Needed for active tab/domain information.

### `storage`

Needed because MV3 service workers are not persistent.

### `idle`

Needed to prevent inactive/locked periods from being counted as active browsing.

### `alarms`

Needed for periodic housekeeping/checkpoint work without relying on a permanently running timer.

---

# 9. Host Permissions

Development:

```json
{
  "host_permissions": [
    "http://localhost/*"
  ]
}
```

Production later:

```json
{
  "host_permissions": [
    "http://localhost/*",
    "https://api.outcognito.com/*"
  ]
}
```

Replace the production host with the actual backend origin if different.

---

# 10. External Pairing Requirement

Manifest:

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

Only approved website origins should be allowed.

Production domain must be replaced with the team's real domain if different.

---

# 11. Browser APIs Person A Uses

## `chrome.tabs`

Use for:

- active-tab changes,
- tab updates,
- domain-level activity.

Main events:

```ts
chrome.tabs.onActivated
chrome.tabs.onUpdated
```

---

## `chrome.windows`

Use for browser focus state.

```ts
chrome.windows.onFocusChanged
```

---

## `chrome.idle`

Use for:

```text
active
idle
locked
```

state changes.

```ts
chrome.idle.onStateChanged
```

---

## `chrome.storage.local`

Use as durable source of truth for:

- settings,
- auth token,
- session checkpoints,
- daily aggregates,
- capped recent signal buffer.

---

## `chrome.alarms`

Use for periodic maintenance/checkpoint logic.

The extension should verify required alarms on service-worker startup rather than blindly assuming they remain present.

---

## `chrome.runtime.onMessageExternal`

Use for website → extension account pairing.

---

# 12. Shared Event Contract

Required fields:

```ts
{
  eventId: string,
  category:
    | "development"
    | "ai"
    | "social"
    | "entertainment"
    | "productivity"
    | "shopping"
    | "general",
  eventType: string,
  description: string,
  stats?: {
    occurrence?: number,
    durationSeconds?: number,
    count?: number
  },
  roastability: number,
  privacyLevel: "safe",
  timestamp: string
}
```

Both Person A and Person B must validate it with Zod.

---

# 13. API Requirement

Development:

```text
POST http://localhost:4000/events
```

Production:

```text
POST <API_BASE>/events
```

Headers after pairing:

```http
Content-Type: application/json
Authorization: Bearer <token>
```

Person A should use one central environment variable/config:

```text
API_BASE
```

---

# 14. Suggested Person A Source Structure

```text
apps/extension/
├── public/
│   ├── manifest.json
│   └── icons/
│
├── src/
│   ├── background/
│   │   └── service-worker.ts
│   │
│   ├── api/
│   │   └── client.ts
│   │
│   ├── auth/
│   │   └── pairing.ts
│   │
│   ├── config/
│   │   └── environment.ts
│   │
│   ├── events/
│   │   └── createEvent.ts
│   │
│   ├── patterns/
│   │   ├── patternEngine.ts
│   │   ├── roastability.ts
│   │   ├── relapse.ts
│   │   ├── giveUp.ts
│   │   ├── tabInsanity.ts
│   │   ├── aiDependency.ts
│   │   └── distraction.ts
│   │
│   ├── privacy/
│   │   ├── hostname.ts
│   │   ├── firewall.ts
│   │   └── defaultIgnoredDomains.ts
│   │
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.ts
│   │
│   ├── storage/
│   │   ├── storage.ts
│   │   └── defaults.ts
│   │
│   ├── tracking/
│   │   ├── tabTracker.ts
│   │   ├── windowTracker.ts
│   │   ├── idleTracker.ts
│   │   ├── durationTracker.ts
│   │   └── domainCategories.ts
│   │
│   └── types/
│       └── index.ts
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Shared package:

```text
packages/event-schema/
└── src/
    └── index.ts
```

---

# 15. Recommended Scripts

Example:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

Exact scripts may change based on final build configuration.

---

# 16. Development Tools

## Chrome extension inspection

Use:

```text
chrome://extensions
```

Useful actions:

- Load unpacked
- Reload extension
- Inspect service worker
- View errors

## DevTools

Use console logging with consistent prefixes:

```ts
console.log("[Outcognito][Tracking]", data);
console.log("[Outcognito][Pattern]", data);
console.log("[Outcognito][API]", data);
```

Never log real production auth tokens.

---

# 17. Git Requirements

Recommended branches:

```text
main
person-a-extension
person-b-platform
```

Person A commits by feature.

Examples:

```text
feat(extension): create MV3 skeleton
feat(storage): add durable state
feat(privacy): add privacy firewall
feat(tracking): add tab tracker
feat(patterns): add tab insanity rule
feat(api): connect local backend
feat(auth): add website pairing
```

Do not make one huge final commit.

---

# 18. Testing Requirements

## Unit-test candidates

These are pure functions and worth testing:

- hostname normalization,
- privacy filtering,
- domain categorization,
- ring-buffer trimming,
- individual pattern rules,
- roastability score,
- Zod event validation.

## Manual integration tests

Required:

- tab switching,
- active-domain changes,
- idle/lock,
- browser loses focus,
- pause/resume,
- ignored domains,
- service-worker restart,
- browser restart,
- localhost API unavailable,
- real API unavailable,
- pairing success,
- pairing from invalid origin,
- invalid/expired token.

---

# 19. Person B Dependencies That Affect Person A

Person A does not need to implement these, but integration depends on them:

- Next.js web application
- local mock API
- authentication provider
- AWS API Gateway/Lambda
- backend Zod validation
- AI personality service
- database/event storage

The two sides should integrate through APIs/contracts instead of importing each other's internal application code.

---

# 20. Security Requirements

Person A must:

- validate external-message origin,
- validate events before sending,
- use HTTPS in production,
- avoid page content,
- avoid full URLs,
- avoid sensitive domains,
- never expose auth tokens in UI/logs,
- use least-privilege manifest permissions,
- treat backend input/output as untrusted,
- keep extension monitoring pausable.

---

# 21. Current Technical Notes

Chrome's current extension documentation confirms that:

- extension APIs are asynchronous,
- `chrome.alarms` is intended for scheduled/periodic extension work,
- alarms should be checked/recreated when reliable periodic behavior matters,
- `externally_connectable` defines which webpages may message an extension,
- the manifest `key` can be used to control a stable development extension ID when that is necessary.

Because browser-extension APIs evolve, recheck Chrome's official documentation if an API behaves differently on the team's installed Chrome version.

---

# 22. Requirement Priority

## P0 — Cannot ship without

- Manifest V3
- TypeScript
- persistent state
- privacy firewall
- tab/domain tracking
- shared event schema
- pattern engine
- event validation
- API client
- pause/resume
- local end-to-end integration

## P1 — Required for strong demo

- pairing
- cloud API
- multiple patterns
- clean popup
- connection state
- reliable service-worker restart behavior

## P2 — Nice to have

- custom ignored-domain UI
- richer analytics
- advanced popup animation
- additional patterns
- cross-browser support

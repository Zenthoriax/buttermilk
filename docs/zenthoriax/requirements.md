# Outcognito — ZENTHORIAX Requirements

This document contains only the technical requirements for **ZENTHORIAX's extension work**.

---

# 1. Development Environment

Required:

- Windows 11 / macOS / Linux
- Google Chrome or Chromium browser
- Node.js
- npm
- Git
- GitHub
- VS Code
- Chrome Developer Mode

Use the same Node major version throughout development.

Check:

```bash
node --version
npm --version
git --version
```

---

# 2. Languages

## TypeScript

Primary language.

Use for:

- service worker
- tracking
- storage
- privacy
- patterns
- events
- API
- auth
- popup logic

## HTML

Popup UI.

## CSS

Popup styling.

## JSON

Manifest/config/static maps.

---

# 3. Extension Standard

Use:

```text
Chrome Extensions Manifest V3
```

Required browser APIs:

```text
chrome.tabs
chrome.windows
chrome.storage
chrome.idle
chrome.alarms
chrome.runtime
```

---

# 4. Build Tool

Recommended:

```text
Vite
```

Purpose:

- TypeScript build
- popup bundling
- service-worker bundling
- environment configuration

If Vite becomes a time sink, a simple TypeScript build plus asset copy is acceptable.

---

# 5. UI Technology

Recommended:

```text
HTML + CSS + TypeScript
```

No heavy framework needed for the popup.

React is optional, not required.

---

# 6. Core Dependencies

## Runtime

### Zod

```bash
npm install zod
```

Purpose:

```text
runtime event validation
```

---

# 7. Development Dependencies

```bash
npm install -D typescript
npm install -D vite
npm install -D @types/chrome
npm install -D vitest
```

Purpose:

- TypeScript compiler
- build tooling
- Chrome API types
- unit tests

---

# 8. Do Not Add

Do not add these to the extension unless a real need appears:

```text
TensorFlow
PyTorch
LangChain
AWS SDK
Bedrock SDK
OpenAI SDK
Puppeteer
Selenium
scraping libraries
database clients
Redux
large state libraries
```

They are unnecessary for ZENTHORIAX's V1 responsibilities.

---

# 9. Manifest Permissions

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

## tabs

Needed for active-tab/domain tracking.

## storage

Needed for durable MV3 state.

## idle

Needed to stop counting inactive time.

## alarms

Needed for periodic maintenance/checkpoints.

---

# 10. Host Permissions

Development:

```json
{
  "host_permissions": [
    "http://localhost/*"
  ]
}
```

Later:

```json
{
  "host_permissions": [
    "http://localhost/*",
    "https://api.outcognito.com/*"
  ]
}
```

Use actual backend origin when finalized.

---

# 11. External Pairing

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

Only trusted origins.

---

# 12. Browser APIs

## chrome.tabs

```ts
chrome.tabs.onActivated
chrome.tabs.onUpdated
```

Used for:

- active tab switch
- hostname changes

---

## chrome.windows

```ts
chrome.windows.onFocusChanged
```

Used for:

- browser focused/unfocused state

---

## chrome.idle

```ts
chrome.idle.onStateChanged
```

Used for:

```text
active
idle
locked
```

---

## chrome.storage.local

Used for:

```text
settings
auth
session checkpoint
daily stats
recent signal buffer
```

---

## chrome.alarms

Used for:

```text
housekeeping
periodic checkpoints
```

---

## chrome.runtime.onMessageExternal

Used for:

```text
website → extension pairing
```

---

# 13. Source Structure

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

Shared:

```text
packages/event-schema/
└── src/
    └── index.ts
```

---

# 14. Shared Event Requirement

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

Validate with Zod before sending.

---

# 15. API Requirement

Development:

```text
POST http://localhost:4000/events
```

Production:

```text
POST <API_BASE>/events
```

Headers:

```http
Content-Type: application/json
Authorization: Bearer <token>
```

Use one central:

```text
API_BASE
```

---

# 16. Storage Requirements

Persistent:

```text
settings
auth
daily stats
session checkpoint
```

Capped:

```text
recent signals
```

Recommended maximum:

```text
200
```

Do not store an unlimited behavioral history.

---

# 17. Security Requirements

ZENTHORIAX must:

- process hostname only
- discard URL path/query
- avoid content scripts
- ignore sensitive domains
- validate external-message origins
- validate outgoing events
- use HTTPS in production
- avoid logging real auth tokens
- use least-privilege permissions
- support monitoring pause
- treat backend responses as untrusted

---

# 18. Privacy Requirements

Must never collect:

```text
page text
chat content
emails
passwords
keystrokes
clipboard
form values
screenshots
documents
full URL history
```

---

# 19. Testing Requirements

Unit tests should cover:

```text
hostname normalization
privacy filtering
domain categorization
ring-buffer trimming
pattern rules
roastability
event validation
```

Manual tests:

```text
tab switching
URL/domain change
browser focus loss
idle state
locked state
pause/resume
ignored domain
service-worker restart
browser restart
network failure
pairing success
pairing invalid origin
invalid token
```

---

# 20. Git Strategy

Recommended branch:

```text
zenthoriax-extension
```

Commit by feature:

```text
feat(extension): create MV3 skeleton
feat(storage): add durable state
feat(privacy): add privacy firewall
feat(tracking): add tab tracking
feat(patterns): add behavior detection
feat(api): connect local backend
feat(auth): add extension pairing
```

Avoid one huge final commit.

---

# 21. Requirement Priority

## P0

Cannot ship without:

- MV3 extension
- TypeScript
- storage
- privacy firewall
- tracking
- event schema
- pattern engine
- Zod validation
- API client
- pause/resume

## P1

Strong demo:

- pairing
- authenticated API
- multiple patterns
- clean popup
- restart reliability

## P2

Nice to have:

- custom ignored-domain UI
- richer analytics
- extra patterns
- visual polish

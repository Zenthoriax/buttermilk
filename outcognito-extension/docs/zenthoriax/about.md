# Outcognito — ZENTHORIAX Work Overview

## 1. Role

**ZENTHORIAX** is responsible for the complete browser-extension side of Outcognito.

Your work starts when Chrome exposes browser activity and ends when a privacy-safe, validated `OutcognitoEvent` is successfully sent to the backend.

Your responsibility is:

```text
Chrome browser activity
        ↓
privacy filtering
        ↓
safe browser tracking
        ↓
local behavioral memory
        ↓
pattern detection
        ↓
roastability scoring
        ↓
event creation
        ↓
runtime validation
        ↓
authenticated API delivery
```

You are **not** responsible for:

- AI character generation
- social feed UI
- backend AI logic
- meme generation
- DynamoDB post storage
- AWS deployment
- backend post creation
- website feed/profile implementation

Your side should function independently against a local mock API before cloud integration.

---

# 2. What ZENTHORIAX Is Building

You are building a **privacy-first Chrome/Chromium extension** that observes high-level browser behavior and converts it into privacy-safe behavioral events.

The extension must detect things such as:

- active domain
- tab switching
- repeated domain returns
- time spent in broad categories
- browser focus changes
- idle/locked state
- repeated AI-tool use
- repeated distraction switching
- unusually rapid tab switching

The extension must not read:

- webpage text
- chat messages
- emails
- passwords
- keystrokes
- clipboard data
- form inputs
- screenshots
- files
- full URLs
- URL query strings

---

# 3. ZENTHORIAX Final Deliverable

Your complete V1 deliverable is:

```text
Outcognito Chrome Extension
```

with:

- Manifest V3
- persistent background service-worker state
- privacy firewall
- hostname normalization
- domain categorization
- tab tracking
- window focus tracking
- idle tracking
- duration tracking
- local behavioral memory
- recent-signal ring buffer
- daily aggregates
- pattern engine
- roastability engine
- validated event factory
- API client
- website ↔ extension pairing
- pause/resume monitoring
- popup UI
- authentication token storage
- reliability handling

---

# 4. Main Architecture Boundary

Your exact architectural boundary is:

```text
START:
Chrome browser event

END:
Validated OutcognitoEvent successfully reaches backend
```

Everything between those two points belongs to ZENTHORIAX.

---

# 5. Shared Event Contract

Your extension must create this canonical event shape:

```ts
export type EventCategory =
  | "development"
  | "ai"
  | "social"
  | "entertainment"
  | "productivity"
  | "shopping"
  | "general";

export interface OutcognitoEvent {
  eventId: string;
  category: EventCategory;
  eventType: string;
  description: string;

  stats?: {
    occurrence?: number;
    durationSeconds?: number;
    count?: number;
  };

  roastability: number;
  privacyLevel: "safe";
  timestamp: string;
}
```

Runtime validation must use Zod.

---

# 6. Core Privacy Principle

The extension should never send raw browsing content.

Bad:

```text
https://chatgpt.com/c/private-project-question
```

Correct:

```text
chatgpt.com
```

Even better, the event leaving the extension should normally be abstracted to:

```json
{
  "category": "ai",
  "eventType": "ai_dependency",
  "description": "User returned to an AI assistant repeatedly during a work session.",
  "stats": {
    "count": 6
  }
}
```

---

# 7. Extension Data Flow

```text
Chrome API event
↓
check monitoring enabled
↓
extract hostname
↓
privacy firewall
↓
categorize domain
↓
update tracking state
↓
update persistent storage
↓
append safe signal
↓
run pattern engine
↓
if pattern detected:
    calculate roastability
↓
create OutcognitoEvent
↓
Zod validate
↓
send to backend
```

---

# 8. What Stays Local

Prefer to keep locally:

- raw tab URL temporarily during hostname extraction
- ignored-domain rules
- user ignored-domain settings
- current session checkpoint
- recent safe signal buffer
- daily aggregates
- authentication token
- monitoring enabled/disabled state

---

# 9. What Can Leave the Extension

Only privacy-safe event data:

```text
eventId
category
eventType
abstract description
aggregated stats
roastability
privacyLevel
timestamp
```

---

# 10. Local Behavioral Patterns

V1 patterns:

## Tab Insanity

Rapid tab switching inside a short time window.

Example:

```text
18+ switches in 60 seconds
```

## AI Dependency

Repeated return to AI-category websites during a work session.

Example:

```text
5+ AI entries in 20 minutes
```

## Distraction

Repeated switching between productive/development and social/entertainment categories.

## Give Up

A heuristic where sustained productive/development activity is followed by a sustained entertainment/social period.

## Relapse

Repeated return to the same distraction category/domain shortly after leaving it.

---

# 11. Roastability

Every detected pattern receives a `0.0–1.0` score.

Example:

```text
0.00–0.29  ordinary
0.30–0.59  mildly interesting
0.60–0.79  strong candidate
0.80–1.00  highly roastable
```

Important:

**ZENTHORIAX sends every valid detected event.**

Do not delete low-score events inside the extension.

---

# 12. Persistent Storage Rule

Manifest V3 service workers are not permanent.

Therefore:

```text
chrome.storage.local
```

must be the source of truth.

Do not depend on long-lived JavaScript variables.

Persist:

```text
settings
session checkpoint
daily stats
recent signals
auth state
```

---

# 13. Popup Requirements

Popup should display:

```text
OUTCOGNITO

● Watching

Privacy Shield: Active

Today:
42 tab switches
18 min AI
12 min entertainment

[ Pause Monitoring ]

Account: Connected
[ Open Profile ]
[ Settings ]
```

At minimum:

- Watching/Paused
- privacy status
- daily stats
- pairing status
- pause/resume

---

# 14. Pairing Requirement

The Outcognito website should be able to pair with the extension.

Flow:

```text
user logs in
↓
website receives token
↓
website sends PAIR message
↓
extension validates sender origin
↓
extension stores auth token
↓
extension attaches token to API calls
```

Use:

```text
externally_connectable
chrome.runtime.onMessageExternal
```

---

# 15. Local Development Strategy

Do not wait for cloud deployment.

Your development sequence is:

```text
Extension
↓
localhost mock backend
↓
verify event received
```

Only after this works:

```text
replace API_BASE
↓
real backend
```

---

# 16. Success Criteria

ZENTHORIAX's work is complete when:

1. Extension installs as an unpacked MV3 extension.
2. Popup opens without errors.
3. Monitoring can be paused and resumed.
4. Only hostname-level behavior is processed.
5. Sensitive domains are ignored.
6. Tab/window/idle behavior is tracked.
7. State survives service-worker suspension.
8. Recent signals are capped.
9. Daily aggregates work.
10. Pattern Engine detects V1 patterns.
11. Roastability score is generated.
12. `OutcognitoEvent` passes Zod validation.
13. Event reaches local backend.
14. Website can pair with extension.
15. Stored token is attached to API requests.
16. Real backend receives authenticated events.
17. Extension continues working after browser/service-worker restart.

---

# 17. Final ZENTHORIAX Responsibility Statement

Your role can be summarized as:

> **ZENTHORIAX turns browser behavior into safe, reliable, validated Outcognito events without exposing sensitive browsing content.**

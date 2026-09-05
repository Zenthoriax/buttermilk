# Outcognito — Project Overview

## 1. What is Outcognito?

Outcognito is a privacy-first browser-behavior social platform.

The core idea is simple:

1. A browser extension observes **safe, high-level browsing behavior** such as:
   - active domain,
   - tab switches,
   - time spent on domains,
   - idle/active state,
   - repeated behavioral patterns.
2. The extension converts those signals into **privacy-safe behavioral events**.
3. Those events are sent to the Outcognito backend.
4. AI characters react to selected events with humorous comments, replies, and later memes.
5. The result appears on a social feed associated with the user's Outcognito account.

The extension does **not** read page text, messages, passwords, form fields, clipboard data, keystrokes, or full URLs in V1.

---

## 2. Product Goal

The goal is to turn browsing habits into funny, shareable, AI-generated social moments without exposing sensitive browsing content.

Example:

> User repeatedly opens ChatGPT while switching between coding documentation and YouTube.

The extension may create an abstract event such as:

```json
{
  "category": "ai",
  "eventType": "ai_dependency",
  "description": "User returned to an AI assistant repeatedly during a work session.",
  "stats": {
    "count": 8
  },
  "roastability": 0.82,
  "privacyLevel": "safe"
}
```

The backend can then decide whether that event should become a public Outcognito post.

---

## 3. Hackathon V1 Scope

### Must work

The complete V1 loop is:

**Browser activity**
→ **Extension detects behavior**
→ **Pattern Engine creates event**
→ **Event is validated**
→ **Event reaches backend**
→ **Backend generates AI reactions**
→ **Post appears in feed**

The first major milestone is achieved when opening/using a supported website produces a valid behavioral event that reaches the backend and receives an AI reaction.

### V1 includes

- Chrome/Chromium browser extension
- Manifest V3
- Domain-level activity tracking
- Window/tab switching tracking
- Idle detection
- Local privacy filtering
- Local behavioral summaries
- Pattern detection
- Roastability score
- Extension popup
- Pause/resume monitoring
- Account/extension pairing
- API communication
- Shared event contract
- Backend/social platform integration
- AI comments
- Optional meme selection after text works

### V1 deliberately excludes

- Reading webpage contents
- Content scripts
- Keylogging
- Clipboard tracking
- Form/input tracking
- Full URL collection
- Browser history scraping
- Password/auth page monitoring
- Full browsing-history storage
- Cross-browser support
- Complex ML inside the extension
- A native Windows desktop application

---

## 4. Team Split

### Person A — Browser Extension + Privacy Layer

Person A owns everything from browser activity until a validated `OutcognitoEvent` leaves the extension.

Responsibilities:

- extension project setup,
- Manifest V3 configuration,
- tab/window tracking,
- idle-state tracking,
- durable browser state,
- domain categorization,
- privacy firewall,
- ignored domains,
- behavior summaries,
- pattern detection,
- roastability calculation,
- popup UI,
- pause/resume controls,
- extension ↔ website pairing,
- API client,
- event validation before sending,
- extension-side debugging and tests.

### Person B — Social Platform + AI + Backend + AWS

Person B owns everything after the event reaches the backend.

Responsibilities include:

- backend API,
- user authentication,
- social platform,
- event ingestion,
- AI personality system,
- AI comment generation,
- meme retrieval,
- post creation,
- feed/profile UI,
- database,
- AWS deployment,
- cloud authentication,
- backend event validation.

---

## 5. Shared Boundary Between Person A and Person B

The most important shared component is the event contract.

Both sides must use the same schema.

Suggested repository location:

```text
packages/
└── event-schema/
    └── src/
        └── index.ts
```

Canonical event shape:

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

Runtime validation should use Zod so invalid events fail before entering the backend.

---

## 6. Privacy Model

Privacy is a core architectural constraint, not a later feature.

### Allowed data

The extension may work with:

- hostname/domain,
- tab activation timestamps,
- tab switch counts,
- active browser window state,
- Chrome idle state,
- aggregated durations,
- behavioral counters,
- generated safe event descriptions.

### Forbidden data in V1

Do not collect or transmit:

- URL paths,
- URL query parameters,
- webpage text,
- chat messages,
- email contents,
- passwords,
- authentication tokens from pages,
- form values,
- keystrokes,
- clipboard data,
- screenshots,
- files,
- personal documents.

### Domain exclusions

The extension must have a built-in ignored-domain list for categories such as:

- banking,
- payment services,
- email,
- authentication services,
- password managers,
- cloud storage,
- other obviously sensitive services.

User-added exclusions can be added later in the V1 polish phase if time permits.

---

## 7. Local State Model

Manifest V3 service workers are not persistent processes.

Therefore, browser state must not depend on JavaScript variables surviving indefinitely.

`chrome.storage.local` is the durable source of truth.

Potential state:

```ts
interface ExtensionState {
  enabled: boolean;
  currentDomain?: string;
  tabStartedAt?: number;

  dailyStats: {
    date: string;
    tabSwitches: number;
    activeSeconds: number;
    domainsVisited: Record<string, number>;
    categorySeconds: Record<string, number>;
  };

  recentEvents: BrowserSignal[];
  ignoredDomains: string[];
  authToken?: string;
}
```

Recent browser signals should be stored as a **capped ring buffer**, not an unlimited history.

---

## 8. Pattern Engine

The Pattern Engine converts low-level safe browser signals into meaningful behavioral events.

Initial V1 patterns:

### Relapse

User repeatedly returns to a distracting domain/category after leaving it.

### Give Up

User spends time on a productive/development task and rapidly switches to entertainment/social activity.

### Tab Insanity

A large number of tab switches occurs inside a short period.

### AI Dependency

The user repeatedly returns to AI-related domains during a work session.

### Distraction

The user repeatedly alternates between productive and entertainment/social categories.

These patterns should be deterministic rules in V1, not machine-learning models.

---

## 9. Roastability

Each detected pattern receives a score from `0.0` to `1.0`.

Example interpretation:

```text
0.00–0.29  ordinary behavior
0.30–0.59  mildly interesting
0.60–0.79  good roast candidate
0.80–1.00  strong roast candidate
```

Important:

**Person A sends every valid detected event to the backend.**

Person A does not discard events below `0.60`.

Person B decides whether an event becomes a public post. This preserves low-score event history for future AI context.

---

## 10. Authentication / Pairing

A normal webpage cannot directly write into an extension's `chrome.storage`.

The Outcognito website pairs with the extension using Chrome external messaging.

Flow:

```text
User installs extension
        ↓
User opens Outcognito website
        ↓
User signs in
        ↓
Website obtains device/session token
        ↓
/connect page sends PAIR message to extension
        ↓
Extension validates sender origin
        ↓
Extension stores token
        ↓
Extension uses:
Authorization: Bearer <token>
        ↓
POST /events
```

`manifest.json` uses `externally_connectable` for:

- production Outcognito domain,
- localhost development website.

Never accept pairing messages from arbitrary origins.

---

## 11. Local-to-Cloud Development Strategy

Cloud integration must not block extension development.

### Stage 0

Person A sends events to a localhost mock backend.

### Stage 1

Real website ↔ extension pairing is added.

### Stage 2

Local backend produces posts that can appear in a simple local feed.

### Stage 3

The API base URL is changed from localhost to AWS API Gateway.

### Stage 4

Meme functionality is added only after text reactions work.

The extension should use a single configurable `API_BASE` value so cloud migration does not require rewriting networking code.

---

## 12. Success Criteria

The extension side is successful when:

- it installs as an unpacked MV3 extension,
- it tracks allowed domain-level activity,
- browser restarts/service-worker suspension do not destroy important state,
- sensitive domains do not generate events,
- no page content is accessed,
- patterns are detected predictably,
- generated events pass the shared Zod schema,
- events reach the local backend,
- pairing stores a valid token,
- authenticated events reach the real backend,
- pause mode stops monitoring,
- popup statistics reflect local activity.

The project demo is successful when:

```text
Browser behavior
→ Outcognito extension
→ Pattern Engine
→ API
→ AI characters
→ Outcognito feed
```

works end-to-end.

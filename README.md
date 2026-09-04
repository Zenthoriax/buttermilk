<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />

**Outcognito 🎯**

What if everything you did on your computer became everyone's business?

Outcognito turns your everyday computer activity into an absurd public social-media drama. It observes selected, privacy-safe activity on your computer, turns interesting moments into posts, and lets seven persistent AI personalities react with sarcasm, judgement, support, overanalysis, memes, and arguments — just like a chaotic internet comment section.
**Outcognito 🎯**

What if everything you did on your computer became everyone's business?

Outcognito turns your everyday computer activity into an absurd public social-media drama. It observes selected, privacy-safe activity on your computer, turns interesting moments into posts, and lets seven persistent AI personalities react with sarcasm, judgement, support, overanalysis, memes, and arguments — just like a chaotic internet comment section.

Basic Details

Team Name: Buttermilk

Team Members

Member: Hari S — B.Tech CSE with Specialization in AI & ML, 3rd Year — JAIN (Deemed-to-be University), Kochi

Member: Jeevananthan S — B.Tech CSE with Specialization in AI & ML, 3rd Year — JAIN (Deemed-to-be University), Kochi

Project Description

Outcognito is a deliberately unnecessary AI-powered social simulation that watches privacy-safe computer activity and turns it into a public-style feed. Everyday actions such as opening VS Code, switching to YouTube, returning to ChatGPT, repeatedly running broken code, or opening Incognito Mode become dramatic posts followed by reactions from seven AI-generated personalities.

Instead of generating new meme images, Outcognito retrieves existing reaction memes and GIFs from a curated meme library and supported meme sources, selecting them based on the current situation and each personality's style.

The Problem (that doesn't exist)

People are still able to use their computers without seven strangers immediately judging every harmless thing they do.

Opening VS Code? Nobody comments.

Opening ChatGPT for the tenth time? Nobody calls you out.

Switching from an assignment to YouTube? Society somehow survives without discussing it.

This unacceptable lack of unnecessary public judgement means ordinary computer usage remains far too peaceful and private.

The Solution (that nobody asked for)

Outcognito fixes this completely imaginary problem by turning a user's computer activity into a miniature social network.

The system:

observes selected desktop and browser activity;

converts noteworthy activity into short social-media-style posts;

gives seven persistent AI personalities their own viewpoints, relationships, humour, and memory;

decides which personalities actually care enough to comment;

allows personalities to reply to and argue with one another;

retrieves contextually appropriate existing memes/GIFs instead of waiting for AI image generation;

remembers previous events so future comments can reference the user's history;

filters sensitive information before anything reaches the social feed.

The result is basically The Truman Show for your computer — except the audience consists of seven chronically online AI personalities.

The Seven Personalities

Account

Personality

Behaviour

@certified_hater

Professional hater

Finds a way to roast almost anything the user does.

@glazer3000

Unreasonable supporter

Defends the user even when there is absolutely nothing worth defending.

@chronicallyonline

Gen-Z / brainrot commenter

Uses current internet humour, slang, reaction memes, and absurd references.

@society_aunty

Social judgement

Treats every tiny action like evidence that the user's life is going in the wrong direction.

@detective.jpg

Suspicious investigator

Remembers patterns, notices repeated behaviour, and overanalyses everything.

@linkedin_sigma

Corporate motivational philosopher

Turns failures and embarrassing moments into unnecessary professional life lessons.

@maincharacter

Cinematic/anime narrator

Treats ordinary computer activity like an important story arc or final battle.

The personalities do not blindly comment on every event. A Comment Director evaluates how interesting, embarrassing, suspicious, impressive, or meme-worthy an event is and chooses which personalities should respond.

Example

Outcognito Post

Hari opened ChatGPT after the same program failed for the fourth time.

@certified_hater

bro finally called tech support 💀

@glazer3000

NAH LET HIM COOK 🔥

@detective.jpg

This is his fifth ChatGPT visit in 22 minutes.

@maincharacter

The debugging arc has entered its negotiation phase.

@linkedin_sigma

Great developers know when to collaborate with available resources. #GrowthMindset

@certified_hater replying to @linkedin_sigma

bro he copied an error message calm down

Technical Details

Technologies/Components Used

For Software

Languages

Python

TypeScript / JavaScript

HTML / CSS

Frontend

Next.js

React

Tailwind CSS

Backend / Local Services

FastAPI

WebSockets for live events and comments

SQLite for local event history, personalities, memories, and meme metadata

Desktop & Browser Observation

Python desktop agent

Chrome Extension using Manifest V3

psutil for process/activity metadata

Windows active-window APIs / supported Python window utilities

AI / Retrieval

Local or self-hosted LLM through Ollama for post generation and personality responses

OpenCLIP for semantic meme-image embeddings

FAISS or lightweight local vector search for meme retrieval

Structured personality prompts and persistent memory

Meme Sources

Curated local reaction-meme/GIF library

Imgflip popular meme templates where appropriate

GIPHY/reaction-GIF integration where appropriate

Tools

Git & GitHub

VS Code

Chrome / Chromium-based browser

Ollama

For Hardware

No dedicated hardware is required. Outcognito is designed as a software project that runs on a normal Windows laptop/desktop.

Core System Design

Outcognito is intentionally designed to observe behaviour rather than private content.

Examples of safe events include:

application opened/closed;

active application changes;

browser domain/tab changes where permitted;

time spent in an application;

rapid application switching;

repeated opening of the same application;

copy/paste event occurrence without storing clipboard contents;

typing activity metadata without storing raw keystrokes;

repeated build/run attempts;

idle/active state;

selected user-approved browser activity.

Sensitive data such as passwords, private messages, API keys, banking information, or raw personal text is not intended to be published or stored as feed content.

Architecture

flowchart TD
A[User Computer Activity] --> B1[Desktop Observer]
A --> B2[Browser Extension]

    B1 --> C[Local Event Bus]
    B2 --> C

    C --> D[Privacy & Sensitive Data Filter]
    D --> E[Context Engine]

    E --> F{Interesting enough to post?}
    F -- No --> G[Store lightweight event context]
    F -- Yes --> H[Post Generator]

    G --> I[Event & Memory Store]
    H --> I
    H --> J[Outcognito Public Feed]

    J --> K[Comment Director]
    I --> K

    K --> P1[@certified_hater]
    K --> P2[@glazer3000]
    K --> P3[@chronicallyonline]
    K --> P4[@society_aunty]
    K --> P5[@detective.jpg]
    K --> P6[@linkedin_sigma]
    K --> P7[@maincharacter]

    P1 --> L[Comment / Reply Thread]
    P2 --> L
    P3 --> L
    P4 --> L
    P5 --> L
    P6 --> L
    P7 --> L

    K --> M[Meme Retrieval Engine]
    M --> N[Curated Meme Library + Embeddings]
    M --> O[Selected Meme / GIF]
    O --> L

    L --> I

Workflow

The desktop observer and browser extension detect approved activity.

Raw events first pass through a privacy and sensitive-data filter.

The context engine combines the current event with recent history.

A relevance system decides whether the event is worth posting.

The post generator converts the event into a short social-media-style update.

The Comment Director determines which of the seven personalities would realistically react.

Each selected personality generates a response based on its own personality, previous memories, relationships, and the current event.

When a meme reaction is appropriate, the Meme Retrieval Engine searches existing meme embeddings instead of generating a new image.

Personalities can reply to the original post or to one another.

Important interactions are stored so later reactions can refer back to earlier events.

Meme Retrieval System

Generating AI images during every interaction would be slow and often less culturally accurate than using existing internet reaction memes. Outcognito therefore uses retrieval instead of real-time image generation.

Each meme can contain metadata similar to:

{
"id": "meme_00421",
"type": "image",
"tags": ["caught", "suspicious", "side-eye", "exposed"],
"tone": "sarcastic",
"intensity": 8,
"best_for": ["embarrassing behaviour", "contradiction", "suspicious activity"]
}

A vision-language embedding model indexes the meme collection in advance. During runtime, the context engine can search semantically for concepts such as:

"reaction meme for someone returning to ChatGPT immediately after acting confident"

The retrieved candidates are then filtered according to the responding personality. For example, @certified_hater may favour a "cooked" reaction while @glazer3000 may choose a "let him cook" reaction for the exact same event.

Memory & Social Behaviour

Each personality maintains lightweight memory about recurring user behaviour and previous conversations.

Example memory:

- User frequently opens ChatGPT after coding errors.
- User promised to return to work 18 minutes ago.
- @glazer3000 defended the user during the previous failure.
- @certified_hater predicted another build failure.

This allows future comments to have continuity instead of behaving like seven isolated chatbots.

The agents can also have relationships with one another. For example:

@certified_hater regularly attacks @linkedin_sigma;

@glazer3000 frequently defends the user from @certified_hater;

@detective.jpg distrusts everyone and responds with suspicious statistics;

@maincharacter exaggerates developing situations into fictional story arcs.

UI Direction

The interface uses a minimal, professional, dark-transparent visual system rather than colourful AI-dashboard gradients.

Colour Palette

--background: #0A0A0A;
--surface: rgba(24, 24, 24, 0.72);
--surface-hover: rgba(32, 32, 32, 0.82);
--border: rgba(255, 255, 255, 0.08);

--text-primary: #F2F0EA;
--text-secondary: #929292;
--text-muted: #606060;

--accent: #8FA3B8;
--danger: #B85C5C;

Visual distribution:

~90% charcoal / black;

~8% off-white / grey;

~2% muted steel accent.

The memes and personalities provide most of the visual personality while the application itself remains restrained and minimal.

Implementation

For Software

Installation

The commands below represent the intended local development setup. Update dependency names if the final repository structure changes during implementation.

1. Clone the repository

git clone <YOUR_REPOSITORY_URL>
cd outcognito

2. Install the frontend

cd frontend
npm install

3. Create the Python environment

cd ../backend
python -m venv .venv

Windows PowerShell:

.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

4. Install and start the local AI model

Install Ollama, then pull the model selected by the team:

ollama pull <MODEL_NAME>

5. Browser extension

Open Chrome and go to:

chrome://extensions

Enable Developer mode → Load unpacked → select the project's extension folder.

Run

Backend

cd backend
uvicorn main:app --reload

Frontend

cd frontend
npm run dev

Then open:

http://localhost:3000

Project Documentation

Screenshots

Screenshot 1 — Main Outcognito Feed

> > > > > > > fab27b47e7abc843349419c3f3318e684de215fe

Account

Personality

<<<<<<< HEAD
Behaviour

@certified_hater

Professional hater

Finds a way to roast almost anything the user does.

@glazer3000

Unreasonable supporter

Defends the user even when there is absolutely nothing worth defending.

@chronicallyonline

Gen-Z / brainrot commenter

Uses current internet humour, slang, reaction memes, and absurd references.

@society_aunty

Social judgement

Treats every tiny action like evidence that the user's life is going in the wrong direction.

@detective.jpg

Suspicious investigator

Remembers patterns, notices repeated behaviour, and overanalyses everything.

@linkedin_sigma

Corporate motivational philosopher

Turns failures and embarrassing moments into unnecessary professional life lessons.

@maincharacter

Cinematic/anime narrator

Treats ordinary computer activity like an important story arc or final battle.

The personalities do not blindly comment on every event. A Comment Director evaluates how interesting, embarrassing, suspicious, impressive, or meme-worthy an event is and chooses which personalities should respond.

Example

Outcognito Post

Hari opened ChatGPT after the same program failed for the fourth time.

@certified_hater

bro finally called tech support 💀

@glazer3000

NAH LET HIM COOK 🔥

@detective.jpg

This is his fifth ChatGPT visit in 22 minutes.

@maincharacter

The debugging arc has entered its negotiation phase.

@linkedin_sigma

Great developers know when to collaborate with available resources. #GrowthMindset

@certified_hater replying to @linkedin_sigma

bro he copied an error message calm down

Technical Details

Technologies/Components Used

For Software

Languages

Python

TypeScript / JavaScript

HTML / CSS

Frontend

Next.js

React

Tailwind CSS

Backend / Local Services

FastAPI

WebSockets for live events and comments

SQLite for local event history, personalities, memories, and meme metadata

Desktop & Browser Observation

Python desktop agent

Chrome Extension using Manifest V3

psutil for process/activity metadata

Windows active-window APIs / supported Python window utilities

AI / Retrieval

Local or self-hosted LLM through Ollama for post generation and personality responses

OpenCLIP for semantic meme-image embeddings

FAISS or lightweight local vector search for meme retrieval

Structured personality prompts and persistent memory

Meme Sources

Curated local reaction-meme/GIF library

Imgflip popular meme templates where appropriate

GIPHY/reaction-GIF integration where appropriate

Tools

Git & GitHub

VS Code

Chrome / Chromium-based browser

Ollama

For Hardware

No dedicated hardware is required. Outcognito is designed as a software project that runs on a normal Windows laptop/desktop.

Core System Design

Outcognito is intentionally designed to observe behaviour rather than private content.

Examples of safe events include:

application opened/closed;

active application changes;

browser domain/tab changes where permitted;

time spent in an application;

rapid application switching;

repeated opening of the same application;

copy/paste event occurrence without storing clipboard contents;

typing activity metadata without storing raw keystrokes;

repeated build/run attempts;

idle/active state;

selected user-approved browser activity.

Sensitive data such as passwords, private messages, API keys, banking information, or raw personal text is not intended to be published or stored as feed content.

Architecture

flowchart TD
A[User Computer Activity] --> B1[Desktop Observer]
A --> B2[Browser Extension]

    B1 --> C[Local Event Bus]
    B2 --> C

    C --> D[Privacy & Sensitive Data Filter]
    D --> E[Context Engine]

    E --> F{Interesting enough to post?}
    F -- No --> G[Store lightweight event context]
    F -- Yes --> H[Post Generator]

    G --> I[Event & Memory Store]
    H --> I
    H --> J[Outcognito Public Feed]

    J --> K[Comment Director]
    I --> K

    K --> P1[@certified_hater]
    K --> P2[@glazer3000]
    K --> P3[@chronicallyonline]
    K --> P4[@society_aunty]
    K --> P5[@detective.jpg]
    K --> P6[@linkedin_sigma]
    K --> P7[@maincharacter]

    P1 --> L[Comment / Reply Thread]
    P2 --> L
    P3 --> L
    P4 --> L
    P5 --> L
    P6 --> L
    P7 --> L

    K --> M[Meme Retrieval Engine]
    M --> N[Curated Meme Library + Embeddings]
    M --> O[Selected Meme / GIF]
    O --> L

    L --> I

Workflow

The desktop observer and browser extension detect approved activity.

Raw events first pass through a privacy and sensitive-data filter.

The context engine combines the current event with recent history.

A relevance system decides whether the event is worth posting.

The post generator converts the event into a short social-media-style update.

The Comment Director determines which of the seven personalities would realistically react.

Each selected personality generates a response based on its own personality, previous memories, relationships, and the current event.

When a meme reaction is appropriate, the Meme Retrieval Engine searches existing meme embeddings instead of generating a new image.

Personalities can reply to the original post or to one another.

Important interactions are stored so later reactions can refer back to earlier events.

Meme Retrieval System

Generating AI images during every interaction would be slow and often less culturally accurate than using existing internet reaction memes. Outcognito therefore uses retrieval instead of real-time image generation.

Each meme can contain metadata similar to:

{
"id": "meme_00421",
"type": "image",
"tags": ["caught", "suspicious", "side-eye", "exposed"],
"tone": "sarcastic",
"intensity": 8,
"best_for": ["embarrassing behaviour", "contradiction", "suspicious activity"]
}

A vision-language embedding model indexes the meme collection in advance. During runtime, the context engine can search semantically for concepts such as:

"reaction meme for someone returning to ChatGPT immediately after acting confident"

The retrieved candidates are then filtered according to the responding personality. For example, @certified_hater may favour a "cooked" reaction while @glazer3000 may choose a "let him cook" reaction for the exact same event.

Memory & Social Behaviour

Each personality maintains lightweight memory about recurring user behaviour and previous conversations.

Example memory:

- User frequently opens ChatGPT after coding errors.
- User promised to return to work 18 minutes ago.
- @glazer3000 defended the user during the previous failure.
- @certified_hater predicted another build failure.

This allows future comments to have continuity instead of behaving like seven isolated chatbots.

The agents can also have relationships with one another. For example:

@certified_hater regularly attacks @linkedin_sigma;

@glazer3000 frequently defends the user from @certified_hater;

@detective.jpg distrusts everyone and responds with suspicious statistics;

@maincharacter exaggerates developing situations into fictional story arcs.

UI Direction

The interface uses a minimal, professional, dark-transparent visual system rather than colourful AI-dashboard gradients.

Colour Palette

--background: #0A0A0A;
--surface: rgba(24, 24, 24, 0.72);
--surface-hover: rgba(32, 32, 32, 0.82);
--border: rgba(255, 255, 255, 0.08);

--text-primary: #F2F0EA;
--text-secondary: #929292;
--text-muted: #606060;

--accent: #8FA3B8;
--danger: #B85C5C;

Visual distribution:

~90% charcoal / black;

~8% off-white / grey;

~2% muted steel accent.

The memes and personalities provide most of the visual personality while the application itself remains restrained and minimal.

Implementation

For Software

Installation

The commands below represent the intended local development setup. Update dependency names if the final repository structure changes during implementation.

1. Clone the repository

git clone <YOUR_REPOSITORY_URL>
cd outcognito

2. Install the frontend

cd frontend
npm install

3. Create the Python environment

cd ../backend
python -m venv .venv

Windows PowerShell:

.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

4. Install and start the local AI model

Install Ollama, then pull the model selected by the team:

ollama pull <MODEL_NAME>

5. Browser extension

Open Chrome and go to:

chrome://extensions

Enable Developer mode → Load unpacked → select the project's extension folder.

Run

Backend

cd backend
uvicorn main:app --reload

Frontend

cd frontend
npm run dev

Then open:

http://localhost:3000

Project Documentation

Screenshots

Screenshot 1 — Main Outcognito Feed

Placeholder: Add a screenshot showing the live Outcognito feed, detected activity, generated posts, and AI comment threads.

Screenshot 2 — Seven AI Personalities

Placeholder: Add a screenshot showing the seven recurring personalities and examples of their different reactions.

Screenshot 3 — Meme Reaction & Thread

Placeholder: Add a screenshot showing an existing meme/GIF being selected for an event and used inside a comment/reply thread.

Diagrams

The architecture and workflow diagram are included above using Mermaid so they can render directly inside supported Markdown/GitHub viewers.

Hardware Documentation

Schematic & Circuit

Not applicable — Outcognito does not require custom electronic hardware.

Build Photos

Not applicable for hardware. Software/UI screenshots can be added in the placeholders above.

Project Demo

Video

ADD_DEMO_VIDEO_LINK_HERE

Placeholder: Add the final demo showing the user performing normal computer actions while Outcognito creates posts, triggers the seven personalities, retrieves reaction memes, and maintains ongoing comment threads.

Additional Demos

Live project URL: ADD_LIVE_PROJECT_LINK_HERE

GitHub repository: ADD_GITHUB_REPOSITORY_LINK_HERE

Additional demo/media: ADD_ADDITIONAL_LINK_HERE

Team Contributions

Hari S: Project concept and direction, AI/personality system, activity/context architecture, backend integration, and overall product design.

Jeevananthan S: Frontend/feed implementation, meme retrieval and reaction system integration, browser/desktop event integration, testing, and overall product development.

Contribution details can be updated before final submission to reflect the exact implementation completed by each team member.

Why Is This Useless?

Because absolutely nobody needs seven artificial personalities monitoring harmless computer activity and turning every click into a social event.

That is precisely why we built it.

Made with ❤️ at TinkerHub Useless Projects

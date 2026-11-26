# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CSS RULE — background-clip: text

Never put `background-clip: text` (or `-webkit-background-clip: text`) on an
element whose visible text lives in **child** elements. Chrome clips the
container's background onto the descendant letters and paints a frozen ghost
copy of them (with none of the children's transforms/animation), which sits
behind the real content — a Chrome-only bug (Safari doesn't do this). Put the
clip ONLY on the leaf element that directly contains the text (e.g. the
`.title-letter` spans, not the `.enter-identity-title` / `.hero-title` `<h1>`).

To make a gradient sweep continuously across many leaf elements, keep the clip
on each leaf and size/offset each one's `background-image` to its position in
the whole (see `scripts/glitch.js` → `paintContinuousGradient`) — do **not**
move the clip up to the container.

## Aesthetic & Voice — read before touching any page or copy

Full spec: `docs/Design/DESIGN.md` (authoritative). The short version every
model must follow, regardless of which model is running:

**Look: futuristic, high-end, uncluttered. An artist's site, not a template.**
- One accent, two states: steel `--accent-rest` (#9ab3d6) at rest, electric
  `--accent-active` (#5d76ff) on interaction. Never per-item colors, never
  rainbows, never default to cyan. New components read `--card-accent` or the
  rest/active pair.
- Body text is monotone off-white (`rgba(255,255,255,0.82)`). Never gradient
  or accent-colored paragraphs. That is the #1 "generic AI cyberpunk" tell.
- Presence comes from scale and material (ghost numerals, black-holographic
  surfaces, chamfered corner cuts, glass blur panels), not saturation.
- One focal point per viewport. Emphasis by dimming neighbors, not adding glow.
- Wide tracking (0.2em+) is for titles, eyebrows, labels, CTAs only. Body copy
  stays at near-normal tracking.
- Display h1s use the silver-steel fill
  `linear-gradient(180deg,#f4f7fb,#c3d2e4 52%,#93aac9)`. Hero glitch title,
  hero subtitle gradient, and sine wave are identity elements and stay as-is.
- Sine wave is unobstructed only on the landing page. Inner pages blur it
  behind glass panels.
- Resume page is the one exception: phosphor green `#3fe0a0` + monotone,
  "document" register.
- No inline `style=""` blocks for anything reusable. Put it in the page or
  shared stylesheet and use tokens from `src/styles/variables.css`.
- Every desktop CSS change gets its mobile counterpart in the same edit.

**Voice: Pablo's own words, precise, to the point.**
- No contrast framing: no "not X, but Y", "don't just X", "isn't just X; it's
  Y", "as opposed to", "most X look like…, this one…". State the thing.
- No pretentiousness, no aphorisms, no sales lines. Say what was built and
  what it does with real figures.
- Figures must match the project source. When in doubt, check the repo
  before writing a number (see commit cabc64f for the Pneuma-AI audit).
- Project names: **Pneuma-AI** (the LLM system, URL slug stays
  `/projects/pneuma`), **Pneumata** (3D anatomy), **Archetope**. Do not
  shorten Pneuma-AI to Pneuma in copy. The chat widget persona is "Pneuma"
  and is a separate thing.
- Do not take screenshots to verify UI changes. Describe the change and let
  Pablo check in the browser.

---

## Architecture

The `front-end-architecture` skill is always active for this project. Apply it whenever placing any file — page, script, stylesheet, or shared utility. See `~/.claude/skills/front-end-architecture/SKILL.md` for the zone rules and decision formula.

## Commands

```bash
npm run dev          # Start Vite dev server on port 3000 (auto-opens browser)
npm run build        # Generate sitemap/robots.txt, then build production bundle
npm run preview      # Preview the built dist folder
npm run serve        # Serve dist/ on port 3000 (mirrors Vercel/serve.json rewrites)
npm run generate:sitemap  # Regenerate sitemap.xml and robots.txt only
```

No test runner is configured.

## Architecture

Vanilla JS + CSS static site built with Vite, deployed to Vercel at `pvblocordero.com`.

**Entry points:** Vite discovers all HTML files at root (`index.html`, `home.html`, `about.html`, `skills.html`, `art.html`, `resume.html`, `404.html`) and in `projects/` (one HTML per project). Each page is its own entry point.

**URL routing:** Vercel (and `serve.json` locally) rewrites clean URLs — e.g. `/about` → `/about.html`. `index.html` is the landing page; `home.html` is the main portfolio home.

**JS modules** (`src/js/`): Imported directly by HTML pages. Key files:
- `app.js` — shared nav/core logic used across most pages
- `sineWave.js` / `mainSineWave.js` / `easterEggSineWave.js` — sine wave canvas animations
- `landing.js` — landing page specific interactions
- `magnetic.js` — magnetic cursor/element effect
- `konami.js` — Konami code easter egg
- `feathers.js`, `orb.js`, `icons.js`, `compMode.js` — miscellaneous effects

**CSS** (`src/styles/`): Modular CSS files imported per-page. Design tokens live in `tokens.css`. Typography uses IBM Plex Sans. Component styles (cursor, loader, nav, bento grid, glitch, waves) are separate files.

**Mobile responsive convention:** Mobile overrides live in a separate `*.mobile.css` file alongside each component's base file (e.g. `navigation.css` + `navigation.mobile.css`). The mobile file is imported immediately after the base file in `main.css` (or the page's own stylesheet). Never mix `@media` blocks into a base stylesheet — keep base files desktop-only, mobile files media-query-only. Breakpoints: 900px (tablet) and 600px (mobile).

**3D/graphics:** Three.js + custom GLSL shaders used in specific project pages (e.g. `transcendence.html`, `nexus-geom-lab.html`).

**Build note:** A custom Vite plugin (`copyJsPlugin` in `vite.config.js`) copies `src/js/` to `dist/src/js/` post-build, since some pages reference JS files directly rather than through Vite's module graph.

**Sitemap:** `scripts/generate-sitemap.js` auto-discovers project pages from the `projects/` directory and generates `public/sitemap.xml` and `public/robots.txt`. Runs automatically as `prebuild`. Override the domain via `SITE_URL` env var.

---

## Active Work — Chat Widget (mcpBridge.js)

`src/js/utils/mcpBridge.js` is the chat widget injected on `home.html` (and potentially other pages). It builds a floating chat panel connected to a FastAPI MCP server.

### Changes made (already in source, already pushed to GitHub, already deployed to Vercel):

1. **Removed auto-open** — there was a `setTimeout` that opened the panel automatically with a greeting message 5 seconds after page load. This was removed entirely. The panel now starts closed.

2. **Added sonar pulse animation** — the toggle button (`#mcp-chat-toggle`) now has a `::after` pseudo-element that pulses a cyan ring (`rgba(0,255,247,0.65)`) outward every 3.5s via the `chat-sonar` keyframe animation. Controlled by the `.pulse-active` class. Starts active on page load. Stops when panel opens, resumes 800ms after panel closes.

### Service worker caching — RESOLVED, do not re-diagnose

`public/sw.js` routes requests three ways, because the build emits three kinds
of file:

| Tier | Matches | Strategy |
|---|---|---|
| 1 | navigations (HTML) | network-first — always the newest page |
| 2 | `/assets/**` hashed bundles, `/images/**`, `/icons/**`, `/music/**`, media/font extensions | cache-first — zero network |
| 3 | everything else same-origin (the unhashed `/src/**` scripts) | stale-while-revalidate |

Freshness comes from the version bump, not from refetching on every load:
`scripts/bump-sw-version.js` rewrites `CACHE_NAME` on every build (`prebuild`),
and `activate` deletes every cache. A deploy empties the cache once, that first
load refetches, and every load after it is instant. On localhost the worker
unregisters itself and reloads controlled tabs so the dev server is the only
source of truth.

**A normal refresh shows the new deploy.** Do not tell Pablo to unregister the
service worker or hard-refresh — that advice is obsolete and wastes a round
trip. If something still looks stale, the suspect is Vercel's HTTP cache on the
HTML, a different layer: check response headers before saying anything.

Do not change the shape of the `const CACHE_NAME = "pablo-pistola-..."` line —
`bump-sw-version.js` matches it with a regex and fails silently if it moves.

### Key CSS details for the sonar pulse:
```css
#mcp-chat-toggle {
  position: relative;
  overflow: visible;  /* required — otherwise ::after clips */
}
#mcp-chat-toggle::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 255, 247, 0.65);
  transform: translate(-50%, -50%) scale(1);
  opacity: 0;
  pointer-events: none;
  animation: none;
}
#mcp-chat-toggle.pulse-active::after {
  animation: chat-sonar 3.5s ease-out infinite;
  animation-delay: 2s;
}
@keyframes chat-sonar {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.65; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0;    }
}
```

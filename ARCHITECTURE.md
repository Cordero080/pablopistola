# pvblocordero.com — Architecture & Separation of Concerns

Vanilla JS + CSS + HTML static site built with Vite, deployed to Vercel.

---

## Core Principle: Co-location

Everything a page needs lives next to it. HTML, CSS, and JS for a given page are siblings in the same directory.

```
src/pages/<page>/
├── index.html       ← entry point
├── *.css            ← styles for this page only (or @import manifest)
└── scripts/         ← JS for this page only
    └── *.js
```

Anything used by more than one page lives in `src/shared/`.

---

## Directory Map

```
src/
├── pages/                     ← one folder per page
│   ├── landing/               ← pvblocordero.com/
│   │   ├── index.html
│   │   ├── landing.css        ← @import manifest
│   │   ├── base.css           ← fonts, :root, body, #waves
│   │   ├── transitions.css    ← dissolve/scanline animations
│   │   ├── identity.css       ← .enter-identity, .enter-btn, responsive
│   │   ├── glitch.css         ← per-letter glitch animation system
│   │   └── scripts/
│   │       ├── glitch.js      ← builds title letter spans
│   │       ├── index.js       ← session check + enter button nav
│   │       └── rubix/         ← Three.js rotating cube background
│   │           ├── config.js  ← all tunable constants (colors, speeds, etc.)
│   │           ├── scene.js   ← renderer, camera, lights
│   │           ├── geometry.js← panels, faces, connection lines
│   │           ├── animate.js ← animation loop + math utilities
│   │           └── index.js   ← entry point (imports animate.js)
│   │
│   ├── home/                  ← pvblocordero.com/home
│   │   ├── index.html
│   │   ├── enhancements.css
│   │   ├── hero/
│   │   │   ├── hero.css
│   │   │   └── heroBrackets.js
│   │   ├── projects/
│   │   │   └── bento.css
│   │   └── scripts/
│   │       ├── homeOrchestrator.js    ← module entry (Three.js scene + GSAP)
│   │       ├── scene/                       ← Three.js WebGL wave + helpers
│   │       │   ├── homeOrchestrator.js      ← module entry (imports scene files)
│   │       │   ├── homeSineWave.js          ← Three.js WebGL WaveScene
│   │       │   ├── sectionColorTracker.js   ← updates wave colors on scroll
│   │       │   ├── scrollProgress.js        ← scroll % fed into homeSineWave
│   │       │   └── projectParallax.js       ← project card parallax
│   │       ├── effects/                     ← visual animations + interactions
│   │       │   ├── feathers.js              ← particle feather effect (comp mode)
│   │       │   ├── magnetic.js              ← magnetic cursor attraction
│   │       │   ├── parallax.js              ← hero parallax (scroll + mouse/gyro)
│   │       │   ├── cardParallax.js          ← 3D card tilt (desktop only)
│   │       │   ├── waveColors.js            ← background overlay parallax
│   │       │   └── compModeSineWave.js      ← comp mode color overrides for waveGen
│   │       ├── ui/                          ← DOM components + scroll animations
│   │       │   ├── nameScramble.js          ← logo scramble + pi animation
│   │       │   ├── bentoCards.js            ← project row entry animations
│   │       │   ├── scrollReveal.js          ← GSAP scroll reveal
│   │       │   ├── lazyImages.js            ← bento card image fade-in
│   │       │   └── orbNavScan.js            ← nav orb sweep animation
│   │       ├── konami.js                    ← ↑↑↓↓←→←→BA easter egg
│   │       ├── audioToggle.js               ← audio toggle (currently disabled)
│   │       └── index.js                     ← plain script entry (nav, contact)
│   │
│   ├── about/
│   │   └── index.html         ← uses src/shared/about/about.css
│   ├── resume/
│   │   └── index.html         ← shares about.css (same visual language)
│   ├── skills/
│   │   ├── index.html
│   │   └── index.js
│   ├── art/
│   │   ├── index.html
│   │   ├── art.css
│   │   └── index.js
│   ├── lab/
│   │   ├── index.html
│   │   └── lab.css
│   └── 404/
│       └── 404.css
│
├── shared/                    ← used by 2+ pages
│   ├── effects/
│   │   ├── sineWave.js        ← SineWaveGenerator class (no instantiation)
│   │   ├── innerSineWave.js   ← calm 3-wave config for inner pages
│   │   ├── landingSineWave.js ← dramatic 5-wave config for landing
│   │   ├── orb.js             ← floating orb cursor effect
│   │   ├── feathers.css       ← feather particle styles
│   │   └── waves.css          ← canvas wave styles
│   ├── cursor/
│   │   ├── cursor.js          ← custom cursor (used on every page)
│   │   └── cursor.css
│   ├── nav/
│   │   ├── hamburger.js       ← mobile hamburger toggle (all pages — single file)
│   │   └── navigation.css
│   ├── comp-mode/
│   │   ├── compMode.js        ← complementary color mode toggle
│   │   └── compMode.css
│   ├── about/
│   │   └── about.css          ← shared between /about and /resume
│   ├── project/
│   │   ├── gallery.js         ← image gallery for project pages
│   │   └── project.css
│   ├── loader/
│   │   └── loader.css
│   └── loader.js              ← page loading screen
│
└── js/                        ← site-wide utilities (no page-specific logic)
    ├── utils/
    │   ├── analytics.js       ← GA4 event tracking
    │   ├── serviceWorker.js   ← SW registration
    │   ├── mcpBridge.js       ← floating chat widget (MCP server)
    │   └── lenis.js           ← smooth scroll
    └── lab/
        └── xenotchi-scene.js  ← Three.js scene for lab/xenotchi page

projects/                      ← one HTML per project (legacy flat structure)
    *.html                     ← each references src/shared/* and ../src/js/utils/*
```

---

## The Three Zones

### 1. `src/pages/<page>/` — Page-specific
HTML, CSS, and JS that belong to exactly one page. If you delete the page, these files go with it. No other page should import from here.

### 2. `src/shared/` — Truly shared
Used by 2 or more pages. Organized by what it does (`effects/`, `nav/`, `cursor/`, `project/`). Adding something here means it's a deliberate decision that it crosses page boundaries.

### 3. `src/js/utils/` — Site-wide infrastructure
Not tied to any page — analytics, service worker, the chat widget, smooth scroll. These could be on every page. No page-specific logic here.

---

## Wave System

Two completely separate wave systems exist on this site:

| System | File | Technology | Used on |
|--------|------|------------|---------|
| `SineWaveGenerator` | `src/shared/effects/sineWave.js` | Canvas 2D | Landing, inner pages |
| `WaveScene` | `src/pages/home/scripts/homeSineWave.js` | Three.js WebGL | Home only |

The Canvas 2D system has two configs:
- `landingSineWave.js` — 5 dramatic waves, high amplitude
- `innerSineWave.js` — 3 calm waves, low amplitude

`compModeSineWave.js` modifies the existing `window.waveGen.waves` strokeStyles for complementary color mode on home; it is not a separate wave generator.

---

## Build System

**Entry points:** `vite.config.js` uses `globSync` to discover all `*.html` files in root, `src/pages/**`, and `projects/**`. Each HTML is its own Rollup entry.

**JS copying:** A `copyJsPlugin` copies `src/js/`, `src/shared/`, and `src/pages/` to `dist/` after build, substituting `__VITE_MCP_URL__` placeholders. This is needed because non-module `<script defer>` tags reference JS by absolute path rather than through Vite's module graph.

**URL routing:** `vercel.json` (production) and `serve.json` (local preview) rewrite clean URLs:
- `/` → `src/pages/landing/index.html`
- `/home` → `src/pages/home/index.html`
- etc.

**Dev server:** The `landing-dev-rewrite` Vite plugin intercepts `/` and `/index.html` in dev mode and serves `src/pages/landing/index.html`.

---

## Adding a New Page

1. Create `src/pages/<name>/index.html`
2. Put page CSS alongside it (or split into sub-files with an `@import` manifest)
3. Put page JS in `src/pages/<name>/scripts/`
4. Add a rewrite to both `vercel.json` and `serve.json`
5. If the page uses the sine wave, load `sineWave.js` + `innerSineWave.js` from `src/shared/effects/`
6. Load `cursor.js` and `analytics.js` from shared/utils as needed

## Adding a New Project Page

1. Create `projects/<name>.html`
2. Reference shared scripts with `../src/shared/...` paths
3. The page is auto-discovered by `globSync("projects/**/*.html")` in `vite.config.js`

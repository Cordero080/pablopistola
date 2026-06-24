# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

**3D/graphics:** Three.js + custom GLSL shaders used in specific project pages (e.g. `transcendence.html`, `nexus-geom-lab.html`).

**Build note:** A custom Vite plugin (`copyJsPlugin` in `vite.config.js`) copies `src/js/` to `dist/src/js/` post-build, since some pages reference JS files directly rather than through Vite's module graph.

**Sitemap:** `scripts/generate-sitemap.js` auto-discovers project pages from the `projects/` directory and generates `public/sitemap.xml` and `public/robots.txt`. Runs automatically as `prebuild`. Override the domain via `SITE_URL` env var.

---

## Active Work — Chat Widget (mcpBridge.js)

`src/js/utils/mcpBridge.js` is the chat widget injected on `home.html` (and potentially other pages). It builds a floating chat panel connected to a FastAPI MCP server.

### Changes made (already in source, already pushed to GitHub, already deployed to Vercel):

1. **Removed auto-open** — there was a `setTimeout` that opened the panel automatically with a greeting message 5 seconds after page load. This was removed entirely. The panel now starts closed.

2. **Added sonar pulse animation** — the toggle button (`#mcp-chat-toggle`) now has a `::after` pseudo-element that pulses a cyan ring (`rgba(0,255,247,0.65)`) outward every 3.5s via the `chat-sonar` keyframe animation. Controlled by the `.pulse-active` class. Starts active on page load. Stops when panel opens, resumes 800ms after panel closes.

### Why the changes may not be visible on the live site:

The site uses a **service worker** (`sw.js`) that caches all assets aggressively. Even after a new Vercel deployment, the browser may still be running the old cached `mcpBridge.js`.

**Fix for a user seeing the old version:**
1. Open DevTools → Application → Service Workers → Unregister
2. Hard refresh (`Cmd+Shift+R`)

**Fix for all users permanently:**
The `sw.js` cache name was already bumped to a timestamp (`pablo-pistola-<timestamp>`) in the last commit. This causes the service worker to invalidate the old cache on next visit. Most users will see the update within 24h as their SW update cycle runs.

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

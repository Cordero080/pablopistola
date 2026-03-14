# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

# Landing page — disabled at the route (2026-10-02)

The splash/landing page is **switched off, not deleted**. Every file still
exists and still builds. It is disabled by a single redirect in `vercel.json`.

## Why

Job search. A cold visitor (recruiter, hiring manager) hitting
`pvblocordero.com` for the first time had to sit through ~3s of title
animation plus a Three.js rubix cube before an Enter button appeared, then
make one extra click before seeing any actual work. Returning visitors inside
the same session already skipped it via `sessionStorage.skippedLanding`, so the
cost fell entirely on first-time arrivals — exactly the audience that matters
right now.

## What changed

**1. `vercel.json` — the switch.**

```json
"redirects": [
  {
    "source": "/",
    "missing": [{ "type": "query", "key": "stay" }],
    "destination": "/home",
    "permanent": false
  }
]
```

`permanent: false` emits a 307, deliberately. A 308 is cached hard by browsers
and is painful to reverse — do not change this to `true`.

The `missing` condition is what keeps zen mode alive: `/?stay` carries the
query key, so it does not match the redirect and falls through to the landing.

**2. `src/pages/landing/index.html` — GA property.**

Was `G-G4CML32H7J`, a separate GA4 property from the rest of the site. Because
the Enter button navigates to `/home` (which reports to `G-ZL1CZZKRKD`), a
session in the landing property could never contain a second pageview, so its
bounce rate was pinned near 100% by construction — it measured nothing. Now on
`G-ZL1CZZKRKD` with every other page.

**3. `manifest.json` — `start_url`.**

Was `"."` (resolves to `/`), now `"/?stay"`, so an installed PWA still opens on
the landing and the standalone branch at
`src/pages/landing/scripts/index.js:8-10` stays reachable.

## What still works

- `/?stay` — zen mode, the landing with the repositioned button.
- `npm run dev` and `npm run serve` still serve the landing at `/` locally.
  `serve.json` has no support for the `missing` condition, so the redirect was
  deliberately not mirrored there. Local and production diverge at `/` only.
  This is convenient while the landing is off: you can keep working on it.
- All landing source: `src/pages/landing/`, the rubix cube, `glitch.js`,
  `landingSineWave.js`. Untouched.
- Vite still builds `dist/index.html` from the landing. The file ships; the
  redirect just means nobody is routed to it.

## To turn it back on

Delete the `redirects` block from `vercel.json`. That is the whole revert.

Optionally also set `manifest.json` `start_url` back to `"."`.

Because the redirect is a 307, browsers will pick up the change immediately —
no cache purge needed.

## Before re-enabling, consider

- Add a `gtag` event on the Enter click
  (`src/pages/landing/scripts/index.js:99`). There is currently no event there,
  which is why there was never any data on how many people abandoned at the
  splash versus went through. Without it, turning the landing back on is
  flying blind again.
- Cut the ~3s delay before the button is actionable
  (`src/pages/landing/scripts/index.js:84-89`) if the gate returns.

## Baseline data

Since `/` now redirects, almost nobody reaches the landing, so there is no
landing baseline to gather. The meaningful number is `/home` as the entry page
in `G-ZL1CZZKRKD`, which already tracks correctly. Compare engagement rate for
`/home`-as-entry before and after 2026-10-02.

## Known unrelated issue found while doing this

`manifest.json` lives at the project root and is **not** copied into `dist/`,
so `/manifest.json` 404s in production — the site is not actually installable
as a PWA from the live URL today. The `start_url` change above is correct for
whenever that gets fixed, but it has no effect until the manifest is served.
Fix would be moving it to `public/` (where Vite copies it verbatim) alongside
`sw.js` and the icons.

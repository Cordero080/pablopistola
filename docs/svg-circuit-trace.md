# SVG Circuit Trace — Scroll-Triggered Draw

A horizontal PCB-style circuit trace that draws itself when it enters the viewport.
Originally used as a divider between the hero and projects grid on `home.html`.

---

## HTML

```html
<!-- SVG Circuit Trace — draws itself as it enters viewport -->
<div class="svg-trace-container" aria-hidden="true">
  <svg class="svg-trace" viewBox="0 0 1100 90" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Left anchor dot -->
    <circle class="trace-dot trace-dot--left"  cx="30"  cy="45" r="4" />
    <!-- Right anchor dot -->
    <circle class="trace-dot trace-dot--right" cx="1070" cy="45" r="4" />

    <!-- Main horizontal trace with circuit jogs -->
    <path class="trace-path" d="
      M 30 45
      L 120 45
      L 140 25
      L 200 25
      L 220 45
      L 340 45
      L 360 65
      L 420 65
      L 440 45
      L 520 45
      L 540 25
      L 580 25
      L 600 45
      L 680 45
      L 700 65
      L 740 65
      L 760 45
      L 860 45
      L 880 25
      L 940 25
      L 960 45
      L 1070 45
    " />

    <!-- Decorative tick marks -->
    <line class="trace-tick" x1="220" y1="38" x2="220" y2="52" />
    <line class="trace-tick" x1="440" y1="38" x2="440" y2="52" />
    <line class="trace-tick" x1="600" y1="38" x2="600" y2="52" />
    <line class="trace-tick" x1="760" y1="38" x2="760" y2="52" />
    <line class="trace-tick" x1="960" y1="38" x2="960" y2="52" />

    <!-- Node circles at jog points -->
    <circle class="trace-node" cx="220" cy="45" r="3" />
    <circle class="trace-node" cx="440" cy="45" r="3" />
    <circle class="trace-node" cx="600" cy="45" r="3" />
    <circle class="trace-node" cx="760" cy="45" r="3" />
    <circle class="trace-node" cx="960" cy="45" r="3" />
  </svg>
</div>
```

---

## CSS

```css
/* ==========================================
   SVG CIRCUIT TRACE — scroll-triggered draw
   ========================================== */

.svg-trace-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
  overflow: visible;
}

.svg-trace {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

/* Main path — drawn via stroke-dashoffset */
.trace-path {
  stroke: rgba(107, 123, 255, 0.55);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  /* JS sets stroke-dasharray/dashoffset on load */
  filter: drop-shadow(0 0 4px rgba(107, 123, 255, 0.5));
  transition: stroke 0.4s ease;
}

/* Pulse glow on the path when fully drawn */
.svg-trace.trace-drawn .trace-path {
  animation: trace-pulse 3s ease-in-out infinite;
}

@keyframes trace-pulse {
  0%, 100% { stroke: rgba(107, 123, 255, 0.55); filter: drop-shadow(0 0 4px rgba(107, 123, 255, 0.5)); }
  50%       { stroke: rgba(0, 212, 255, 0.7);    filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.7)); }
}

/* Anchor dots */
.trace-dot {
  fill: #6b7bff;
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: drop-shadow(0 0 5px #6b7bff);
}

.svg-trace.trace-drawn .trace-dot {
  opacity: 1;
}

/* Tick marks */
.trace-tick {
  stroke: rgba(107, 123, 255, 0.4);
  stroke-width: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.svg-trace.trace-drawn .trace-tick {
  opacity: 1;
}

/* Node circles */
.trace-node {
  fill: none;
  stroke: rgba(0, 212, 255, 0.7);
  stroke-width: 1.5;
  opacity: 0;
  transform-origin: center;
  transition: opacity 0.2s ease, transform 0.3s ease;
  transform: scale(0);
}

.svg-trace.trace-drawn .trace-node {
  opacity: 1;
  transform: scale(1);
}

@media (max-width: 600px) {
  .svg-trace-container {
    padding: 0 1rem;
  }
}
```

---

## JavaScript

```js
// ── SVG Circuit Trace — scroll-triggered path draw ───────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const traceSvg  = document.querySelector(".svg-trace");
  const tracePath = document.querySelector(".trace-path");
  if (!traceSvg || !tracePath) return;

  // Measure the full path length and set up dash
  const pathLen = tracePath.getTotalLength();
  tracePath.style.strokeDasharray  = pathLen;
  tracePath.style.strokeDashoffset = pathLen;
  tracePath.style.transition = "none";

  let drawn = false;

  const traceObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !drawn) {
          drawn = true;

          // Animate the draw over ~1.4s
          tracePath.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)";
          tracePath.style.strokeDashoffset = "0";

          // After path is drawn, reveal decorations
          setTimeout(() => {
            traceSvg.classList.add("trace-drawn");
          }, 1200);

          traceObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  traceObserver.observe(traceSvg);
});
```

---

## Notes

- The big curved/flowing waves visible behind the trace in the screenshot come from the **sineWave canvas** (`#waves`), not this component.
- The path uses only `L` (lineto) commands with jogs — no bezier curves. To add curves, replace `L` segments with `C` or `Q` commands.
- Reusable anywhere: drop in the HTML, include the CSS block, and include the JS block (or adapt it to an IntersectionObserver already on the page).

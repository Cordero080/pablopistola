// heroAscii.js

const HERO_ASCII_TEXT = "PVBLO C0RDERO";
const CELL_W = 10;
const CELL_H = 16;
const TICK_MS = 80;
const ASSEMBLE_MS = 5000;
const DISSOLVE_STAGGER = 1800;
const FADE_IN_MS = 280;
const FADE_OUT_MS = 600;

const SPEED_GROUPS = [
  { chars: "0123456789ABCDEF", every: 1 },
  { chars: "pvblo@#!&$?~^|;", every: 22 },
  { chars: ".,_-+=<>()[]{}", every: 50 },
];

function initHeroAscii() {
  const hero = document.querySelector(".hero-section");
  if (!hero) {
    console.warn("[heroAscii] .hero-section not found");
    return;
  }

  const cW = hero.offsetWidth;
  const cH = hero.offsetHeight;
  if (cW < 10 || cH < 10) {
    console.warn("[heroAscii] hero has no size", cW, cH);
    return;
  }

  console.log("[heroAscii] starting", cW, "x", cH);

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.width = cW;
  canvas.height = cH;
  canvas.style.cssText = `position:absolute;top:0;left:0;width:${cW}px;height:${cH}px;pointer-events:none;z-index:1;`;
  hero.insertBefore(canvas, hero.firstChild);
  const ctx = canvas.getContext("2d");

  function buildMask() {
    const off = document.createElement("canvas");
    off.width = cW;
    off.height = cH;
    const octx = off.getContext("2d");
    octx.fillStyle = "#000";
    octx.fillRect(0, 0, cW, cH);
    octx.font = "100px 'Future Z', sans-serif";
    const w = octx.measureText(HERO_ASCII_TEXT).width || 1;
    const fs = Math.max(8, Math.floor((100 * (cW * 0.88)) / w));
    octx.font = `${fs}px 'Future Z', sans-serif`;
    octx.fillStyle = "#fff";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillText(HERO_ASCII_TEXT, cW / 2, cH / 2);
    const data = octx.getImageData(0, 0, cW, cH).data;
    const mask = new Uint8Array(cW * cH);
    let lit = 0;
    for (let i = 0; i < cW * cH; i++) {
      mask[i] = data[i * 4] > 128 ? 1 : 0;
      if (mask[i]) lit++;
    }
    console.log("[heroAscii] mask lit pixels:", lit);
    return mask;
  }

  function buildCells(mask) {
    const cols = Math.ceil(cW / CELL_W),
      rows = Math.ceil(cH / CELL_H),
      mid = rows >> 1;
    const DIRS = ["top-down", "bottom-up", "center-out"],
      BAND = 4;
    const bDir = Array.from(
      { length: Math.ceil(cols / BAND) },
      () => DIRS[(Math.random() * 3) | 0],
    );
    const cells = [];
    let ci = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++, ci++) {
        const sx = Math.min(col * CELL_W + (CELL_W >> 1), cW - 1);
        const sy = Math.min(row * CELL_H + (CELL_H >> 1), cH - 1);
        if (!mask[sy * cW + sx]) continue;
        const dir = bDir[(col / BAND) | 0];
        const order =
          dir === "top-down"
            ? row
            : dir === "bottom-up"
              ? rows - 1 - row
              : Math.abs(row - mid);
        let t = (order / Math.max(1, rows - 1)) * ASSEMBLE_MS;
        const rv = Math.random();
        if (rv > 0.8) t += Math.random() * ASSEMBLE_MS * 0.35;
        else if (rv > 0.55) t += Math.random() * ASSEMBLE_MS * 0.08;
        t += (Math.random() - 0.5) * ASSEMBLE_MS * 0.04;
        const gIdx = ci % SPEED_GROUPS.length;
        const g = SPEED_GROUPS[gIdx];
        cells.push({
          group: gIdx,
          char: g.chars[(Math.random() * g.chars.length) | 0],
          gx: col * CELL_W,
          gy: row * CELL_H,
          revealAt: Math.max(0, Math.min(ASSEMBLE_MS, t)),
          dissolveAt: ASSEMBLE_MS + Math.random() * DISSOLVE_STAGGER,
        });
      }
    }
    console.log("[heroAscii] cells:", cells.length);
    return cells;
  }

  const mask = buildMask();
  const cells = buildCells(mask);
  const t0 = Date.now();
  let tick = 0;
  const doneAt = ASSEMBLE_MS + DISSOLVE_STAGGER + FADE_OUT_MS;

  setInterval(() => {
    tick++;
    const now = Date.now() - t0;
    if (now > doneAt) {
      canvas.remove();
      return;
    }
    ctx.clearRect(0, 0, cW, cH);
    ctx.font = 'bold 11px "Courier New",monospace';
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      if (now < c.revealAt) continue;
      const g = SPEED_GROUPS[c.group];
      if (tick % g.every === 0)
        c.char = g.chars[(Math.random() * g.chars.length) | 0];
      const age = now - c.revealAt;
      let op;
      if (now < c.dissolveAt) {
        op = Math.min(1, age / FADE_IN_MS) * 0.55;
      } else {
        const out = now - c.dissolveAt;
        if (out > FADE_OUT_MS) continue;
        op = (1 - out / FADE_OUT_MS) * 0.55;
      }
      ctx.fillStyle = `rgba(235,225,205,${op.toFixed(3)})`;
      ctx.fillText(c.char, c.gx, c.gy + CELL_H);
    }
  }, TICK_MS);
}

// Guard: if load already fired (defer timing), run immediately; otherwise wait.
if (document.readyState === "complete") {
  document.fonts.ready.then(initHeroAscii);
} else {
  window.addEventListener(
    "load",
    () => document.fonts.ready.then(initHeroAscii),
    { once: true },
  );
}

// Wave colors for comp (light) mode and default dark mode.
// Called by waveColors.js whenever the user toggles comp mode (C key or title hover).

function initEasterEggColors() {
  if (!window.waveGen || !window.waveGen.ctx) return;

  // ── Comp mode wave gradient ──────────────────────────────────────────────────
  // Left → right color sweep applied to every wave in light mode.
  // Edit these stops to change what the sine wave looks like in comp mode.
  const gradient = window.waveGen.ctx.createLinearGradient(
    0,
    0,
    window.waveGen.width,
    0,
  );
  gradient.addColorStop(0, "#022513cd");
  gradient.addColorStop(0.2, "#00ff80");
  gradient.addColorStop(0.5, "#ffaa00");
  gradient.addColorStop(1, "#ff4500");

  window.waveGen.waves.forEach((w) => (w.strokeStyle = gradient));
}

function resetMainColors() {
  if (!window.waveGen || !window.waveGen.ctx) return;

  // ── Default (dark mode) wave gradient ───────────────────────────────────────
  // Restored when comp mode turns off.
  // Edit these stops to change the normal sine wave colors.
  const gradient = window.waveGen.ctx.createLinearGradient(
    0,
    0,
    window.waveGen.width,
    0,
  );
  gradient.addColorStop(0, "pink");
  gradient.addColorStop(0.2, "magenta");
  gradient.addColorStop(0.5, "blue");
  gradient.addColorStop(1, "turquoise");

  window.waveGen.waves.forEach((w) => (w.strokeStyle = gradient));
}

window.initEasterEggColors = initEasterEggColors;
window.resetMainColors = resetMainColors;

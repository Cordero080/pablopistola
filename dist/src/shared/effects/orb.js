// Quantum Ripple Orb Animation Script
// Moved from index.html
if (!window.qrColorScriptLoaded) {
  window.qrColorScriptLoaded = true;
  const colors = [
    { g1: "#0c2f74ff", g2: "#151c5c", g3: "#0c2c45", glow: "#2d3bba" },
    { g1: "#114773", g2: "#05224eff", g3: "#131b5e", glow: "#103655a7" },
    { g1: "#0d113b", g2: "#22223b", g3: "#253b4e", glow: "#22223b" },
    { g1: "#02050a", g2: "#0d6788ff", g3: "#031010", glow: "#3a86ff" },
    { g1: "#5e60ce", g2: "#48bfe387", g3: "rgb(63, 34, 167)", glow: "#0b6884ff" },
    { g1: "#22223b", g2: "#6b7bff", g3: "#5e60ce", glow: "#22223b" },
    { g1: "rgb(9, 40, 49)", g2: "#5e60ce", g3: "#1c0434", glow: "#5e60ce" },
    { g1: "#6b7bff", g2: "#3a86ff", g3: "#152e8aff", glow: "#274f90c2" },
  ];
  let idx = 0,
    t = 0;
  function lerp(a, b, t) {
    a = a.replace("#", "");
    b = b.replace("#", "");
    let ar = parseInt(a.substring(0, 2), 16),
      ag = parseInt(a.substring(2, 4), 16),
      ab = parseInt(a.substring(4, 6), 16);
    let br = parseInt(b.substring(0, 2), 16),
      bg = parseInt(b.substring(2, 4), 16),
      bb = parseInt(b.substring(4, 6), 16);
    let r = Math.round(ar + (br - ar) * t),
      g = Math.round(ag + (bg - ag) * t),
      b_ = Math.round(ab + (bb - ab) * t);
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b_.toString(16).padStart(2, "0")}`;
  }
  setInterval(() => {
    idx = (idx + 1) % colors.length;
    t = 0;
  }, 3200);
  setInterval(() => {
    t = Math.min(t + 0.04, 1);
    const c1 = lerp(colors[idx].g1, colors[(idx + 1) % colors.length].g1, t);
    const c2 = lerp(colors[idx].g2, colors[(idx + 1) % colors.length].g2, t);
    const c3 = lerp(colors[idx].g3, colors[(idx + 1) % colors.length].g3, t);
    const glow = lerp(
      colors[idx].glow,
      colors[(idx + 1) % colors.length].glow,
      t
    );
    const root = document.documentElement;
    root.style.setProperty("--qr-color1", c1);
    root.style.setProperty("--qr-color2", c2);
    root.style.setProperty("--qr-color3", c3);
    root.style.setProperty("--qr-glow", glow);
  }, 80);
}

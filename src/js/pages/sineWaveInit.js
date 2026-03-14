// Initialize sine wave background for non-home pages
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("waves");
  if (canvas && typeof SineWave !== "undefined") {
    new SineWave(canvas, {
      speed: 0.008,
      amplitude: 40,
      wavelength: 0.015,
      strokeStyle: "rgba(0, 255, 247, 0.08)",
    });
  }
});

// Complementary Mode JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Keyboard shortcut — press C to toggle
  document.addEventListener("keydown", function (event) {
    if (event.key === "c" || event.key === "C") {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (typeof window.toggleComplementaryColors === "function") {
        window.toggleComplementaryColors();
      } else {
        document.body.classList.toggle("complementary-colors");
      }
    }
  });

  // Inverted-V hover — flip to regular V (CSS) and toggle comp mode (JS)
  const invertedV = document.querySelector(".title-inverted-v");
  if (invertedV) {
    invertedV.addEventListener("mouseenter", () => {
      document.body.classList.toggle("complementary-colors");
    });
  }
});

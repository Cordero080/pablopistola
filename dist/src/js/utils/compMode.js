// Complementary Mode JavaScript
document.addEventListener("DOMContentLoaded", function () {
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
});

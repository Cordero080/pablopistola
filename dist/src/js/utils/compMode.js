// Complementary Mode JavaScript
document.addEventListener("DOMContentLoaded", function () {
  function toggleComplementaryMode() {
    document.body.classList.toggle("complementary-colors");
  }

  // Toggle with 'C' key (skip when typing in an input/textarea)
  document.addEventListener("keydown", function (event) {
    if (event.key === "c" || event.key === "C") {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      toggleComplementaryMode();
    }
  });

  // Toggle on hover over #myName
  var myName = document.getElementById("myName");
  if (myName) {
    // Removed mouseenter and mouseleave listeners for #myName. Only app.js controls complementary mode.
  }
});

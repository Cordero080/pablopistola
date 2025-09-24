// Complementary Mode JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Add complementary mode toggle functionality here
  // This file was referenced in index.html but was missing

  function toggleComplementaryMode() {
    document.body.classList.toggle("complementary-colors");
  }

  // You can add event listeners here for complementary mode functionality
  // For example, keyboard shortcuts or UI buttons

  // Example: Toggle with 'C' key
  document.addEventListener("keydown", function (event) {
    if (event.key === "c" || event.key === "C") {
      toggleComplementaryMode();
    }
  });
});

// Complementary Mode JavaScript
document.addEventListener("DOMContentLoaded", function () {
  function toggleComplementaryMode() {
    document.body.classList.toggle("complementary-colors");
  }

  // Toggle with 'C' key
  document.addEventListener("keydown", function (event) {
    if (event.key === "c" || event.key === "C") {
      toggleComplementaryMode();
    }
  });

  // Toggle on hover over #myName
  var myName = document.getElementById("myName");
  if (myName) {
    myName.addEventListener("mouseenter", function () {
      document.body.classList.add("complementary-colors");
    });
    myName.addEventListener("mouseleave", function () {
      document.body.classList.remove("complementary-colors");
    });
  }
});

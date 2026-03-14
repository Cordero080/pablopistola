// Page loader dismiss logic
window.addEventListener("load", () => {
  const loader = document.getElementById("pageLoader");
  if (loader) {
    const fromLanding = sessionStorage.getItem("skippedLanding");
    setTimeout(
      () => {
        loader.classList.add("hidden");
      },
      fromLanding ? 0 : 800,
    );
  }
});

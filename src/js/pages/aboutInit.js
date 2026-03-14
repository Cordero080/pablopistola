// Shared init for about/resume pages: sine wave background + hamburger menu
document.addEventListener("DOMContentLoaded", () => {
  // Initialize sine wave background
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

// Mobile hamburger menu toggle
(function () {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sideNav = document.querySelector(".side-nav");
  const navLinks = document.querySelectorAll(".side-nav-link");

  if (hamburgerBtn && sideNav) {
    hamburgerBtn.addEventListener("click", () => {
      const isOpen = sideNav.classList.toggle("menu-open");
      hamburgerBtn.classList.toggle("active");
      hamburgerBtn.setAttribute("aria-expanded", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        sideNav.classList.remove("menu-open");
        hamburgerBtn.classList.remove("active");
        hamburgerBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sideNav.classList.contains("menu-open")) {
        sideNav.classList.remove("menu-open");
        hamburgerBtn.classList.remove("active");
        hamburgerBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }
})();

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

      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close menu when clicking a link
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        sideNav.classList.remove("menu-open");
        hamburgerBtn.classList.remove("active");
        hamburgerBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    // Close menu on escape key
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

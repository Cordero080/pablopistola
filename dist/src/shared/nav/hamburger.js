// Mobile hamburger menu toggle — shared across all inner pages and project pages
(function () {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sideNav = document.querySelector(".side-nav");
  const navLinks = document.querySelectorAll(".side-nav-link");

  if (!hamburgerBtn || !sideNav) return;

  function close() {
    sideNav.classList.remove("menu-open");
    hamburgerBtn.classList.remove("active");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  hamburgerBtn.addEventListener("click", () => {
    const isOpen = sideNav.classList.toggle("menu-open");
    hamburgerBtn.classList.toggle("active");
    hamburgerBtn.setAttribute("aria-expanded", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  navLinks.forEach((link) => link.addEventListener("click", close));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sideNav.classList.contains("menu-open")) close();
  });
})();

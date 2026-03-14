// Skills page: hamburger menu + skill bar scroll animation
(function () {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sideNav = document.querySelector(".side-nav");
  if (hamburgerBtn && sideNav) {
    hamburgerBtn.addEventListener("click", () => {
      sideNav.classList.toggle("menu-open");
      hamburgerBtn.classList.toggle("active");
      document.body.style.overflow = sideNav.classList.contains("menu-open")
        ? "hidden"
        : "";
    });
    document.querySelectorAll(".side-nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        sideNav.classList.remove("menu-open");
        hamburgerBtn.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }

  // Animate bars on scroll
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const p = e.target.querySelector(".skill-progress");
          if (p) {
            const w = p.style.width;
            p.style.width = "0";
            setTimeout(() => (p.style.width = w), 100);
          }
        }
      });
    },
    { threshold: 0.2 },
  );
  document.querySelectorAll(".skill-card").forEach((c) => obs.observe(c));
})();

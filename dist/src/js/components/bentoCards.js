// IntersectionObserver for project row entry animations
const projectRows = document.querySelectorAll(".project-row");

const rowObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        rowObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px",
  },
);

projectRows.forEach((row) => rowObserver.observe(row));

// Subtle image parallax on scroll
function updateParallax() {
  const viewportCenter = window.innerHeight / 2;
  projectRows.forEach((row) => {
    const img = row.querySelector(".project-card-media img");
    if (!img) return;
    const rect = row.getBoundingClientRect();
    const rowCenter = rect.top + rect.height / 2;
    const offset = rowCenter - viewportCenter;
    img.style.transform = `scale(1.08) translateY(${offset * 0.07}px)`;
  });
}

window.addEventListener("scroll", updateParallax, { passive: true });
document.addEventListener("DOMContentLoaded", updateParallax);

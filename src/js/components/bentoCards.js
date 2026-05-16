// IntersectionObserver for project row entry animations
const projectRows = document.querySelectorAll(".project-row");
const isMobile = window.matchMedia("(max-width: 768px)").matches;

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
    threshold: isMobile ? 0.05 : 0.12,
    rootMargin: isMobile ? "0px 0px 0px 0px" : "0px 0px -40px 0px",
  },
);

// Small delay so first cards are painted in hidden state before observer fires
setTimeout(() => {
  projectRows.forEach((row) => rowObserver.observe(row));
}, 100);

// Subtle image parallax on scroll — desktop only
if (!isMobile) {
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
}

// Inject WATCH DEMO or COMING SOON below each View Project CTA
function injectDemoLinks() {
  document.querySelectorAll(".project-card-info").forEach((info) => {
    const youtubeUrl = info.dataset.youtube;
    const cta = info.querySelector(".project-card-cta");
    if (!cta) return;

    if (youtubeUrl) {
      const link = document.createElement("a");
      link.className = "project-card-demo";
      link.href = youtubeUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", "Watch demo on YouTube");
      link.innerHTML =
        `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` +
        `Watch Demo`;
      cta.insertAdjacentElement("afterend", link);
    } else {
      const soon = document.createElement("span");
      soon.className = "project-card-coming-soon";
      soon.textContent = "Coming Soon";
      cta.insertAdjacentElement("afterend", soon);
    }
  });
}

document.addEventListener("DOMContentLoaded", injectDemoLinks);

const projectRows = document.querySelectorAll(".project-row");
const isMobile = window.matchMedia("(max-width: 768px)").matches;

// Gel tilt on card image panels — desktop only
if (!isMobile) {
  const TILT_MAX = 3.5;
  const lerp = (a, b, t) => a + (b - a) * t;

  projectRows.forEach((row) => {
    const card = row.querySelector(".project-card-link");
    if (!card) return;

    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;
    let rafId = null;
    let active = false;

    function tick() {
      cx = lerp(cx, tx, 0.1);
      cy = lerp(cy, ty, 0.1);
      card.style.transform = `perspective(700px) rotateX(${cx}deg) rotateY(${cy}deg)`;
      const done = Math.abs(cx - tx) < 0.01 && Math.abs(cy - ty) < 0.01;
      if (done) {
        cx = tx;
        cy = ty;
        if (!active) card.style.transform = "";
        rafId = null;
      } else {
        rafId = requestAnimationFrame(tick);
      }
    }

    function startTick() {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      tx = -((e.clientY - r.top) / r.height - 0.5) * 2 * TILT_MAX;
      ty = ((e.clientX - r.left) / r.width - 0.5) * 2 * TILT_MAX;
      active = true;
      startTick();
    });

    card.addEventListener("mouseleave", () => {
      tx = 0;
      ty = 0;
      active = false;
      startTick();
    });
  });
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

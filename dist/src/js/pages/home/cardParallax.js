// 3D tilt parallax on project card images — desktop only
(function () {
  if (window.matchMedia("(hover: none)").matches) return;

  document.querySelectorAll(".project-card-link").forEach((card) => {
    let rafId;
    let targetX = 0,
      targetY = 0,
      curX = 0,
      curY = 0;
    let active = false;

    function tick() {
      curX += (targetX - curX) * 0.1;
      curY += (targetY - curY) * 0.1;
      card.style.transform = `perspective(1000px) rotateY(${curX}deg) rotateX(${-curY}deg)`;
      if (active || Math.abs(curX) > 0.02 || Math.abs(curY) > 0.02) {
        rafId = requestAnimationFrame(tick);
      } else {
        card.style.transform = "";
      }
    }

    card.addEventListener("mouseenter", () => {
      active = true;
      cancelAnimationFrame(rafId);
      tick();
    });

    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width - 0.5) * 7;
      targetY = ((e.clientY - r.top) / r.height - 0.5) * 7;
    });

    card.addEventListener("mouseleave", () => {
      active = false;
      targetX = 0;
      targetY = 0;
    });
  });
})();

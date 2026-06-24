// Skills page: hamburger menu + drag-to-scroll tickers
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

  // Drag-to-scroll on each ticker track
  document.querySelectorAll(".ticker-wrap").forEach((wrap) => {
    const track = wrap.querySelector(".ticker-track");
    if (!track) return;

    let isDragging = false;
    let startX = 0;
    let dragOffset = 0;
    let currentOffset = 0;
    let resumeTimer = null;

    function pauseAnim() {
      track.style.animationPlayState = "paused";
      // Capture where the animation visually is
      const style = getComputedStyle(track);
      const matrix = new DOMMatrix(style.transform);
      currentOffset = matrix.m41;
      track.style.transform = `translateX(${currentOffset}px)`;
      track.style.animation = "none";
    }

    function resumeAnim() {
      track.style.transform = "";
      track.style.animation = "";
      track.style.animationPlayState = "";
    }

    wrap.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      dragOffset = currentOffset;
      wrap.style.cursor = "grabbing";
      clearTimeout(resumeTimer);
      pauseAnim();
      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const delta = e.clientX - startX;
      currentOffset = dragOffset + delta;
      track.style.transform = `translateX(${currentOffset}px)`;
    });

    window.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      wrap.style.cursor = "";
      resumeTimer = setTimeout(resumeAnim, 800);
    });

    // Touch support
    wrap.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
        dragOffset = currentOffset;
        clearTimeout(resumeTimer);
        pauseAnim();
      },
      { passive: true },
    );

    wrap.addEventListener(
      "touchmove",
      (e) => {
        const delta = e.touches[0].clientX - startX;
        currentOffset = dragOffset + delta;
        track.style.transform = `translateX(${currentOffset}px)`;
      },
      { passive: true },
    );

    wrap.addEventListener("touchend", () => {
      resumeTimer = setTimeout(resumeAnim, 800);
    });
  });
})();

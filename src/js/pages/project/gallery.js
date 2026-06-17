// Gallery thumbnail click handler for project pages
document.querySelectorAll(".gallery-thumbs .thumb").forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const heroImg = document.querySelector(".gallery-hero-img");
    const newSrc = thumb.dataset.full;
    heroImg.src = newSrc;

    // Toggle architecture class for wireframes/ERDs, or galleries flagged to always contain
    const gallerySection = document.querySelector(".project-gallery");
    const alwaysContain =
      gallerySection && gallerySection.dataset.contain === "true";
    if (
      alwaysContain ||
      (newSrc && (newSrc.includes("wireframe") || newSrc.includes("erd")))
    ) {
      heroImg.classList.add("architecture-img");
    } else {
      heroImg.classList.remove("architecture-img");
    }

    document
      .querySelectorAll(".thumb, .arch-thumb")
      .forEach((t) => t.classList.remove("active"));
    thumb.classList.add("active");
  });
});

// Architecture section thumbnails (used on some project pages)
document
  .querySelectorAll(".architecture-section .arch-thumb")
  .forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const heroImg = document.querySelector(".gallery-hero-img");
      heroImg.src = thumb.dataset.full;
      heroImg.classList.add("architecture-img");

      document
        .querySelectorAll(".thumb, .arch-thumb")
        .forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

// Belt loop filler — clone track items until width exceeds 3× the container
requestAnimationFrame(() => {
  const track = document.querySelector(".project-links-track");
  if (!track) return;
  const belt = track.parentElement;
  const original = track.innerHTML;
  let guard = 0;
  while (track.scrollWidth < belt.offsetWidth * 3 && guard++ < 12) {
    track.innerHTML += original;
  }
});

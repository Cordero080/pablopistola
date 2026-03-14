// Gallery thumbnail click handler for project pages
document.querySelectorAll(".gallery-thumbs .thumb").forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const heroImg = document.querySelector(".gallery-hero-img");
    const newSrc = thumb.dataset.full;
    heroImg.src = newSrc;

    // Toggle architecture class for wireframes/ERDs
    if (newSrc && (newSrc.includes("wireframe") || newSrc.includes("erd"))) {
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

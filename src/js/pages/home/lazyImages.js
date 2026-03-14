// Image fade-in observer for bento card images
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".bento-card-image");

  images.forEach((img) => {
    // If already loaded (cached), add class immediately
    if (img.complete && img.naturalHeight !== 0) {
      img.classList.add("loaded");
    } else {
      img.addEventListener("load", () => {
        img.classList.add("loaded");
      });
    }
  });
});

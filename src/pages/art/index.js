// Art page: lightbox functionality + hamburger menu
document.addEventListener("DOMContentLoaded", () => {
  // Lightbox functionality
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const galleryItems = document.querySelectorAll(".gallery-item img");
  let currentIndex = 0;
  let images = [];

  galleryItems.forEach((img, index) => {
    images.push({
      src: img.src,
      alt: img.alt,
      caption:
        img.closest(".gallery-item").querySelector("figcaption")?.textContent ||
        "",
    });

    img.addEventListener("click", () => {
      currentIndex = index;
      openLightbox(images[currentIndex]);
    });
  });

  function openLightbox(image) {
    lightboxImg.src = image.src;
    lightboxImg.alt = image.alt;
    lightboxCaption.textContent = image.caption;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + images.length) % images.length;
    openLightbox(images[currentIndex]);
  }

  document
    .querySelector(".lightbox-close")
    .addEventListener("click", closeLightbox);
  document
    .querySelector(".lightbox-prev")
    .addEventListener("click", () => navigate(-1));
  document
    .querySelector(".lightbox-next")
    .addEventListener("click", () => navigate(1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigate(-1);
    if (e.key === "ArrowRight") navigate(1);
  });

  // Hamburger menu toggle
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sideNav = document.querySelector(".side-nav");
  const navLinks = document.querySelectorAll(".side-nav-link");

  if (hamburgerBtn && sideNav) {
    hamburgerBtn.addEventListener("click", () => {
      const isOpen = sideNav.classList.toggle("menu-open");
      hamburgerBtn.classList.toggle("active");
      hamburgerBtn.setAttribute("aria-expanded", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        sideNav.classList.remove("menu-open");
        hamburgerBtn.classList.remove("active");
        hamburgerBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sideNav.classList.contains("menu-open")) {
        sideNav.classList.remove("menu-open");
        hamburgerBtn.classList.remove("active");
        hamburgerBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }
});

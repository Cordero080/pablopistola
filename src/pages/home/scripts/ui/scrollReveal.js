(function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  gsap.registerPlugin(ScrollTrigger);

  // ── Hero entrance (title → subtitle → CTA, overlapping) ──
  gsap
    .timeline({ delay: 0.2 })
    .fromTo(
      "#heroTitle",
      { y: 48, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: "power3.out" },
    )
    .fromTo(
      ".hero-subtitle",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.55",
    )
    .fromTo(
      ".hero-cta",
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.45",
    );

  // ── Marquee: fade in on scroll ──
  gsap.set(".marquee-belt", { opacity: 0 });

  gsap.to(".marquee-belt", {
    opacity: .7,
    duration: 1.4,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".marquee-belt",
      start: "top 94%",
      toggleActions: "play none none none",
    },
  });
})();

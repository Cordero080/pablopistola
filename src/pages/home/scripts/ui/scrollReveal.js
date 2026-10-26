(function () {
  // These elements start at opacity:0 in CSS so they don't paint, get snapped
  // invisible by gsap, and fade back in on load. That means if gsap never
  // arrives (CDN blocked/offline) nothing would reveal them — so bail by
  // showing them outright rather than returning into a blank hero.
  const REVEALED = ".hero-subtitle, .hero-cta, .marquee-belt";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    document
      .querySelectorAll(REVEALED)
      .forEach((el) => (el.style.opacity = "1"));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Hero entrance (title → subtitle → CTA, overlapping) ──
  gsap
    .timeline({ delay: 0.2 })
    .fromTo(
      "#heroTitle",
      { opacity: 0 },
      { opacity: 1, duration: 1.0, ease: "power3.out" },
    )
    .fromTo(
      ".hero-subtitle",
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.55",
    )
    .fromTo(
      ".hero-cta",
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.45",
    );

  // ── Marquee: fade in on scroll ──
  gsap.set(".marquee-belt", { opacity: 0 });

  gsap.to(".marquee-belt", {
    opacity: 0.7,
    duration: 1.4,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".marquee-belt",
      start: "top 94%",
      toggleActions: "play none none none",
    },
  });
})();

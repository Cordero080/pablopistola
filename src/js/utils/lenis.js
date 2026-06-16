// Smooth scroll — driven by GSAP ticker in scrollReveal.js
(function () {
  if (typeof Lenis === "undefined") return;

  window.lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5,
  });
})();

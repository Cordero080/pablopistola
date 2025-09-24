var parallaxQuote = document.getElementById("parallaxQuote");
var cards = document.querySelectorAll(".container .card");
function checkRevealParallaxQuote() {
  if (!parallaxQuote || !cards.length) return;
  var lastCard = cards[cards.length - 1];
  var lastCardRect = lastCard.getBoundingClientRect();
  var windowH = window.innerHeight;
  var fadeStart = windowH * 0.7;
  var fadeEnd = windowH * 0.3;
  var progress = 0;
  if (lastCardRect.bottom < fadeStart) {
    progress = Math.min(
      1,
      Math.max(0, (fadeStart - lastCardRect.bottom) / (fadeStart - fadeEnd))
    );
  }
  parallaxQuote.style.opacity = progress;
  if (progress > 0.98) {
    parallaxQuote.classList.add("visible");
  } else {
    parallaxQuote.classList.remove("visible");
  }
  parallaxQuote.style.transform =
    "translateY(" +
    40 * (1 - progress) +
    "px) scale(" +
    (0.98 + 0.02 * progress) +
    ")";
}
window.addEventListener("scroll", checkRevealParallaxQuote);
checkRevealParallaxQuote();

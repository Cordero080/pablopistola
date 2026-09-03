// Landing Page - Glitch Title Animation

document.addEventListener("DOMContentLoaded", () => {
  const titleElement = document.getElementById("landingTitle");
  const TITLE_TEXT = "PVBLO C0RDERO";

  // Golden ratio constant for Weyl sequence
  const PHI = (1 + Math.sqrt(5)) / 2; // ≈ 1.618

  // Color variants for each letter
  const colorVariants = [
    "magenta",
    "cyan",
    "aqua",
    "purple",
    "blue",
    "orange",
    "pink",
    "green",
  ];

  // Base delay: wait for rubix assembly to finish (~2s)
  const BASE_DELAY = 2.2;

  // Calculate delays using Weyl sequence
  const letters = TITLE_TEXT.split("");
  const letterDelays = letters.map((_, i) => {
    const weyl = ((i + 1) * PHI) % 1;
    return BASE_DELAY + weyl * 0.1; // 0.6s max spread
  });

  // Track hovered letters for replay feature
  const hoveredLetters = new Set();
  let replayState = false;

  // Create letter spans
  letters.forEach((letter, index) => {
    const span = document.createElement("span");
    const isSpace = letter === " ";
    const isFlipped = index === 0 || index === letters.length - 1;
    const isInvertedV = index === 1; // The "V" in PVBLO
    const colorVariant = colorVariants[index % colorVariants.length];

    // Build class list
    let classes = ["title-letter"];
    if (isSpace) {
      classes.push("title-letter--space");
    } else {
      classes.push(`title-letter--${colorVariant}`);
      if (isFlipped) {
        classes.push("title-letter--flip");
      }
      if (isInvertedV) {
        classes.push("title-letter--invert-v");
      }
    }

    span.className = classes.join(" ");
    span.textContent = letter;
    span.setAttribute("data-letter", letter);

    if (!isSpace) {
      span.style.animationDelay = `${letterDelays[index]}s`;
    }

    // Hover tracking for replay
    if (!isSpace) {
      span.addEventListener("mouseenter", () => handleLetterHover(index));
    }

    titleElement.appendChild(span);
  });

  // Make the per-letter gradients read as ONE continuous gradient across the
  // whole title: size each letter's background to the full title box and shift
  // it by the letter's layout offset, so each letter shows just its slice of a
  // single sweep. offsetLeft/Top are layout positions (unaffected by the glitch
  // transforms), so this stays aligned. Recomputed on resize.
  function paintContinuousGradient() {
    const spans = [
      ...titleElement.querySelectorAll(
        ".title-letter:not(.title-letter--space)",
      ),
    ];
    if (!spans.length) return;
    // Span the gradient across the TEXT extent (first letter's left edge to
    // last letter's right edge), not the much wider h1 box — otherwise the
    // outer letters land mid-gradient on the dark bands. This way the sweep
    // runs cleanly from the first letter to the last.
    const extentLeft = Math.min(...spans.map((s) => s.offsetLeft));
    const extentRight = Math.max(
      ...spans.map((s) => s.offsetLeft + s.offsetWidth),
    );
    const w = extentRight - extentLeft;
    const h = titleElement.offsetHeight;
    if (!w || !h) return;
    spans.forEach((span) => {
      span.style.backgroundSize = `${w}px ${h}px`;
      span.style.backgroundPosition = `${-(span.offsetLeft - extentLeft)}px ${-span.offsetTop}px`;
    });
  }
  requestAnimationFrame(paintContinuousGradient);
  window.addEventListener("resize", paintContinuousGradient);

  // Handle letter hover - trigger replay when all hovered
  function handleLetterHover(index) {
    hoveredLetters.add(index);

    // Count non-space letters
    const nonSpaceCount = letters.filter((l) => l !== " ").length;

    if (hoveredLetters.size === nonSpaceCount && !replayState) {
      replayState = true;
      hoveredLetters.clear();

      // Reset animation
      titleElement.classList.add("landing-title--reset");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          titleElement.classList.remove("landing-title--reset");
          titleElement.classList.add("landing-title--replay");

          // Reassign staggered delays for replay
          const letterSpans = titleElement.querySelectorAll(
            ".title-letter:not(.title-letter--space)",
          );
          letterSpans.forEach((span, i) => {
            const weyl = ((i + 1) * PHI) % 1;
            span.style.animationDelay = `${weyl * 0.3}s`;
          });

          setTimeout(() => {
            titleElement.classList.remove("landing-title--replay");
            replayState = false;

            // Restore original delays
            letterSpans.forEach((span, i) => {
              // Find original index
              const originalIndex = [...titleElement.children].indexOf(span);
              span.style.animationDelay = `${letterDelays[originalIndex]}s`;
            });
          }, 3000);
        });
      });
    }
  }
});

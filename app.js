// Minimal parallax for geometric overlay
function updateMinimalParallaxOverlay() {
  const overlay = document.querySelector(".parallax-bg-overlay");
  if (!overlay) return;
  const scrollY = window.scrollY;
  overlay.style.transform = `translateY(${scrollY * 0.25}px)`;
}
window.addEventListener("scroll", updateMinimalParallaxOverlay);
document.addEventListener("DOMContentLoaded", updateMinimalParallaxOverlay);
const cards = document.querySelectorAll(".card");

// Create the more card and add to container
function createMoreCard() {
  const moreCardContainer = document.getElementById("moreCardContainer");
  if (!moreCardContainer) return;
  moreCardContainer.innerHTML = "";
  const moreCard = document.createElement("div");
  moreCard.className = "card more-card";
  moreCard.innerHTML = '<span class="glitch" data-text="more">more</span>';
  moreCardContainer.appendChild(moreCard);
}

// Ensure more card is created on DOMContentLoaded
document.addEventListener("DOMContentLoaded", createMoreCard);

function updateTransforms() {
  //quick note: this function is called whenever the user scrolls the page. It updates the transforms of each card based on the scroll position.
  const scrollY = window.scrollY; // simply put, window is the global object in the browser, and scrollY is a property that returns the number of pixels that the document has already been scrolled vertically. This is used to calculate the parallax effect based on the scroll position.

  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const rawProgress = Math.min(scrollY / maxScroll, 1);
  const cardHue = rawProgress * 260; // Gradual hue shift up to 260deg

  // Sinewave parameters for card motion
  const waveAmplitude = 24; // Subtle amplitude
  const waveWavelength = 480; // Match main sinewave wavelength
  const waveSpeed = window.waveGen ? window.waveGen.speed : 0.7;
  const waveTime = window.waveGen
    ? window.waveGen.time
    : performance.now() / 1000;

  cards.forEach((card, i) => {
    card.style.filter = `hue-rotate(${cardHue}deg)`;
    const speed = parseFloat(card.getAttribute("data-speed")); // parseFloat is used to convert the string value of the data-speed attribute into a floating-point number. This allows for decimal values, which can create a more subtle parallax effect. The data-speed attribute is set in the HTML and determines how fast the card moves relative to the scroll position. To see this in the HTML, you can look for something like <div class="card" data-speed="0.5">. The speed value can be adjusted to make the parallax effect more or less pronounced.
    const offset = scrollY * speed;

    // Subtle sinewave vertical offset
    const cardRect = card.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const waveY =
      Math.sin(waveTime * waveSpeed + cardCenterX / waveWavelength) *
      waveAmplitude;

    // Only apply parallax if not being hovered
    if (!card.matches(":hover")) {
      card.style.transform = `rotateY(0deg) rotateX(0deg) translateZ(50px) translateY(${
        offset + waveY
      }px)`; //this is the transform that will be applied to the card when it is not being hovered. When mouse is not hovering over the card, it will apply a parallax effect based on the scroll position
    }
  });

  // Sinewave hue shift
  const sineWaveCanvas = document.getElementById("waves");
  if (sineWaveCanvas) {
    sineWaveCanvas.style.filter = `hue-rotate(${cardHue}deg)`;
  }
}

// Handle parallax on scroll
window.addEventListener("scroll", updateTransforms);

// Rotate card toward mouse position
cards.forEach((card) => {
  // this is the loop that adds the event listeners to each card so that they can react to mouse movements
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect(); // this is a built-in method that returns the size of an element and its position relative to the viewport
    const x = e.clientX - rect.left; // x position within the card
    const y = e.clientY - rect.top; // y position within the card

    const centerX = rect.width / 2; // this is the center of the card
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 5; // invert so it tilts correctly. to exxaggerate the effect, you can change the divisor into a smaller number foe example 5 or 3 (it was 10 before)
    const rotateY = (x - centerX) / 5;

    const scrollY = window.scrollY;
    const speed = parseFloat(card.getAttribute("data-speed"));
    const offset = scrollY * speed;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(80px) translateY(${offset}px)`;
  });

  card.addEventListener("mouseleave", () => {
    const scrollY = window.scrollY;
    const speed = parseFloat(card.getAttribute("data-speed"));
    const offset = scrollY * speed;

    card.style.transform = `rotateY(10deg) translateZ(50px) translateY(${offset}px)`;
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "r") {
    waveGen.direction *= -1; // Reverse animation direction
  }
});

// Complementary Color Effect for PABLOPISTOLA hover

document.addEventListener("DOMContentLoaded", function () {
  const myNameElement = document.getElementById("myName");
  if (!myNameElement) return;

  let scrambleInterval = null;
  let scrambleTimeout = null;
  const originalText = myNameElement.textContent;
  const nameLetters = originalText.split("");

  // Upside down unicode map for basic Latin letters
  const upsideDownMap = {};

  // Horizontally reflected unicode map for basic Latin letters
  const horizontalReflectMap = {
    A: "∀",
    B: "𐐒",
    C: "Ↄ",
    D: "◖",
    E: "Ǝ",
    F: "Ⅎ",
    G: "⅁",
    H: "h",
    I: "I",
    J: "ſ",
    K: "⋊",
    L: "⅃",
    M: "W",
    N: "И",
    O: "O",
    P: "Ԁ",
    Q: "Ò",
    R: "Я",
    S: "S",
    T: "⊥",
    U: "∩",
    V: "Λ",
    W: "m",
    X: "X",
    Y: "⅄",
    Z: "Z",
    a: "ɐ",
    b: "q",
    c: "ɔ",
    d: "p",
    e: "ǝ",
    f: "ɟ",
    g: "ƃ",
    h: "ɥ",
    i: "ı",
    j: "ɾ",
    k: "ʞ",
    l: "ʃ",
    m: "ɯ",
    n: "u",
    o: "o",
    p: "d",
    q: "b",
    r: "ɹ",
    s: "s",
    t: "ʇ",
    u: "n",
    v: "ʌ",
    w: "ʍ",
    x: "x",
    y: "ʎ",
    z: "z",
  };

  // Ensure toggleComplementaryColors is accessible
  window.toggleComplementaryColors =
    window.toggleComplementaryColors ||
    function () {
      if (typeof isComplementaryMode === "undefined") {
        window.isComplementaryMode = false;
      }
      window.isComplementaryMode = !window.isComplementaryMode;
      if (window.isComplementaryMode) {
        document.body.classList.add("complementary-colors");
        updateWaveColors(true);
        setEtherealWaveComplexity(true);
        if (window.startFeatherEffect) window.startFeatherEffect();
      } else {
        document.body.classList.remove("complementary-colors");
        updateWaveColors(false);
        setEtherealWaveComplexity(false);
        if (window.stopFeatherEffect) window.stopFeatherEffect();
      }
    };

  function scrambleName() {
    // Scramble using digits from pi and Fibonacci sequence
    // Animate Fibonacci sequence up to 13th digit, then back, replacing name letters
    // Pi digits up to the 23rd digit
    const piDigits = "3141592653589793238462643".split("");
    // Create the full sequence: up to 23rd, then back down
    let piUp = piDigits;
    let piDown = piDigits.slice(0, -1).reverse();
    // Map for horizontal reflection of digits
    const reflectMap = {
      0: "0",
      1: "Ɩ",
      2: "ᄅ",
      3: "Ɛ",
      6: "9",
      7: "ㄥ",
      8: "8",
      9: "6",
    };
    // Map for vertical flipping (upside down) of digits
    const upsideDownMap = {
      0: "0",
      1: "⇂",
      3: "Ɛ",
      6: "9",
      7: "ㄥ",
      8: "8",
      9: "6",
    };
    // Animation state
    if (!window.piAnimIndex) window.piAnimIndex = 0;
    let display = [];
    let piSeq, isDown;
    if (window.piAnimIndex < piUp.length) {
      piSeq = piUp;
      isDown = false;
    } else {
      piSeq = piDown;
      isDown = true;
    }
    for (let i = 0; i < nameLetters.length; i++) {
      let idx = (window.piAnimIndex + i) % piSeq.length;
      let num = piSeq[idx % piSeq.length];
      if (isDown) {
        // Flip vertically (upside down) instead of horizontal
        num = num
          .split("")
          .map((d) => upsideDownMap[d] || d)
          .join("");
      }
      display.push(num);
    }
    myNameElement.textContent = display.join(" ");
    window.piAnimIndex =
      (window.piAnimIndex + 1) % (piUp.length + piDown.length);
  }

  myNameElement.addEventListener("mouseenter", () => {
    window.piAnimIndex = 0;
    scrambleInterval = setInterval(scrambleName, 100);
    // Scramble animation is independent, does NOT toggle comp mode
  });

  myNameElement.addEventListener("mouseleave", () => {
    if (scrambleInterval) {
      clearInterval(scrambleInterval);
      scrambleInterval = null;
    }
    if (scrambleTimeout) {
      clearTimeout(scrambleTimeout);
      scrambleTimeout = null;
    }
    myNameElement.textContent = originalText;
  });

  // Complementary mode hover functionality
  let compHoverTimer = null;
  let isCompMode = false;
  if (!myNameElement) {
    console.error("myNameElement not found! Check your selector.");
  } else {
    // Complementary mode logic is fully independent from scramble
    // Remove all click event listeners from myNameElement
    myNameElement.onclick = null;
    myNameElement.addEventListener("mouseenter", () => {
      if (compHoverTimer) {
        console.log("Comp mode timer already running");
        return;
      }
      // Extra guard: only start timer if not already in comp mode and not already running
      if (!isCompMode) {
        console.log("Starting 3s timer to activate comp mode");
        compHoverTimer = setTimeout(() => {
          console.log("3s hover complete: activating comp mode");
          if (
            !isCompMode &&
            typeof window.toggleComplementaryColors === "function"
          ) {
            window.toggleComplementaryColors();
            isCompMode = true;
          }
          compHoverTimer = null;
        }, 3000);
      } else {
        console.log("Starting 3s timer to deactivate comp mode");
        compHoverTimer = setTimeout(() => {
          console.log("3s hover complete: deactivating comp mode");
          if (
            isCompMode &&
            typeof window.toggleComplementaryColors === "function"
          ) {
            window.toggleComplementaryColors();
            isCompMode = false;
          }
          compHoverTimer = null;
        }, 3000);
      }
    });
    myNameElement.addEventListener("mouseleave", () => {
      if (compHoverTimer) {
        clearTimeout(compHoverTimer);
        compHoverTimer = null;
        console.log("Comp mode timer cancelled on mouseleave");
      }
      // Mouseleave does NOT deactivate comp mode
    });
  }

  // Optional: Click to toggle back to normal
  // Removed click-to-toggle for complementary mode. Only 3s hover toggles mode.
});

function updateWaveColors(isComplementary) {
  if (window.waveGen && window.waveGen.ctx) {
    const gradient = window.waveGen.ctx.createLinearGradient(
      0,
      0,
      window.waveGen.width,
      0
    );

    if (isComplementary) {
      // Complementary colors
      gradient.addColorStop(0, "#00ff7f"); // Complement of pink
      gradient.addColorStop(0.2, "#00ff80"); // Complement of magenta
      gradient.addColorStop(0.5, "#ffaa00"); // Complement of blue
      gradient.addColorStop(1, "#ff4500"); // Complement of turquoise
    } else {
      // Original colors
      gradient.addColorStop(0, "pink");
      gradient.addColorStop(0.2, "magenta");
      gradient.addColorStop(0.5, "blue");
      gradient.addColorStop(1, "turquoise");
    }

    window.waveGen.waves.forEach((w) => (w.strokeStyle = gradient));
  }
}

function setEtherealWaveComplexity(isEthereal) {
  if (window.waveGen) {
    if (isEthereal) {
      window.waveGen.speed = 0.7; // Slow, fabric-like
      window.waveGen.waves = [
        {
          timeModifier: 1,
          lineWidth: 5.4,
          amplitude: 264,
          wavelength: 480,
          segmentLength: 16,
        },
        {
          timeModifier: 0.8,
          lineWidth: 3,
          amplitude: 244,
          wavelength: 220,
          segmentLength: 12,
        },
        {
          timeModifier: 1.5,
          lineWidth: 2,
          amplitude: 96,
          wavelength: 80,
          segmentLength: 6,
        },
        {
          timeModifier: 2.3,
          lineWidth: 1,
          amplitude: 48,
          wavelength: 40,
          segmentLength: 3,
        },
        {
          timeModifier: 0.6,
          lineWidth: 0.7,
          amplitude: 36,
          wavelength: 720,
          segmentLength: 24,
        },
      ];
      window.waveGen.resizeEvent();
    } else {
      window.waveGen.speed = 4;
      window.waveGen.waves = [
        {
          timeModifier: 1,
          lineWidth: 3,
          amplitude: 150,
          wavelength: 200,
          segmentLength: 20,
        },
        { timeModifier: 1, lineWidth: 2, amplitude: 150, wavelength: 100 },
        {
          timeModifier: 1,
          lineWidth: 1,
          amplitude: -150,
          wavelength: 50,
          segmentLength: 10,
        },
        {
          timeModifier: 1,
          lineWidth: 0.5,
          amplitude: -100,
          wavelength: 100,
          segmentLength: 10,
        },
        {
          timeModifier: 1,
          lineWidth: 0.5,
          amplitude: -50,
          wavelength: 50,
          segmentLength: 20,
        },
      ];
      window.waveGen.resizeEvent();
    }
  }
}

const audio = document.getElementById("site-audio");
if (audio) {
  audio.volume = 0.3; // set volume
}

let cursorY = window.innerHeight / 2;
let cursorX = window.innerWidth / 2;
window.addEventListener("mousemove", function (e) {
  cursorX = e.clientX;
  cursorY = e.clientY;
});
// Patch sinewave animation to attract to cursor in both X and Y
if (window.waveGen) {
  const originalDraw = window.waveGen.draw;
  window.waveGen.draw = function () {
    const canvas = document.getElementById("waves");
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    window.waveGen.waves.forEach((wave, i) => {
      // Track both X and Y offset for each wave
      if (!wave._offsetY) wave._offsetY = canvas.height / 2;
      if (!wave._offsetX) wave._offsetX = canvas.width / 2;
      // Calculate distance from wave to cursor
      let distY = Math.abs(wave._offsetY - cursorY);
      let distX = Math.abs(wave._offsetX - cursorX);
      // Pull strength decreases as distance increases
      let strengthY = Math.max(0.04, 0.18 - (distY / canvas.height) * 0.16);
      let strengthX = Math.max(0.04, 0.18 - (distX / canvas.width) * 0.16);
      wave._offsetY += (cursorY - wave._offsetY) * strengthY;
      wave._offsetX += (cursorX - wave._offsetX) * strengthX;
      wave.offsetY = wave._offsetY;
      wave.offsetX = wave._offsetX;
    });
    if (originalDraw) originalDraw.call(window.waveGen);
  };
}

// Custom Cursor System
document.addEventListener("DOMContentLoaded", function () {
  console.log("Creating custom cursor system...");

  // Create cursor elements
  const cursorMain = document.createElement("div");
  cursorMain.className = "cursor-main";
  cursorMain.style.display = "block";

  const cursorFollow = document.createElement("div");
  cursorFollow.className = "cursor-follow";
  cursorFollow.style.display = "block";

  const cursorGlow = document.createElement("div");
  cursorGlow.className = "cursor-glow";
  cursorGlow.style.display = "block";

  document.body.appendChild(cursorMain);
  document.body.appendChild(cursorFollow);
  document.body.appendChild(cursorGlow);

  console.log("Cursor elements created:", cursorMain, cursorFollow, cursorGlow);

  let mouseX = window.innerWidth / 2,
    mouseY = window.innerHeight / 2;
  let followerX = mouseX,
    followerY = mouseY;
  let glowX = mouseX,
    glowY = mouseY;
  let particleTimer = 0;

  // Initial positioning
  cursorMain.style.left = mouseX - 10 + "px";
  cursorMain.style.top = mouseY - 10 + "px";
  cursorFollow.style.left = mouseX - 4 + "px";
  cursorFollow.style.top = mouseY - 4 + "px";

  // Update cursor position
  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorMain.style.left = mouseX - 10 + "px";
    cursorMain.style.top = mouseY - 10 + "px";

    console.log("Mouse position:", mouseX, mouseY);

    // Create particles occasionally
    particleTimer++;
    if (particleTimer % 15 === 0) {
      createParticle(mouseX, mouseY);
    }
  });

  // Smooth follow animation
  function animateFollower() {
    const speed = 0.15;

    followerX += (mouseX - followerX) * speed;
    followerY += (mouseY - followerY) * speed;

    cursorFollow.style.left = followerX - 4 + "px";
    cursorFollow.style.top = followerY - 4 + "px";

    // Glow follows even slower
    const glowSpeed = 0.08;
    glowX += (mouseX - glowX) * glowSpeed;
    glowY += (mouseY - glowY) * glowSpeed;

    cursorGlow.style.left = glowX - 50 + "px";
    cursorGlow.style.top = glowY - 50 + "px";

    requestAnimationFrame(animateFollower);
  }

  animateFollower();

  // Hover effects on interactive elements
  const interactiveElements =
    'a, button, .card, .nav-links a, #myName, [role="button"], input, textarea';

  document.addEventListener("mouseover", function (e) {
    if (e.target.matches(interactiveElements)) {
      cursorMain.classList.add("hover");
      cursorGlow.classList.add("active");
    }
  });

  document.addEventListener("mouseout", function (e) {
    if (e.target.matches(interactiveElements)) {
      cursorMain.classList.remove("hover");
      cursorGlow.classList.remove("active");
    }
  });

  // Create particle trail
  function createParticle(x, y) {
    const particle = document.createElement("div");
    particle.className = "cursor-particle";

    // Random color from the neon palette
    const colors = ["#00ffff", "#ff00ff", "#ffff00"];
    particle.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    // Random offset position
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;

    particle.style.left = x + offsetX + "px";
    particle.style.top = y + offsetY + "px";

    document.body.appendChild(particle);

    // Remove particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1000);
  }

  // Hide cursor when leaving window
  document.addEventListener("mouseenter", function () {
    cursorMain.style.opacity = "1";
    cursorFollow.style.opacity = "0.8";
  });

  document.addEventListener("mouseleave", function () {
    cursorMain.style.opacity = "0";
    cursorFollow.style.opacity = "0";
    cursorGlow.classList.remove("active");
  });
});

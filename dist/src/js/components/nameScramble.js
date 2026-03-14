// Name scramble + pi animation (for #myName logo element)
document.addEventListener("DOMContentLoaded", function () {
  const myNameElement = document.getElementById("myName");
  if (!myNameElement) return;

  let scrambleInterval = null;
  let scrambleTimeout = null;
  const originalText = myNameElement.textContent;
  const nameLetters = originalText.split("");

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
});

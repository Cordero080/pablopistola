function SineWaveGenerator(options) {
  Object.assign(this, options || {});

  if (!this.el) throw "No Canvas Selected";
  this.ctx = this.el.getContext("2d");
  if (!this.waves.length) throw "No waves specified";

  this.direction = -1; // 👈 control wave direction here

  this._resizeWidth();
  window.addEventListener("resize", this._resizeWidth.bind(this));

  this.resizeEvent();
  window.addEventListener("resize", this.resizeEvent.bind(this));

  if (typeof this.initialize === "function") {
    this.initialize.call(this);
  }

  this.loop();
  // Initialize to center in screen coordinates (touch/mouse events use screen coords)
  this.mouseX = window.innerWidth / 2;
  this.mouseY = window.innerHeight / 2;

  window.addEventListener("mousemove", (e) => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  });

  // Touch support for mobile
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      this.mouseX = e.touches[0].clientX;
      this.mouseY = e.touches[0].clientY;
    }
  });

  window.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) {
      this.mouseX = e.touches[0].clientX;
      this.mouseY = e.touches[0].clientY;
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      this.direction *= -1;
    }
  });

  // Spacebar prompt on scroll
  let promptShown = false;
  window.addEventListener(
    "wheel",
    () => {
      if (!promptShown) {
        promptShown = true;
        const prompt = document.getElementById("spacebarPrompt");
        if (prompt) {
          prompt.classList.add("pulse");
          prompt.addEventListener(
            "animationend",
            () => {
              prompt.classList.remove("pulse");
            },
            { once: true },
          );
        }
      }
    },
    { once: true },
  );
}

// Defaults
SineWaveGenerator.prototype.speed = 10;
SineWaveGenerator.prototype.amplitude = 20;
SineWaveGenerator.prototype.wavelength = 50;
SineWaveGenerator.prototype.segmentLength = 10;
SineWaveGenerator.prototype.lineWidth = 2;
SineWaveGenerator.prototype.strokeStyle = "rgba(255, 255, 255, 0.2)";
SineWaveGenerator.prototype.resizeEvent = function () {};

// Fill the screen
SineWaveGenerator.prototype._resizeWidth = function () {
  this.dpr = window.devicePixelRatio || 1;
  this.width = this.el.width = window.innerWidth * this.dpr;
  this.height = this.el.height = window.innerHeight * this.dpr;
  this.el.style.width = window.innerWidth + "px";
  this.el.style.height = window.innerHeight + "px";
  this.waveWidth = this.width * 0.95;
  this.waveLeft = this.width * 0.025;
};

SineWaveGenerator.prototype.clear = function () {
  this.ctx.clearRect(0, 0, this.width, this.height);
};

SineWaveGenerator.prototype.time = 0;

SineWaveGenerator.prototype.update = function (time) {
  this.time += 0.007 * this.direction; // 👈 dynamic direction

  if (typeof time === "undefined") {
    time = this.time;
  }

  for (let i = 0; i < this.waves.length; i++) {
    const wave = this.waves[i];
    const modifier = wave.timeModifier || 1;
    this.drawSine(time * modifier, wave);
  }
};

// Math constants
const PI2 = Math.PI * 2;
const HALFPI = Math.PI / 2;

SineWaveGenerator.prototype.ease = function (percent, amplitude) {
  return amplitude * (Math.sin(percent * PI2 - HALFPI) + 1) * 0.7;
};

SineWaveGenerator.prototype.drawSine = function (time, options) {
  const {
    amplitude = this.amplitude,
    wavelength = this.wavelength,
    lineWidth = this.lineWidth,
    strokeStyle = this.strokeStyle,
    segmentLength = this.segmentLength,
  } = options;

  const ctx = this.ctx;
  ctx.beginPath();
  ctx.lineWidth = lineWidth * this.dpr;
  ctx.strokeStyle = strokeStyle;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const yAxis = this.height / 2;

  ctx.moveTo(0, yAxis);
  ctx.lineTo(this.waveLeft, yAxis);

  for (let i = 0; i < this.waveWidth; i += segmentLength) {
    const segmentX = i + this.waveLeft;
    const waveX = time * this.speed + (-yAxis + i) / wavelength;
    const waveY = Math.sin(waveX);
    const easedAmp = this.ease(i / this.waveWidth, amplitude);

    const cursorX = this.mouseX ?? this.width / 2 / this.dpr;
    const cursorY = this.mouseY ?? this.height / 2 / this.dpr;
    const dpr = this.dpr ?? 1; // where you can control the resolution scaling

    // where you can control the acuteness of the wave  when interacted with the mouse would be in the segmentLength, wavelength, and amplitude
    // to make it less acute when user hovers mouse, you can increase the segmentLength or wavelength, or decrease the amplitude by adjusting these values in the waves array. the waves array in the SineWaveGenerator constructor allows you to customize these parameters for each wave.
    if (isNaN(segmentX) || isNaN(waveY) || isNaN(easedAmp)) continue;

    const distanceToMouse = Math.abs(segmentX / dpr - cursorX);
    const distanceLimit = 80;
    const pullStrength = Math.max(0, 1 - distanceToMouse / distanceLimit);

    const centerBias = 1 - Math.abs(i / this.waveWidth - 0.5) * 2;
    const influence = pullStrength * centerBias;

    const mousePull = (cursorY - yAxis / dpr) * influence * 0.81 * dpr; // 19% less reactive

    const finalY = easedAmp * waveY + yAxis + mousePull;

    if (!isNaN(finalY)) {
      ctx.lineTo(segmentX, finalY);
    }
  }
  ctx.lineTo(this.width, yAxis);
  ctx.stroke();
};

SineWaveGenerator.prototype.loop = function () {
  this.clear();
  this.update();
  requestAnimationFrame(this.loop.bind(this));
};

window.waveGen = new SineWaveGenerator({
  el: document.getElementById("waves"),
  speed: 1.2, // slowed down for a calmer vibe
  waves: [
    {
      timeModifier: 1,
      lineWidth: 3,
      amplitude: 150,
      wavelength: 300,
      segmentLength: 20,
    },
    { timeModifier: 1, lineWidth: 2, amplitude: 150, wavelength: 100 },
    {
      timeModifier: 1,
      lineWidth: 1,
      amplitude: -120,
      wavelength: 150,
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
      wavelength: 80,
      segmentLength: 20,
    },
  ],
  resizeEvent: function () {
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(0, "pink");
    gradient.addColorStop(0.2, "magenta");
    gradient.addColorStop(0.5, "blue");
    gradient.addColorStop(1, "turquoise");

    this.waves.forEach((w) => (w.strokeStyle = gradient));
  },
});

// This file has moved to js/sineWave.js
// Please update your HTML <script> tag to:
// <script src="js/sineWave.js"></script>

// Add a fourth card beneath the three, styled as requested
const container = document.querySelector(".container");
if (container) {
  const moreCard = document.createElement("div");
  moreCard.className = "card more-card";
  moreCard.innerHTML = '<span class="glitch" data-text="more">more</span>';
  container.appendChild(moreCard);
} // how to add more words to the more card
//

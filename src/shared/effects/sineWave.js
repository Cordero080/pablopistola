function SineWaveGenerator(options) {
  Object.assign(this, options || {});

  if (!this.el) throw "No Canvas Selected";
  this.ctx = this.el.getContext("2d");
  if (!this.waves.length) throw "No waves specified";

  this.direction = -1;

  this._resizeWidth();
  window.addEventListener("resize", this._resizeWidth.bind(this));

  this.resizeEvent();
  window.addEventListener("resize", this.resizeEvent.bind(this));

  if (typeof this.initialize === "function") {
    this.initialize.call(this);
  }

  this.mouseX = window.innerWidth / 2;
  this.mouseY = window.innerHeight / 2;
  this.smoothMouseX = this.mouseX;
  this.smoothMouseY = this.mouseY;

  this.waveMouseX = this.waves.map(() => this.mouseX);
  this.waveMouseY = this.waves.map(() => this.mouseY);

  this.loop();

  window.addEventListener("mousemove", (e) => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  });

  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 0) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
      }
    },
    { passive: true },
  );

  window.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length > 0) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
      }
    },
    { passive: true },
  );

  window.addEventListener(
    "touchend",
    () => {
      this.mouseX = window.innerWidth / 2;
      this.mouseY = window.innerHeight / 2;
    },
    { passive: true },
  );

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      this.direction *= -1;
    }
  });
}

// Defaults
SineWaveGenerator.prototype.speed = 10;
SineWaveGenerator.prototype.amplitude = 20;
SineWaveGenerator.prototype.wavelength = 50;
SineWaveGenerator.prototype.segmentLength = 10;
SineWaveGenerator.prototype.lineWidth = 2;
SineWaveGenerator.prototype.strokeStyle = "rgba(255, 255, 255, 0.2)";
SineWaveGenerator.prototype.resizeEvent = function () {};

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
  const now = performance.now();
  const dt = Math.min((now - (this._lastFrame || now)) / 16.667, 3);
  this._lastFrame = now;
  this.time += 0.007 * this.direction;

  const smoothing = 0.1;
  this.smoothMouseX += (this.mouseX - this.smoothMouseX) * smoothing;
  this.smoothMouseY += (this.mouseY - this.smoothMouseY) * smoothing;

  for (let i = 0; i < this.waves.length; i++) {
    const wave = this.waves[i];
    const waveDelay = wave.attractionDelay ?? 0.15;
    const frameAdjusted = 1 - Math.pow(1 - waveDelay, dt);
    this.waveMouseX[i] += (this.mouseX - this.waveMouseX[i]) * frameAdjusted;
    this.waveMouseY[i] += (this.mouseY - this.waveMouseY[i]) * frameAdjusted;
  }

  if (typeof time === "undefined") {
    time = this.time;
  }

  // Suck-pulse: collapses waves to centerline every SUCK_INTERVAL seconds
  const SUCK_INTERVAL = 18;
  const SUCK_SHARP = 10;
  const ct = now / 1000;
  const suckRaw = Math.abs(Math.sin((ct / SUCK_INTERVAL) * Math.PI));
  this._suck = Math.pow(suckRaw, SUCK_SHARP);

  if (this._suck > 0.9 && !this._dirFlipped) {
    this.direction *= -1;
    this._dirFlipped = true;
  } else if (this._suck < 0.9) {
    this._dirFlipped = false;
  }

  for (let i = 0; i < this.waves.length; i++) {
    const wave = this.waves[i];
    const modifier = wave.timeModifier || 1;
    this.drawSine(time * modifier, wave, i);
  }
};

const PI2 = Math.PI * 2;
const HALFPI = Math.PI / 2;

SineWaveGenerator.prototype.ease = function (percent, amplitude) {
  return amplitude * (Math.sin(percent * PI2 - HALFPI) + 1) * 0.7;
};

SineWaveGenerator.prototype.drawSine = function (time, options, waveIndex) {
  const {
    amplitude = this.amplitude,
    wavelength = this.wavelength,
    lineWidth = this.lineWidth,
    strokeStyle = this.strokeStyle,
    segmentLength = this.segmentLength,
    attraction = 1,
    attractionStrength = 1,
    attractionRadius = 100,
    opacity = 1,
  } = options;

  const ctx = this.ctx;

  if (waveIndex === 0) {
    const yAxis0 = this.height / 2;
    const cx = time * this.speed + (-yAxis0 + this.waveWidth / 2) / wavelength;
    const s = Math.sin(cx);
    const proximity = Math.max(0, (-s - 0.6) / 0.4);
    const targetFade = 1 - proximity * 0.9;
    if (this._apexFade === undefined) this._apexFade = 1;
    this._apexFade += (targetFade - this._apexFade) * 0.03;
  }

  const suck = this._suck ?? 0;
  const suckedAmplitude = amplitude * (1 - suck * 0.92);
  const suckedLineWidth = lineWidth * (1 - suck * 0.75);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.lineWidth = suckedLineWidth * this.dpr;
  ctx.strokeStyle = strokeStyle;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const yAxis = this.height / 2;

  ctx.moveTo(0, yAxis);
  ctx.lineTo(this.waveLeft, yAxis);

  const points = [];
  for (let i = 0; i < this.waveWidth; i += segmentLength) {
    const segmentX = i + this.waveLeft;
    const waveX = time * this.speed + (-yAxis + i) / wavelength;
    const shape = options.shape || "sine";
    const waveY =
      shape === "noise"
        ? (Math.sin(waveX) +
            0.4 * Math.sin(2.3 * waveX) +
            0.15 * Math.sin(5.1 * waveX)) /
          1.55
        : Math.sin(waveX);
    const easedAmp = this.ease(i / this.waveWidth, suckedAmplitude);

    const cursorX = this.waveMouseX[waveIndex] ?? this.width / 2 / this.dpr;
    const cursorY = this.waveMouseY[waveIndex] ?? this.height / 2 / this.dpr;
    const dpr = this.dpr ?? 1;

    if (isNaN(segmentX) || isNaN(waveY) || isNaN(easedAmp)) continue;

    const distanceToMouse = Math.abs(segmentX / dpr - cursorX);
    const distanceLimit = attractionRadius * 1.15;
    const pullPower = 2.5;
    const pullStrength = Math.pow(
      Math.max(0, 1 - distanceToMouse / distanceLimit),
      pullPower,
    );

    const centerBias = 1 - Math.abs(i / this.waveWidth - 0.5) * 2;
    const influence = pullStrength * centerBias;

    const mousePull =
      (cursorY - yAxis / dpr) *
      influence *
      0.85 *
      dpr *
      attraction *
      attractionStrength;

    const finalY = easedAmp * waveY + yAxis + mousePull;
    if (!isNaN(finalY)) points.push({ x: segmentX, y: finalY });
  }

  if (points.length > 1) {
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xMid = (points[i].x + points[i + 1].x) / 2;
      const yMid = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xMid, yMid);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  ctx.lineTo(this.width, yAxis);
  ctx.stroke();
  ctx.restore();

  if (waveIndex === 0 && this._apexFade < 0.99) {
    const eraseAmount = 1 - this._apexFade;
    const grad = ctx.createLinearGradient(
      this.waveLeft,
      0,
      this.waveLeft + this.waveWidth,
      0,
    );
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.18, "rgba(0,0,0,0)");
    grad.addColorStop(0.35, `rgba(0,0,0,${eraseAmount.toFixed(3)})`);
    grad.addColorStop(0.5, `rgba(0,0,0,${eraseAmount.toFixed(3)})`);
    grad.addColorStop(0.65, `rgba(0,0,0,${eraseAmount.toFixed(3)})`);
    grad.addColorStop(0.82, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }
};

SineWaveGenerator.prototype.loop = function () {
  this.clear();
  this.update();
  requestAnimationFrame(this.loop.bind(this));
};

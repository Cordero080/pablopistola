// Landing page (index.html) wave — dramatic, full 5-wave config.
// Requires sineWave.js (SineWaveGenerator class) loaded first.
window.waveGen = new SineWaveGenerator({
  el: document.getElementById("waves"),
  speed: 0.4,
  waves: [
    // Wave 1: Heavy leader — very slow due to mass
    {
      timeModifier: 1,
      lineWidth: 10.5,
      amplitude: 300,
      wavelength: 300,
      segmentLength: 20,
      attraction: 3,
      attractionStrength: 0.1,
      attractionDelay: 0.001,
      attractionRadius: 280,
    },
    // Wave 2: Light ribbon — quick to respond
    {
      timeModifier: 1,
      lineWidth: 3,
      amplitude: 100,
      wavelength: 600,
      attraction: 1,
      attractionStrength: 0.8,
      attractionDelay: 0.12,
      attractionRadius: 400,
    },
    // Wave 3: Snappy thin line
    {
      timeModifier: 1,
      lineWidth: 1.5,
      amplitude: 150,
      wavelength: 150,
      segmentLength: 10,
      attraction: 1,
      attractionStrength: 0.7,
      attractionDelay: 0.18,
      attractionRadius: 350,
    },
    // Wave 4: Medium ribbon
    {
      timeModifier: 1,
      lineWidth: 1,
      amplitude: 100,
      wavelength: 100,
      segmentLength: 10,
      attraction: 1,
      attractionStrength: 0.6,
      attractionDelay: 0.09,
      attractionRadius: 380,
    },
    // Wave 5: Ghostly trail
    {
      timeModifier: 1,
      lineWidth: 0.3,
      amplitude: 150,
      wavelength: 80,
      segmentLength: 100,
      attraction: 1,
      attractionStrength: 0.5,
      attractionDelay: 0.06,
      attractionRadius: 300,
    },
  ],
  resizeEvent: function () {
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(0, "pink");
    gradient.addColorStop(0.2, "magenta");
    gradient.addColorStop(0.8, "blue");
    gradient.addColorStop(1, "turquoise");
    this.waves.forEach((w) => (w.strokeStyle = gradient));
  },
});

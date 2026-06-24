// Inner pages wave — calm, 3-wave config for about, resume, skills, art, 404, projects.
// Requires sineWave.js (SineWaveGenerator class) loaded first.
window.waveGen = new SineWaveGenerator({
  el: document.getElementById("waves"),
  speed: 0.25,
  waves: [
    // Wave 1: Slow anchor — low amplitude, barely reacts
    {
      timeModifier: 1,
      lineWidth: 3,
      amplitude: 80,
      wavelength: 400,
      segmentLength: 20,
      opacity: 1,
      attraction: 1,
      attractionStrength: 0.06,
      attractionDelay: 0.003,
      attractionRadius: 200,
    },
    // Wave 2: Mid ribbon
    {
      timeModifier: 1,
      lineWidth: 1.2,
      amplitude: 50,
      wavelength: 500,
      opacity: 1,
      attraction: 1,
      attractionStrength: 0.35,
      attractionDelay: 0.1,
      attractionRadius: 280,
    },
    // Wave 3: Fine thread
    {
      timeModifier: 1,
      lineWidth: 0.5,
      amplitude: 100,
      wavelength: 200,
      segmentLength: 10,
      opacity: 1,
      attraction: 1,
      attractionStrength: 0.25,
      attractionDelay: 0.15,
      attractionRadius: 250,
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

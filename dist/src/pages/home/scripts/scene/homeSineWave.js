/**
 * waveScene.js
 *
 * Replaces the Canvas 2D sine wave with a Three.js WebGL scene.
 * What we gain over Canvas 2D:
 *   - UnrealBloom post-processing: bright lines bleed glow into the background
 *   - Additive blending: overlapping waves add color, creating hot spots
 *   - Scroll-driven behavior: amplitude and bloom swell as the visitor scrolls
 *
 * COORDINATE SYSTEM NOTE — this trips everyone up the first time:
 *   Canvas 2D:   x=0 is LEFT,   y=0 is TOP,    y increases DOWNWARD
 *   Three.js:    x=0 is CENTER, y=0 is CENTER,  y increases UPWARD
 *
 * We use an OrthographicCamera whose frustum exactly matches CSS pixels:
 *   left=-width/2  right=width/2  top=height/2  bottom=-height/2
 * This lets us keep all the pixel-space math from sineWave.js and just
 * apply one conversion: worldY = -(displacement from screen center)
 *
 * IMPORTS — three named categories:
 *   1. Core Three.js (renderer, scene, camera, geometry, materials)
 *   2. Three.js addons (EffectComposer, post-processing passes)
 *   3. Our own scrollProgress module (scroll progress 0..1)
 */

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { getProgress } from "./scrollProgress.js";

// ─── Easing utilities ─────────────────────────────────────────────────────────
// These three functions compose to make buttery smooth scroll transitions.
// range() normalises progress between two thresholds to 0..1.
// smooth() applies smoothstep easing (starts and ends gently).
// lerp() interpolates between two values using the eased t.
//
// Example: smoothly move bloom from 0.3→1.4 as progress crosses 0.10→0.40:
//   lerp(0.3, 1.4, smooth(range(progress, 0.10, 0.40)))
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (v, from, to) => clamp((v - from) / (to - from));
const smooth = (t) => t * t * (3 - 2 * t); // smoothstep

// ─── Horizontal colour gradient ───────────────────────────────────────────────
// Mirrors the canvas gradient: pink → magenta → blue → turquoise.
// We store it as stops with t=position (0..1 across the wave width).
// gradientColor(t) interpolates between adjacent stops.
//
// Why not just use strokeStyle like before? Three.js geometry doesn't have a
// concept of gradient strokes. Instead we bake a colour into each vertex;
// the GPU interpolates between them automatically as it rasterises each triangle.
const GRADIENT_STOPS = [
  { t: 0.0, r: 1.0, g: 0.71, b: 0.76 }, // pink
  { t: 0.2, r: 1.0, g: 0.0, b: 1.0 }, // magenta
  { t: 0.5, r: 0.2, g: 0.2, b: 1.0 }, // blue (brightened — WebGL needs >0.12 to bloom)
  { t: 1.0, r: 0.25, g: 0.88, b: 0.82 }, // turquoise
];

function gradientColor(t) {
  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    const a = GRADIENT_STOPS[i];
    const b = GRADIENT_STOPS[i + 1];
    if (t <= b.t) {
      const local = (t - a.t) / (b.t - a.t);
      return {
        r: lerp(a.r, b.r, local),
        g: lerp(a.g, b.g, local),
        b: lerp(a.b, b.b, local),
      };
    }
  }
  return GRADIENT_STOPS[GRADIENT_STOPS.length - 1];
}

// ─── Wave configs ─────────────────────────────────────────────────────────────
// Ported directly from sineWave.js. Each object is one wave.
//
// isRibbon: true  → rendered as a triangle-strip mesh (supports thickness)
// isRibbon: false → rendered as a THREE.Line polyline (1px, compensated by bloom)
//
// halfWidth: half the ribbon thickness in CSS pixels (wave 0 = 25.5/2 = 12.75)
// baseOpacity: starting opacity; scroll will scale this up as visitor goes deeper
const WAVE_CONFIGS = [
  {
    halfWidth: 20,
    amplitude: 90,
    wavelength: 300,
    timeModifier: .2,
    isRibbon: true,
    baseOpacity: .35,
    attraction: 1,
    attractionStrength: 0.12,
    attractionDelay: 0.004,
    attractionRadius: 280,
  },
  {
    amplitude: 100,
    wavelength: 100,
    timeModifier: 1,
    isRibbon: false,
    baseOpacity: 0.45,
    attraction: 1,
    attractionStrength: 0.8,
    attractionDelay: 0.12,
    attractionRadius: 400,
  },
  {
    amplitude: 150,
    wavelength: 150,
    timeModifier: 1,
    isRibbon: false,
    baseOpacity: 0.35,
    attraction: 1,
    attractionStrength: 0.7,
    attractionDelay: 0.18,
    attractionRadius: 350,
  },
  {
    amplitude: 100,
    wavelength: 100,
    timeModifier: 1,
    isRibbon: false,
    baseOpacity: 0.4,
    attraction: 1,
    attractionStrength: 0.6,
    attractionDelay: 0.09,
    attractionRadius: 380,
  },
  {
    amplitude: 50,
    wavelength: 80,
    timeModifier: 1,
    isRibbon: false,
    baseOpacity: 0.25,
    attraction: 1,
    attractionStrength: 0.8,
    attractionDelay: 0.06,
    attractionRadius: 300,
  },
];

// Fixed number of segments per wave. Each segment = one step along x.
// 220 segments across ~95% of a 1920px screen ≈ 8px per step — smooth enough.
const SEGMENTS = 220;
const PI2 = Math.PI * 2;
const HALFPI = Math.PI / 2;

// Suck-pulse: every SUCK_INTERVAL seconds all waves collapse inward, then reverse.
const SUCK_INTERVAL = 18;
const SUCK_SHARP = 2;

// ─── WaveScene class ─────────────────────────────────────────────────────────
//
// A CLASS is a blueprint for objects. `new WaveScene(canvas)` creates one
// instance — its own renderer, scene, camera, geometry, and rAF loop.
// Everything the scene needs to know is stored on `this`.
//
// Method names starting with _ are "private by convention" — they're meant
// to be called only from inside the class, not from outside code.
// JavaScript doesn't enforce this, but the _ is a signal to future readers.

export default class WaveScene {
  // The constructor runs once when you call `new WaveScene(canvas)`.
  // Its job: wire everything up and start the loop.
  constructor(canvas) {
    this._canvas = canvas;
    this._width = window.innerWidth;
    this._height = window.innerHeight;

    // Per-wave delayed mouse tracking — each wave has its own lagging cursor
    // position, which creates the heavy/feather-weight feel difference between waves.
    this._mouseX = this._width / 2;
    this._mouseY = this._height / 2;
    this._waveMouseX = WAVE_CONFIGS.map(() => this._width / 2);
    this._waveMouseY = WAVE_CONFIGS.map(() => this._height / 2);

    // Suck-pulse state
    this._suck = 0;
    this._dirFlipped = false;
    this._direction = -1;
    this._time = 0;
    this._lastFrame = null;

    // Scroll-driven multipliers (updated each frame from getProgress())
    this._ampScale = 1.0;

    this._setupRenderer();
    this._setupScene();
    this._buildWaves();
    this._setupBloom();
    this._setupEvents();

    // Accent colour tint — starts neutral (white = no change to vertex colours).
    // sectionColorTracker calls setAccentColor() as cards scroll into view.
    this._accentTarget = new THREE.Color(1, 1, 1);
    this._accentColor = new THREE.Color(1, 1, 1);

    // .bind(this) is essential: requestAnimationFrame calls _tick as a plain
    // function, losing the class context. bind() locks `this` to this instance.
    this._tick = this._tick.bind(this);
    requestAnimationFrame(this._tick);
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  // Called by sectionColorTracker when the dominant visible project row changes.
  // Stores a target tint; _tick lerps toward it over ~2 seconds.
  //
  // HOW THE TINT WORKS:
  //   Three.js multiplies material.color by the per-vertex colour buffer.
  //   White (1,1,1) × vertex colour = vertex colour unchanged.
  //   A tinted colour shifts the gradient toward the card accent.
  //   We mix only 30% of the accent to preserve the gradient's identity.
  setAccentColor(hex) {
    if (!hex) {
      this._accentTarget.set(1, 1, 1);
      return;
    }
    // 30% accent, 70% white → a subtle shift, not a total override
    this._accentTarget.set(1, 1, 1).lerp(new THREE.Color(hex), 0.3);
  }

  // ── Renderer ────────────────────────────────────────────────────────────────

  _setupRenderer() {
    // WebGLRenderer writes to our existing <canvas id="waves"> element.
    // alpha: true → background stays transparent; the dark page shows through.
    this._renderer = new THREE.WebGLRenderer({
      canvas: this._canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._renderer.setSize(this._width, this._height);
    // LinearToneMapping: pass colours through unchanged.
    // Other options (ACESFilmic, Reinhard) compress highlights — bad for bloom.
    this._renderer.toneMapping = THREE.LinearToneMapping;
  }

  // ── Scene + Camera ──────────────────────────────────────────────────────────

  _setupScene() {
    this._scene = new THREE.Scene();

    // OrthographicCamera — the key to pixel-space math.
    // Unlike a PerspectiveCamera (which distorts distant objects), an ortho
    // camera renders everything at the same scale regardless of depth.
    // By matching the frustum to screen dimensions, worldX = pixelX - width/2.
    this._camera = new THREE.OrthographicCamera(
      -this._width / 2, // left
      this._width / 2, // right
      this._height / 2, // top  (positive = UP in Three.js)
      -this._height / 2, // bottom
      0.1,
      100,
    );
    this._camera.position.z = 10; // camera looks down -Z toward the waves at z=0
  }

  // ── Geometry builders ────────────────────────────────────────────────────────

  _buildWaves() {
    // Map each config to a wave object (geometry + material + mesh).
    // We keep the wave objects in an array so _tick can iterate them each frame.
    this._waves = WAVE_CONFIGS.map((cfg, i) =>
      cfg.isRibbon ? this._buildRibbon(cfg, i) : this._buildLine(cfg, i),
    );
    this._waves.forEach(({ mesh }) => this._scene.add(mesh));
  }

  // Builds a triangle-strip ribbon mesh for thick wave 0.
  //
  // RIBBON GEOMETRY — how a triangle strip works:
  //   For each step along x, we create TWO vertices: one above the curve,
  //   one below. Four adjacent vertices form a quad, split into 2 triangles.
  //
  //   top0 ─── top1 ─── top2 ...
  //    │   ╲    │   ╲    │
  //   bot0 ─── bot1 ─── bot2 ...
  //
  //   Indices for first quad: [top0, bot0, top1,  bot0, bot1, top1]
  //
  // Positions are updated every frame in _updateWave.
  // Colors are baked once here (gradient doesn't change per frame).
  _buildRibbon(cfg, waveIndex) {
    const vertCount = (SEGMENTS + 1) * 2; // 2 verts per step (top + bottom)

    const positions = new Float32Array(vertCount * 3);
    const colors = new Float32Array(vertCount * 3);

    // Indices: 2 triangles × 3 indices = 6 per segment
    const indices = new Uint16Array(SEGMENTS * 6);
    for (let s = 0; s < SEGMENTS; s++) {
      const tl = s * 2; // top-left index
      const bl = tl + 1; // bottom-left
      const tr = tl + 2; // top-right
      const br = tl + 3; // bottom-right
      const b = s * 6;
      indices[b] = tl;
      indices[b + 1] = bl;
      indices[b + 2] = tr;
      indices[b + 3] = bl;
      indices[b + 4] = br;
      indices[b + 5] = tr;
    }

    this._fillGradientColors(colors, SEGMENTS + 1, true);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));

    // MeshBasicMaterial — unlit; outputs exactly the vertex colour.
    // AdditiveBlending: pixel colour = existing background + this mesh's colour.
    // Where waves overlap, colours add together → brighter → more bloom.
    // depthWrite: false — don't occlude anything behind the wave.
    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: cfg.baseOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    return { mesh: new THREE.Mesh(geo, mat), geo, mat, cfg, waveIndex };
  }

  // Builds a polyline for thin waves 1–4.
  // WebGL doesn't support lineWidth > 1 natively, but bloom makes 1px lines
  // glow 3–5px wide at high luminance, which looks better than thick lines anyway.
  _buildLine(cfg, waveIndex) {
    const vertCount = SEGMENTS + 1;

    const positions = new Float32Array(vertCount * 3);
    const colors = new Float32Array(vertCount * 3);

    this._fillGradientColors(colors, vertCount, false);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: cfg.baseOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { mesh: new THREE.Line(geo, mat), geo, mat, cfg, waveIndex };
  }

  // Writes the horizontal pink→turquoise gradient into a colour buffer.
  // Also fades to black at the left and right edges (0..12% and 88..100%).
  // With AdditiveBlending, black = adds nothing = invisible → wave dissolves at edges.
  //
  // paired: true  → ribbon (2 verts per step: colours[s*6] and colours[s*6+3])
  // paired: false → line   (1 vert per step:  colours[s*3])
  _fillGradientColors(colors, steps, paired) {
    for (let s = 0; s < steps; s++) {
      const t = s / (steps - 1); // 0..1 across the wave
      const { r, g, b } = gradientColor(t);

      // Edge fade: smoothly ramp from black at the edges into full colour.
      // This mirrors the canvas `destination-out` edge erase.
      const edge = t < 0.12 ? t / 0.12 : t > 0.88 ? (1 - t) / 0.12 : 1.0;

      if (paired) {
        const i = s * 6;
        // top vertex
        colors[i] = r * edge;
        colors[i + 1] = g * edge;
        colors[i + 2] = b * edge;
        // bottom vertex (same colour)
        colors[i + 3] = r * edge;
        colors[i + 4] = g * edge;
        colors[i + 5] = b * edge;
      } else {
        const i = s * 3;
        colors[i] = r * edge;
        colors[i + 1] = g * edge;
        colors[i + 2] = b * edge;
      }
    }
  }

  // ── Post-processing ─────────────────────────────────────────────────────────

  _setupBloom() {
    // EffectComposer: a chain of rendering passes. Each pass reads the output
    // of the previous one and writes its own output. The final pass goes to screen.
    //
    //   Pass 1: RenderPass    → renders the scene normally into a framebuffer
    //   Pass 2: UnrealBloomPass → reads that framebuffer, adds glow, writes to screen
    this._composer = new EffectComposer(this._renderer);
    this._composer.addPass(new RenderPass(this._scene, this._camera));

    this._bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this._width, this._height),
      0.4, // strength:  how intense the glow is (we animate this from scroll)
      0.8, // radius:    how far the glow spreads outward
      0.05, // luminanceThreshold: pixels above this brightness get a halo
      //                        0.05 = almost everything glows; 0.9 = only near-white
    );
    this._composer.addPass(this._bloomPass);
  }

  // ── Events ──────────────────────────────────────────────────────────────────

  _setupEvents() {
    window.addEventListener("mousemove", (e) => {
      this._mouseX = e.clientX;
      this._mouseY = e.clientY;
    });

    window.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length > 0) {
          this._mouseX = e.touches[0].clientX;
          this._mouseY = e.touches[0].clientY;
        }
      },
      { passive: true },
    );

    window.addEventListener(
      "touchend",
      () => {
        this._mouseX = this._width / 2;
        this._mouseY = this._height / 2;
      },
      { passive: true },
    );

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        this._direction *= -1;
      }
    });

    window.addEventListener("resize", () => this._onResize());
  }

  _onResize() {
    this._width = window.innerWidth;
    this._height = window.innerHeight;

    this._renderer.setSize(this._width, this._height);
    this._composer.setSize(this._width, this._height);

    // Update the camera frustum to match the new window size.
    // Without updateProjectionMatrix(), the camera ignores the new values.
    this._camera.left = -this._width / 2;
    this._camera.right = this._width / 2;
    this._camera.top = this._height / 2;
    this._camera.bottom = -this._height / 2;
    this._camera.updateProjectionMatrix();

    // Re-centre per-wave mouse positions
    this._waveMouseX = this._waveMouseX.map(() => this._width / 2);
    this._waveMouseY = this._waveMouseY.map(() => this._height / 2);
  }

  // ── Per-frame math ───────────────────────────────────────────────────────────

  // Amplitude envelope: fades the wave in from zero at the left edge,
  // holds it at full amplitude across the middle, fades back to zero at the right.
  // Ported directly from SineWaveGenerator.prototype.ease in sineWave.js.
  _edgeEnvelope(t, amplitude) {
    return amplitude * (Math.sin(t * PI2 - HALFPI) + 1) * 0.7;
  }

  // Returns the world-space Y for one vertex on one wave.
  // Pure function: same inputs always produce the same output.
  // This is the core physics of the wave — isolating it here makes it testable.
  //
  // COORDINATE CONVERSION (detailed):
  //   Original finalY  = easedAmp * sin(waveX) + screenCenter + mousePull
  //   Displacement     = finalY - screenCenter = easedAmp * sin(waveX) + mousePull
  //   worldY (Three.js) = -displacement   (Three.js Y is up; canvas Y is down)
  _sineY(stepIndex, cfg, waveIndex) {
    const waveWidth = this._width * 0.95;
    const t = stepIndex / SEGMENTS; // 0..1 along the wave
    const pixelX = t * waveWidth; // pixel position across the wave

    // waveX: the input to sin(). Advances with time and varies across x.
    // Multiplied by 0.4 to match the original `speed: 0.4` config.
    const waveX =
      this._time * 0.4 * cfg.timeModifier +
      (-this._height / 2 + pixelX) / cfg.wavelength;

    const sineVal = Math.sin(waveX);
    const suckedAmplitude =
      cfg.amplitude * this._ampScale * (1 - this._suck * 0.92);
    const envelope = this._edgeEnvelope(t, suckedAmplitude);

    // Mouse attraction — identical logic to sineWave.js
    const cursorX = this._waveMouseX[waveIndex];
    const cursorY = this._waveMouseY[waveIndex]; // CSS pixels from top
    const distX = Math.abs(pixelX - cursorX);
    const pullStrength = Math.pow(
      Math.max(0, 1 - distX / cfg.attractionRadius),
      2,
    );
    const centerBias = 1 - Math.abs(t - 0.5) * 2; // weaker at edges
    const cursorDisplacement = cursorY - this._height / 2; // + = below center
    const mousePull =
      cursorDisplacement *
      pullStrength *
      centerBias *
      cfg.attractionStrength *
      cfg.attraction;

    // Flip sign: canvas Y down → Three.js Y up
    return -(envelope * sineVal + mousePull);
  }

  // ── Per-frame updates ────────────────────────────────────────────────────────

  _updateSuck(nowMs) {
    const ct = nowMs / 1000;
    const suckRaw = Math.abs(Math.sin((ct / SUCK_INTERVAL) * Math.PI));
    this._suck = Math.pow(suckRaw, SUCK_SHARP);

    if (this._suck > 0.9 && !this._dirFlipped) {
      this._direction *= -1;
      this._dirFlipped = true;
    } else if (this._suck < 0.1) {
      this._dirFlipped = false;
    }
  }

  // Exponential smoothing — each wave chases the real cursor at its own rate.
  // A small attractionDelay (0.004) = very sluggish (the "heavy" wave).
  // A large attractionDelay (0.18)  = snappy (the "featherweight" filament).
  // The `dt` (delta-time) correction keeps the speed frame-rate independent.
  _updateMouseTracking(dt) {
    for (let i = 0; i < WAVE_CONFIGS.length; i++) {
      const delay = WAVE_CONFIGS[i].attractionDelay;
      const factor = 1 - Math.pow(1 - delay, dt);
      this._waveMouseX[i] += (this._mouseX - this._waveMouseX[i]) * factor;
      this._waveMouseY[i] += (this._mouseY - this._waveMouseY[i]) * factor;
    }
  }

  // Reads scroll progress (0..1) and drives amplitude, bloom, and canvas opacity.
  //
  // Scroll zones for home.html:
  //   0.00–0.15  Hero section  → calm, dim waves (visitor just arrived)
  //   0.15–0.75  Projects      → waves swell and brighten (depth effect)
  //   0.75–1.00  Contact       → waves gently settle
  _updateScrollEffects(progress) {
    const intoProjects = smooth(range(progress, 0.1, 0.4));
    const intoContact = smooth(range(progress, 0.75, 1.0));

    // Amplitude scale: 1.0 → 1.45 as projects fill the screen → 0.75 at contact
    this._ampScale =
      lerp(1.0, 1.45, intoProjects) * lerp(1.0, 0.75, intoContact);

    // Bloom strength: dim in hero ("behind glass"), vivid in projects
    const bloomTarget =
      lerp(0.3, 1.6, intoProjects) * lerp(1.0, 0.45, intoContact);
    this._bloomPass.strength += (bloomTarget - this._bloomPass.strength) * 0.04;

    // Canvas opacity: same idea — fades in as visitor scrolls deeper
    const opacityTarget =
      lerp(0.55, 0.92, intoProjects) * lerp(1.0, 0.65, intoContact);
    const currentOpacity = parseFloat(this._canvas.style.opacity) || 0.55;
    this._canvas.style.opacity = lerp(currentOpacity, opacityTarget, 0.05);

    // Per-wave material opacities also scale up ("coming into focus")
    for (const { mat, cfg } of this._waves) {
      const target = cfg.baseOpacity * lerp(0.5, 1.0, intoProjects);
      mat.opacity += (target - mat.opacity) * 0.05;
    }
  }

  // Updates one wave's vertex positions for this frame.
  // We write directly into the Float32Array and set needsUpdate = true.
  // Three.js uploads the changed buffer to the GPU on the next render call.
  _updateWave({ geo, cfg, waveIndex }) {
    const pos = geo.attributes.position.array;
    const waveWidth = this._width * 0.95;
    const waveLeft = this._width * 0.025;

    for (let s = 0; s <= SEGMENTS; s++) {
      // worldX: convert pixel position to ortho space (center = 0)
      const worldX = (s / SEGMENTS) * waveWidth + waveLeft - this._width / 2;
      const worldY = this._sineY(s, cfg, waveIndex);

      if (cfg.isRibbon) {
        const halfW = cfg.halfWidth * (1 - this._suck * 0.75);
        const base = s * 6;
        pos[base] = worldX;
        pos[base + 1] = worldY + halfW; // top edge
        pos[base + 2] = 0;
        pos[base + 3] = worldX;
        pos[base + 4] = worldY - halfW; // bottom edge
        pos[base + 5] = 0;
      } else {
        const base = s * 3;
        pos[base] = worldX;
        pos[base + 1] = worldY;
        pos[base + 2] = 0;
      }
    }

    // This flag tells Three.js the buffer has changed and needs a GPU upload.
    // Only position changes each frame — colours are baked and stay static.
    geo.attributes.position.needsUpdate = true;
  }

  // ── Main render loop ─────────────────────────────────────────────────────────

  // Called by requestAnimationFrame with a high-resolution timestamp (milliseconds).
  // Everything that changes per frame lives here or in methods called from here.
  _tick(now) {
    // dt: frames elapsed since last tick (1.0 = exactly one 60fps frame).
    // Capped at 3 to avoid a huge jump after the tab was hidden.
    const dt = Math.min((now - (this._lastFrame ?? now)) / 16.667, 3);
    this._lastFrame = now;
    this._time += 0.007 * this._direction;

    this._updateSuck(now);
    this._updateMouseTracking(dt);
    this._updateScrollEffects(getProgress());

    // Smoothly lerp material tint toward the accent target (~2s transition at 60fps)
    this._accentColor.lerp(this._accentTarget, 0.02);
    for (const { mat } of this._waves) {
      mat.color.copy(this._accentColor);
    }

    for (const waveObj of this._waves) {
      this._updateWave(waveObj);
    }

    // Render through the composer (applies bloom) instead of renderer directly.
    // If we called this._renderer.render() we'd bypass bloom entirely.
    this._composer.render();

    requestAnimationFrame(this._tick);
  }
}

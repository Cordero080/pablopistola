import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE — edit here; hex values render as swatches in your IDE
// ─────────────────────────────────────────────────────────────────────────────

// Panel body base color (very dark, mostly transparent)
const PANEL_COLOR = "#050508"; // near-black with blue cast
const PANEL_EMISSIVE = "#050508"; // self-glow base (same as body)

// Dynamic glow weights — blue-dominant by design (R < G < B)
// Raise a channel to shift the live glow hue toward that color
const GLOW_COLOR_R = 0.6; // color  · red   weight
const GLOW_COLOR_G = 0.7; // color  · green weight
const GLOW_COLOR_B = 1.0; // color  · blue  weight ← dominant
const GLOW_EMIT_R = 0.4; // emissive · red   weight
const GLOW_EMIT_G = 0.5; // emissive · green weight
const GLOW_EMIT_B = 1.0; // emissive · blue  weight ← dominant

// Face edge line colors — one per cube face, shown as swatches
// Order: front · back · right · left · top · bottom
const FACE_EDGE_COLORS = [
  "#0a0e2e", // front  — pink
  "#050413", // back   — magenta
  "#000a38", // right  — blue
  "#061010", // left   — cyan
  "#08050f", // top    — teal
  "#020033", // bottom — purple
];

// ─────────────────────────────────────────────────────────────────────────────
// OPACITY TUNING
// ─────────────────────────────────────────────────────────────────────────────

// Panel fill opacity: base + center-boost * distFromCenter + wave-boost * |wave|
const PANEL_OPACITY_BASE = 0.05;
const PANEL_OPACITY_CENTER = 0.05; // extra opacity toward face center
const PANEL_OPACITY_WAVE = 0.025; // extra opacity when wave is active

// Edge line opacity: same structure as panels
const EDGE_OPACITY_BASE = 0.06;
const EDGE_OPACITY_CENTER = 0.06;
const EDGE_OPACITY_WAVE = 0.025;

// ─────────────────────────────────────────────────────────────────────────────
// MOTION TUNING
// ─────────────────────────────────────────────────────────────────────────────

// Cube rotation speeds (radians/second per axis)
const ROT_Y = 0.018; // yaw   — primary spin
const ROT_X = 0.008; // pitch — slow tilt
const ROT_Z = 0.012; // roll  — subtle twist

// Wave displacement: fraction of cubeSize panels travel when waving
const WAVE_AMPLITUDE = 0.55; // 0 = flat faces, higher = more ripple

// ─────────────────────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────────────────────

const canvas = document.createElement("canvas");
canvas.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;
  pointer-events: none;
`;
document.body.prepend(canvas);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, 1, 0.5, 100);
camera.position.z = 4;

// Lighting — purely structural, colors come from material/emissive above
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const dLight = new THREE.DirectionalLight(0xffffff, 2);
dLight.position.set(5, 6, 5);
scene.add(dLight);

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);

// ─────────────────────────────────────────────────────────────────────────────
// CUBE GEOMETRY
// ─────────────────────────────────────────────────────────────────────────────

const cubeSize = window.innerWidth <= 600 ? 2.4 * 0.9 : 2.4;
const grid = 13; // panels per row/col per face — higher = denser grid
const panelSz = (cubeSize / grid) * 0.98;
const off = cubeSize / 2;
const waveAmp = cubeSize * WAVE_AMPLITUDE;

const faces = [
  {
    dir: new THREE.Vector3(0, 0, 1),
    up: new THREE.Vector3(0, 1, 0),
    pos: new THREE.Vector3(0, 0, off),
  },
  {
    dir: new THREE.Vector3(0, 0, -1),
    up: new THREE.Vector3(0, 1, 0),
    pos: new THREE.Vector3(0, 0, -off),
  },
  {
    dir: new THREE.Vector3(1, 0, 0),
    up: new THREE.Vector3(0, 1, 0),
    pos: new THREE.Vector3(off, 0, 0),
  },
  {
    dir: new THREE.Vector3(-1, 0, 0),
    up: new THREE.Vector3(0, 1, 0),
    pos: new THREE.Vector3(-off, 0, 0),
  },
  {
    dir: new THREE.Vector3(0, 1, 0),
    up: new THREE.Vector3(0, 0, -1),
    pos: new THREE.Vector3(0, off, 0),
  },
  {
    dir: new THREE.Vector3(0, -1, 0),
    up: new THREE.Vector3(0, 0, 1),
    pos: new THREE.Vector3(0, -off, 0),
  },
];

const root = new THREE.Group();
scene.add(root);

const planeGeo = new THREE.PlaneGeometry(panelSz, panelSz);
const panels = [];

faces.forEach((face, fi) => {
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid; col++) {
      // ── Panel fill ──────────────────────────────────────────────────────────
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(PANEL_COLOR),
        emissive: new THREE.Color(PANEL_EMISSIVE),
        emissiveIntensity: 0.2,
        metalness: 0.9,
        roughness: 0.3,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(planeGeo, mat);
      const gridOff = (grid - 1) / 2;
      const localX = (col - gridOff) * (cubeSize / grid);
      const localY = (row - gridOff) * (cubeSize / grid);

      // 0 at edge, 1 at face center — used to boost center brightness
      const distFromCenter =
        1 -
        Math.sqrt(
          Math.pow((col - gridOff) / gridOff, 2) +
            Math.pow((row - gridOff) / gridOff, 2),
        ) /
          Math.SQRT2;

      mesh.position.copy(face.pos);
      mesh.lookAt(face.pos.clone().add(face.dir));
      const right = new THREE.Vector3()
        .crossVectors(face.up, face.dir)
        .normalize();
      mesh.position.add(right.clone().multiplyScalar(localX));
      mesh.position.add(face.up.clone().multiplyScalar(localY));

      // ── Edge outline ─────────────────────────────────────────────────────────
      const edgeGeo = new THREE.EdgesGeometry(
        new THREE.PlaneGeometry(panelSz * 0.97, panelSz * 0.97),
      );
      const edgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(FACE_EDGE_COLORS[fi]),
        transparent: true,
        opacity: EDGE_OPACITY_BASE + distFromCenter * EDGE_OPACITY_CENTER,
      });
      const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMat);

      panels.push({
        mesh,
        edgeMesh,
        basePos: mesh.position.clone(),
        dir: face.dir.clone(),
        phase: fi * 0.5 + row * 0.3 + col * 0.2,
        fi,
        distFromCenter,
      });
      root.add(mesh);
      root.add(edgeMesh);
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION LOOP
// ─────────────────────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

(function loop() {
  if (window.__stopRubix) return;
  requestAnimationFrame(loop);
  const delta = clock.getDelta();
  const ct = clock.elapsedTime;

  // ── Cube rotation ────────────────────────────────────────────────────────
  root.rotation.y += delta * ROT_Y;
  root.rotation.x += delta * ROT_X;
  root.rotation.z += delta * ROT_Z;

  for (const {
    mesh,
    edgeMesh,
    basePos,
    dir,
    phase,
    distFromCenter,
  } of panels) {
    // ── Wave displacement ──────────────────────────────────────────────────
    const wave1 = Math.sin(ct * 0.3 + phase) * 0.5;
    const wave2 = Math.sin(ct * 0.41 + phase * 1.3) * 0.5;
    const wave3 = Math.sin(ct * 0.45 + phase) * 0.2;
    const disp = (wave1 + wave2 + wave3) * waveAmp;
    mesh.position.copy(basePos).addScaledVector(dir, disp);
    edgeMesh.position.copy(mesh.position);
    edgeMesh.quaternion.copy(mesh.quaternion);

    // ── Live glow color ────────────────────────────────────────────────────
    const glow = distFromCenter * 0.06 + Math.abs(wave1) * 0.04;
    mesh.material.color.setRGB(
      glow * GLOW_COLOR_R,
      glow * GLOW_COLOR_G,
      glow * GLOW_COLOR_B,
    );
    mesh.material.emissive.setRGB(
      glow * GLOW_EMIT_R,
      glow * GLOW_EMIT_G,
      glow * GLOW_EMIT_B,
    );
    mesh.material.emissiveIntensity = 0.5 + distFromCenter * 0.4;

    // ── Panel opacity ──────────────────────────────────────────────────────
    mesh.material.opacity =
      PANEL_OPACITY_BASE +
      distFromCenter * PANEL_OPACITY_CENTER +
      Math.abs(wave1) * PANEL_OPACITY_WAVE;
    edgeMesh.material.opacity =
      EDGE_OPACITY_BASE +
      distFromCenter * EDGE_OPACITY_CENTER +
      Math.abs(wave1) * EDGE_OPACITY_WAVE;
  }

  renderer.render(scene, camera);
})();

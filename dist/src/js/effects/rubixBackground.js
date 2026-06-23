import * as THREE from "three";

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  🎨  COLOR PALETTE                                                       ║
// ║  The base color of each flat panel and sphere orb.                       ║
// ║  These are very dark on purpose — the glow colors below do the work.     ║
// ║                                                                          ║
// ║  PANEL_COLOR    → the fill color of each tile (hex)                      ║
// ║  PANEL_EMISSIVE → how much the panel "glows" on its own before glow math ║
// ╚══════════════════════════════════════════════════════════════════════════╝

const PANEL_COLOR = "#050508"; // near-black with a subtle blue cast
const PANEL_EMISSIVE = "#050508"; // keep this the same as PANEL_COLOR

// 🌈  LIVE GLOW — applied per-panel each frame based on wave + position
//
//  Each channel is a 0–1 multiplier. Higher = more of that color in the glow.
//  R < G < B by default → blue-dominant. Want purple? raise R. Want teal? lower R.
//  These only affect the dynamic glow, not the base color above.

const GLOW_COLOR_R = 0.6; // red  contribution to panel color glow
const GLOW_COLOR_G = 0.7; // green contribution
const GLOW_COLOR_B = 1.0; // blue  contribution  ← dominant, keep this highest

const GLOW_EMIT_R = 0.4; // red  contribution to self-emissive glow
const GLOW_EMIT_G = 0.5; // green contribution
const GLOW_EMIT_B = 1.0; // blue  contribution  ← dominant

// 🖊️  EDGE LINE COLORS — one hex per face of the cube
//
//  Order is: front · back · right · left · top · bottom
//  These are the thin outlines around each flat tile.

const FACE_EDGE_COLORS = [
  "#06147f", // front  face edges
  "#050413", // back   face edges
  "#16266b", // right  face edges
  "#432a8b", // left   face edges
  "#08050f", // top    face edges
  "#330015", // bottom face edges
];

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  👁️  OPACITY / TRANSPARENCY                                              ║
// ║  All values are 0–1. 0 = fully invisible, 1 = fully opaque.             ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// Flat panel fill opacity
//  BASE   → minimum opacity every panel always has
//  CENTER → extra opacity added toward the center of each face (brighter center)
//  WAVE   → extra opacity added when the wave is at its peak

const PANEL_OPACITY_BASE = 0.18;
const PANEL_OPACITY_CENTER = 0.15;
const PANEL_OPACITY_WAVE = 0.03;

// Edge line opacity — same three knobs, for the outline lines

const EDGE_OPACITY_BASE = 0.06;
const EDGE_OPACITY_CENTER = 0.06;
const EDGE_OPACITY_WAVE = 0.025;

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  🌀  MOTION — rotation, wave, spin, scale                                ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// 🔄  CUBE ROTATION — how fast the whole cube slowly spins (radians/second)
//  Lower = slower. Set to 0 to freeze that axis.

const ROT_Y = 0.0171; // left–right spin (yaw)   ← main visible spin
const ROT_X = 0.0076; // up–down tilt   (pitch)
const ROT_Z = 0.0114; // clockwise roll (roll)

// 🌊  WAVE — panels ripple in and out from the face surface
//  WAVE_AMPLITUDE: how far panels travel. 0 = flat/no ripple, 1.5 = very dramatic

const WAVE_AMPLITUDE = 0.38;

// 🌀  PANEL SELF-SPIN — each flat tile slowly rotates on its own axis
//  Higher = faster spinning tiles. 0 = no spin. Panels alternate direction.

const PANEL_SPIN_SPEED = 0.2375; // slightly slower than before

// 💓  SCALE BREATHE — tiles gently pulse in size with the wave
//  0 = no size pulse, 0.3 = very noticeable pulse

const SCALE_BREATHE = 0.05;

// 🌈  HUE SHIFT — each face starts at a different color angle, creating variety

const FACE_HUE_OFFSETS = [0, 3.5, 1.0, 1.5, 2.2, 2.8];

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  🔮  MORPH — flat panel tiles ↔ sphere orbs                              ║
// ║                                                                          ║
// ║  CUBE_HOLD   → how many seconds to stay as flat panels before morphing   ║
// ║  MORPH_DUR   → how many seconds the morph transition takes               ║
// ║  SPHERE_HOLD → how many seconds to stay as spheres before morphing back  ║
// ║                                                                          ║
// ║  MORPH_CYCLE is calculated automatically — don't edit it directly.       ║
// ╚══════════════════════════════════════════════════════════════════════════╝

const CUBE_HOLD = 7; // seconds showing flat panels
const MORPH_DUR = 4; // seconds for the morph transition
const SPHERE_HOLD = 8; // seconds showing sphere orbs

const MORPH_CYCLE = CUBE_HOLD + MORPH_DUR + SPHERE_HOLD + MORPH_DUR; // auto

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  🌐  SPHERE ORB OPTIONS                                                  ║
// ║                                                                          ║
// ║  ORB_HUE_SPEED → how fast the orbs slowly shift color while in sphere   ║
// ║                  form. In radians/second. 0.12 = very subtle.            ║
// ║                  0 = no shift, 0.5 = noticeable cycling.                 ║
// ╚══════════════════════════════════════════════════════════════════════════╝

const ORB_HUE_SPEED = 0.12; // radians/second — only active during sphere phase

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  🕸️  CONNECTION LINES                                                    ║
// ║                                                                          ║
// ║  During the sphere phase, thin lines briefly connect adjacent orbs,      ║
// ║  forming a glowing lattice across each face, then fade away.             ║
// ║                                                                          ║
// ║  CONN_DELAY → seconds into the sphere phase before lines appear          ║
// ║  CONN_DUR   → total seconds the lines are visible (including fades)      ║
// ║  CONN_COLOR → hex color of the connecting lines                          ║
// ║  CONN_MAX_OPACITY → how bright the lines get at their peak (0–1)         ║
// ╚══════════════════════════════════════════════════════════════════════════╝

const CONN_DELAY = 2; // seconds into sphere phase before lines appear
const CONN_DUR = 3; // total seconds lines are visible
const CONN_COLOR = 0x6633cc; // cyan — matches the site accent color
const CONN_MAX_OPACITY = 0.15; // subtle; raise for more visible lines

// ─── DO NOT EDIT below this line unless you know Three.js ──────────────────

function smoothstep(x) {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
}

function getMorphT(elapsed) {
  const c = elapsed % MORPH_CYCLE;
  if (c < CUBE_HOLD) return 0;
  if (c < CUBE_HOLD + MORPH_DUR) return smoothstep((c - CUBE_HOLD) / MORPH_DUR);
  if (c < CUBE_HOLD + MORPH_DUR + SPHERE_HOLD) return 1;
  return smoothstep(1 - (c - CUBE_HOLD - MORPH_DUR - SPHERE_HOLD) / MORPH_DUR);
}

// Returns 0–1 opacity for the connection lines based on where we are in the cycle
function getConnOpacity(c) {
  const start = CUBE_HOLD + MORPH_DUR + CONN_DELAY;
  const t = c - start;
  if (t < 0 || t > CONN_DUR) return 0;
  const p = t / CONN_DUR;
  if (p < 1 / 6) return smoothstep(p * 6); // fade in  (first ~0.5s)
  if (p > 5 / 6) return smoothstep((1 - p) * 6); // fade out (last  ~0.5s)
  return 1;
}

// ─── Setup ──────────────────────────────────────────────────────────────────

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

scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const dLight = new THREE.DirectionalLight(0xffffff, 1.1);
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

const cubeSize = window.innerWidth <= 600 ? 2 * 0.9 : 2.4;
const grid = 17;
const panelSz = (cubeSize / grid) * 0.98;
const off = cubeSize / 2;
const waveAmp = cubeSize * WAVE_AMPLITUDE;

const planeGeo = new THREE.PlaneGeometry(panelSz, panelSz);
const orbGeo = new THREE.SphereGeometry(panelSz * 0.46, 7, 5);

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

const panels = [];

faces.forEach((face, fi) => {
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid; col++) {
      const gridOff = (grid - 1) / 2;
      const localX = (col - gridOff) * (cubeSize / grid);
      const localY = (row - gridOff) * (cubeSize / grid);

      const distFromCenter =
        1 -
        Math.sqrt(
          Math.pow((col - gridOff) / gridOff, 2) +
            Math.pow((row - gridOff) / gridOff, 2),
        ) /
          Math.SQRT2;

      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(PANEL_COLOR),
        emissive: new THREE.Color(PANEL_EMISSIVE),
        emissiveIntensity: 0.2,
        metalness: 0.45,
        roughness: 0.35,
        iridescence: 0.5,
        iridescenceIOR: 1.8,
        iridescenceThicknessRange: [100, 400],
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(planeGeo, mat);

      mesh.position.copy(face.pos);
      mesh.lookAt(face.pos.clone().add(face.dir));
      const right = new THREE.Vector3()
        .crossVectors(face.up, face.dir)
        .normalize();
      mesh.position.add(right.clone().multiplyScalar(localX));
      mesh.position.add(face.up.clone().multiplyScalar(localY));

      const edgeGeo = new THREE.EdgesGeometry(
        new THREE.PlaneGeometry(panelSz * 0.97, panelSz * 0.97),
      );
      const edgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(FACE_EDGE_COLORS[fi]),
        transparent: true,
        opacity: EDGE_OPACITY_BASE + distFromCenter * EDGE_OPACITY_CENTER,
      });
      const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMat);

      const orbMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(PANEL_COLOR),
        emissive: new THREE.Color(PANEL_EMISSIVE),
        emissiveIntensity: 0.2,
        metalness: 0.9,
        roughness: 0.2,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.copy(mesh.position);
      orbMesh.scale.setScalar(0);

      const phase = fi * 0.5 + row * 0.3 + col * 0.2;

      panels.push({
        mesh,
        edgeMesh,
        orbMesh,
        mat,
        orbMat,
        edgeMat,
        basePos: mesh.position.clone(),
        dir: face.dir.clone(),
        phase,
        distFromCenter,
        spinRate: Math.sin(phase) * PANEL_SPIN_SPEED,
        hueAngle: FACE_HUE_OFFSETS[fi] + (row + col) / (grid * 1.5),
      });

      root.add(mesh);
      root.add(edgeMesh);
      root.add(orbMesh);
    }
  }
});

// ─── Connection lines — built once, positions updated each frame ─────────────
//
//  Each entry is [panelIndex1, panelIndex2] for a horizontal or vertical neighbor
//  pair within the same face. Lines connect adjacent orb positions.

const connections = [];
for (let fi = 0; fi < 6; fi++) {
  const base = fi * grid * grid;
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid; col++) {
      const idx = base + row * grid + col;
      if (col < grid - 1) connections.push([idx, idx + 1]); // right neighbor
      if (row < grid - 1) connections.push([idx, idx + grid]); // bottom neighbor
    }
  }
}

const connBuf = new Float32Array(connections.length * 6); // 2 pts × 3 floats each
const connAttr = new THREE.BufferAttribute(connBuf, 3);
connAttr.setUsage(THREE.DynamicDrawUsage);
const connGeo = new THREE.BufferGeometry();
connGeo.setAttribute("position", connAttr);

const connMat = new THREE.LineBasicMaterial({
  color: CONN_COLOR,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const connLines = new THREE.LineSegments(connGeo, connMat);
root.add(connLines);

// ─── Animation loop ──────────────────────────────────────────────────────────

const clock = new THREE.Clock();

(function loop() {
  if (window.__stopRubix) return;
  requestAnimationFrame(loop);
  const delta = clock.getDelta();
  const ct = clock.elapsedTime;

  const morphT = getMorphT(ct);
  const flatT = 1 - morphT;
  const orbT = morphT;

  // Hue drift applied only to orbs and only while in sphere form
  const orbHueDrift = ct * ORB_HUE_SPEED * morphT;

  root.rotation.y += delta * ROT_Y;
  root.rotation.x += delta * ROT_X;
  root.rotation.z += delta * ROT_Z;

  for (const p of panels) {
    const {
      mesh,
      edgeMesh,
      orbMesh,
      mat,
      orbMat,
      edgeMat,
      basePos,
      dir,
      phase,
      distFromCenter,
      hueAngle,
    } = p;

    const wave1 = Math.sin(ct * 0.19 + phase) * 0.5;
    const wave2 = Math.sin(ct * 0.26 + phase * 1.3) * 0.5;
    const wave3 = Math.sin(ct * 0.29 + phase) * 0.2;
    const disp = (wave1 + wave2 + wave3) * waveAmp;
    const breathe = 1 + wave1 * SCALE_BREATHE;

    mesh.rotateZ(delta * p.spinRate);

    mesh.position.copy(basePos).addScaledVector(dir, disp);
    mesh.scale.setScalar(breathe * flatT);
    orbMesh.position.copy(mesh.position);
    orbMesh.scale.setScalar(breathe * orbT);
    edgeMesh.position.copy(mesh.position);
    edgeMesh.quaternion.copy(mesh.quaternion);
    edgeMesh.scale.setScalar(breathe * flatT);

    // Panel glow — uses base hueAngle
    const glow = distFromCenter * 0.095 + Math.abs(wave1) * 0.04;
    const cosH = Math.cos(hueAngle);
    const sinH = Math.sin(hueAngle);

    const cr = glow * (GLOW_COLOR_R + 0.2 * cosH);
    const cg = glow * (GLOW_COLOR_G + 0.2 * sinH);
    const cb = glow * GLOW_COLOR_B;
    const er = glow * (GLOW_EMIT_R + 0.15 * cosH);
    const eg = glow * (GLOW_EMIT_G + 0.15 * sinH);
    const eb = glow * GLOW_EMIT_B;
    const emitInt = 0.2 + distFromCenter * 0.15;

    mat.color.setRGB(cr, cg, cb);
    mat.emissive.setRGB(er, eg, eb);
    mat.emissiveIntensity = emitInt;

    // Orb glow — adds the slow hue drift on top
    const orbH = hueAngle + orbHueDrift;
    const cosHOrb = Math.cos(orbH);
    const sinHOrb = Math.sin(orbH);
    orbMat.color.setRGB(
      glow * (GLOW_COLOR_R + 0.2 * cosHOrb),
      glow * (GLOW_COLOR_G + 0.2 * sinHOrb),
      glow * GLOW_COLOR_B,
    );
    orbMat.emissive.setRGB(
      glow * (GLOW_EMIT_R + 0.15 * cosHOrb),
      glow * (GLOW_EMIT_G + 0.15 * sinHOrb),
      glow * GLOW_EMIT_B,
    );
    orbMat.emissiveIntensity = emitInt;

    const baseOp =
      PANEL_OPACITY_BASE +
      distFromCenter * PANEL_OPACITY_CENTER +
      Math.abs(wave1) * PANEL_OPACITY_WAVE;
    mat.opacity = baseOp * flatT;
    orbMat.opacity = baseOp * 2 * orbT;
    edgeMat.opacity =
      (EDGE_OPACITY_BASE +
        distFromCenter * EDGE_OPACITY_CENTER +
        Math.abs(wave1) * EDGE_OPACITY_WAVE) *
      flatT;
  }

  // ── Connection lines — update positions and opacity ───────────────────────
  const connOpacity = getConnOpacity(ct % MORPH_CYCLE) * CONN_MAX_OPACITY;
  connMat.opacity = connOpacity;

  if (connOpacity > 0) {
    // Update line endpoints from current orb positions
    for (let i = 0; i < connections.length; i++) {
      const [i1, i2] = connections[i];
      const p1 = panels[i1].mesh.position;
      const p2 = panels[i2].mesh.position;
      const o = i * 6;
      connBuf[o] = p1.x;
      connBuf[o + 1] = p1.y;
      connBuf[o + 2] = p1.z;
      connBuf[o + 3] = p2.x;
      connBuf[o + 4] = p2.y;
      connBuf[o + 5] = p2.z;
    }
    connAttr.needsUpdate = true;
  }

  renderer.render(scene, camera);
})();

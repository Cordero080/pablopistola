import * as THREE from "three";
import { renderer, scene, camera } from "./scene.js";
import {
  root,
  panels,
  connections,
  connBuf,
  connAttr,
  connMat,
  waveAmp,
} from "./geometry.js";
import {
  CUBE_HOLD,
  MORPH_DUR,
  SPHERE_HOLD,
  MORPH_CYCLE,
  CONN_DELAY,
  CONN_DUR,
  CONN_MAX_OPACITY,
  ROT_Y,
  ROT_X,
  ROT_Z,
  ORB_HUE_SPEED,
  GLOW_COLOR_R,
  GLOW_COLOR_G,
  GLOW_COLOR_B,
  GLOW_EMIT_R,
  GLOW_EMIT_G,
  GLOW_EMIT_B,
  PANEL_OPACITY_BASE,
  PANEL_OPACITY_CENTER,
  PANEL_OPACITY_WAVE,
  EDGE_OPACITY_BASE,
  EDGE_OPACITY_CENTER,
  EDGE_OPACITY_WAVE,
  SCALE_BREATHE,
} from "./config.js";

function smoothstep(x) {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
}

const INTRO_DUR = 2.0; // seconds for panels to assemble
const INTRO_STAGGER = 0.6; // max time offset between first and last panel

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

    // Intro assembly — panels fly from random scatter toward their basePos
    const introProgress = Math.min(
      Math.max((ct - p.stagger * INTRO_STAGGER) / INTRO_DUR, 0),
      1,
    );
    const introEase = smoothstep(introProgress);

    const tX = basePos.x + dir.x * disp;
    const tY = basePos.y + dir.y * disp;
    const tZ = basePos.z + dir.z * disp;
    mesh.position.set(
      p.scatterPos.x + (tX - p.scatterPos.x) * introEase,
      p.scatterPos.y + (tY - p.scatterPos.y) * introEase,
      p.scatterPos.z + (tZ - p.scatterPos.z) * introEase,
    );
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
      glow * (GLOW_COLOR_R + 0.5 * cosHOrb),
      glow * (GLOW_COLOR_G + 0.5 * sinHOrb),
      glow * GLOW_COLOR_B,
    );
    orbMat.emissive.setRGB(
      glow * (GLOW_EMIT_R + 0.2 * cosHOrb),
      glow * (GLOW_EMIT_G + 0.2 * sinHOrb),
      glow * GLOW_EMIT_B,
    );
    orbMat.emissiveIntensity = emitInt;

    const baseOp =
      PANEL_OPACITY_BASE +
      distFromCenter * PANEL_OPACITY_CENTER +
      Math.abs(wave1) * PANEL_OPACITY_WAVE;
    mat.opacity = baseOp * flatT * introEase;
    orbMat.opacity = baseOp * 2 * orbT * introEase;
    edgeMat.opacity =
      (EDGE_OPACITY_BASE +
        distFromCenter * EDGE_OPACITY_CENTER +
        Math.abs(wave1) * EDGE_OPACITY_WAVE) *
      flatT *
      introEase;
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

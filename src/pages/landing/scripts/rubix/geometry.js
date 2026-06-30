import * as THREE from "three";
import { scene } from "./scene.js";
import {
  PANEL_COLOR,
  PANEL_EMISSIVE,
  FACE_EDGE_COLORS,
  EDGE_OPACITY_BASE,
  EDGE_OPACITY_CENTER,
  WAVE_AMPLITUDE,
  PANEL_SPIN_SPEED,
  FACE_HUE_OFFSETS,
  CONN_COLOR,
} from "./config.js";

const cubeSize = window.innerWidth <= 600 ? 2 * 1.1 : 3.0;
const grid = 13;
const panelSz = (cubeSize / grid) * 0.98;
const off = cubeSize / 2;
export const waveAmp = cubeSize * WAVE_AMPLITUDE;

const planeGeo = new THREE.PlaneGeometry(panelSz, panelSz);
const orbGeo = new THREE.SphereGeometry(panelSz * 0.46, 7, 5);

// Shared circle-outline geometry, inscribed in the plane (radius = panelSz/2).
const circleEdgeGeo = (() => {
  const segments = 40;
  const r = panelSz * 0.485;
  const pos = new Float32Array(segments * 2 * 3);
  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * Math.PI * 2;
    const a2 = ((i + 1) / segments) * Math.PI * 2;
    pos[i * 6 + 0] = Math.cos(a1) * r;
    pos[i * 6 + 1] = Math.sin(a1) * r;
    pos[i * 6 + 2] = 0;
    pos[i * 6 + 3] = Math.cos(a2) * r;
    pos[i * 6 + 4] = Math.sin(a2) * r;
    pos[i * 6 + 5] = 0;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return g;
})();

// Shared uniform that morphs the panel shape from square (0) → circle (1).
// All panel materials wire this same uniform via onBeforeCompile so Three.js
// dedupes shader compilation and the per-fragment cost is just a mix + discard.
export const circleUniform = { value: 0 };

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

export const root = new THREE.Group();
scene.add(root);

export const panels = [];

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
        metalness: 0.95,
        roughness: 0.06,
        iridescence: 0.5,
        iridescenceIOR: 1.8,
        iridescenceThicknessRange: [100, 400],
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      // Inject a discard-by-distance fragment chunk so the plane can morph
      // from a square to an inscribed circle via the shared circleUniform.
      mat.defines = mat.defines || {};
      mat.defines.USE_UV = "";
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uCirc = circleUniform;
        shader.fragmentShader =
          "uniform float uCirc;\n" +
          shader.fragmentShader.replace(
            "#include <clipping_planes_fragment>",
            `#include <clipping_planes_fragment>
             vec2 _cuv = vUv - 0.5;
             float _sqD = max(abs(_cuv.x), abs(_cuv.y)) * 2.0;
             float _ciD = length(_cuv) * 2.0;
             if (mix(_sqD, _ciD, uCirc) > 1.0) discard;`,
          );
      };
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

      const circleEdgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(FACE_EDGE_COLORS[fi]),
        transparent: true,
        opacity: 0,
      });
      const circleEdgeMesh = new THREE.LineSegments(
        circleEdgeGeo,
        circleEdgeMat,
      );
      circleEdgeMesh.position.copy(mesh.position);
      circleEdgeMesh.quaternion.copy(mesh.quaternion);

      const phase = fi * 0.5 + row * 0.3 + col * 0.2;

      // Random scatter position — each panel starts far from origin
      const sTheta = Math.random() * Math.PI * 2;
      const sPhi = Math.acos(2 * Math.random() - 1);
      const sR = 12 + Math.random() * 6;
      const scatterPos = new THREE.Vector3(
        sR * Math.sin(sPhi) * Math.cos(sTheta),
        sR * Math.sin(sPhi) * Math.sin(sTheta),
        sR * Math.cos(sPhi),
      );
      const stagger = (phase % (Math.PI * 2)) / (Math.PI * 2);

      panels.push({
        mesh,
        edgeMesh,
        orbMesh,
        circleEdgeMesh,
        mat,
        orbMat,
        edgeMat,
        circleEdgeMat,
        basePos: mesh.position.clone(),
        dir: face.dir.clone(),
        phase,
        distFromCenter,
        spinRate: Math.sin(phase) * PANEL_SPIN_SPEED,
        hueAngle: FACE_HUE_OFFSETS[fi] + (row + col) / (grid * 1.5),
        scatterPos,
        stagger,
      });

      root.add(mesh);
      root.add(edgeMesh);
      root.add(orbMesh);
      root.add(circleEdgeMesh);
    }
  }
});

// ─── Connection lines — built once, positions updated each frame ─────────────
//
//  Each entry is [panelIndex1, panelIndex2] for a horizontal or vertical neighbor
//  pair within the same face. Lines connect adjacent orb positions.

export const connections = [];
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

export const connBuf = new Float32Array(connections.length * 6); // 2 pts × 3 floats each
export const connAttr = new THREE.BufferAttribute(connBuf, 3);
connAttr.setUsage(THREE.DynamicDrawUsage);
const connGeo = new THREE.BufferGeometry();
connGeo.setAttribute("position", connAttr);

export const connMat = new THREE.LineBasicMaterial({
  color: CONN_COLOR,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const connLines = new THREE.LineSegments(connGeo, connMat);
root.add(connLines);

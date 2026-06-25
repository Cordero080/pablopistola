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

      // Random scatter position — each panel starts far from origin
      const sTheta = Math.random() * Math.PI * 2;
      const sPhi = Math.acos(2 * Math.random() - 1);
      const sR = 12 + Math.random() * 6;
      const scatterPos = new THREE.Vector3(
        sR * Math.sin(sPhi) * Math.cos(sTheta),
        sR * Math.sin(sPhi) * Math.sin(sTheta),
        sR * Math.cos(sPhi)
      );
      const stagger = (phase % (Math.PI * 2)) / (Math.PI * 2);

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
        scatterPos,
        stagger,
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

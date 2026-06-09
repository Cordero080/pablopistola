import * as THREE from "three";

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
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x020005);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, 1, 0.5, 100);
camera.position.z = 4;

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

// Build cube with waving panels (ported from RubixOverlay)
const cubeSize = window.innerWidth <= 600 ? 2.4 * 0.9 : 2.4;
const grid = 13;
const panelSz = (cubeSize / grid) * 0.98;
const off = cubeSize / 2;
const waveAmp = cubeSize * 0.35;

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
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#050508"),
        emissive: new THREE.Color("#050508"),
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
      // Distance from face center (0=edge, 1=center)
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
      // Glowing edge outline per panel
      const edgeGeo = new THREE.EdgesGeometry(
        new THREE.PlaneGeometry(panelSz * 0.97, panelSz * 0.97),
      );
      // Muted theme colors per face: pink, magenta, blue, cyan, teal, purple
      const faceColors = [
        [0.18, 0.04, 0.1], // pink
        [0.18, 0.0, 0.18], // magenta
        [0.0, 0.04, 0.22], // blue
        [0.0, 0.18, 0.18], // cyan
        [0.0, 0.15, 0.14], // teal
        [0.1, 0.0, 0.2], // purple
      ];
      const [cr, cg, cb] = faceColors[fi];
      const edgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(cr, cg, cb),
        transparent: true,
        opacity: 0.06 + distFromCenter * 0.06,
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

// Animation
const clock = new THREE.Clock();

(function loop() {
  requestAnimationFrame(loop);
  const delta = clock.getDelta();
  const ct = clock.elapsedTime;

  root.rotation.y += delta * 0.018;
  root.rotation.x += delta * 0.008;
  root.rotation.z += delta * 0.012;

  for (const {
    mesh,
    edgeMesh,
    basePos,
    dir,
    phase,
    fi,
    distFromCenter,
  } of panels) {
    const wave1 = Math.sin(ct * 0.3 + phase) * 0.5;
    const wave2 = Math.sin(ct * 0.41 + phase * 1.3) * 0.5;
    const wave3 = Math.sin(ct * 0.45 + fi) * 0.2;
    const disp = (wave1 + wave2 + wave3) * waveAmp;
    mesh.position.copy(basePos).addScaledVector(dir, disp);
    edgeMesh.position.copy(mesh.position);
    edgeMesh.quaternion.copy(mesh.quaternion);

    const glow = distFromCenter * 0.06 + Math.abs(wave1) * 0.04;
    mesh.material.color.setRGB(glow * 0.6, glow * 0.7, glow);
    mesh.material.emissive.setRGB(glow * 0.4, glow * 0.5, glow);
    mesh.material.emissiveIntensity = 0.5 + distFromCenter * 0.4;
    mesh.material.opacity =
      0.05 + distFromCenter * 0.05 + Math.abs(wave1) * 0.025;

    edgeMesh.material.opacity =
      0.05 + distFromCenter * 0.05 + Math.abs(wave1) * 0.025;
  }

  renderer.render(scene, camera);
})();

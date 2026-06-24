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

export const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(100, 1, 0.5, 100);
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

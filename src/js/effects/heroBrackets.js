/**
 * heroBrackets.js
 * 3D [ ] brackets flanking the hero content block — Three.js, black + directional light.
 */

import * as THREE from "three";

const heroSection = document.querySelector(".hero-section");
if (heroSection) {
  // ── Canvas overlay ──────────────────────────────────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 1;
  `;
  heroSection.appendChild(canvas);

  // ── Renderer ────────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ── Scene & Camera ──────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 5;

  // ── Lighting — grazing lights to catch bevel edges on a black body ──────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.01)); // almost nothing — keep body dark

  // Key: upper-right, grazes the top bar bevel and front face edge
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(3, 4, 3);
  scene.add(key);

  // Side: hits the extrusion depth sides and inner stem edges
  const side = new THREE.DirectionalLight(0xffffff, 3);
  side.position.set(0.1, 0, 3);
  scene.add(side);

  // Bottom-front: catches the bottom bar bevel
  const low = new THREE.DirectionalLight(0xffffff, 2);
  low.position.set(0, -5, 4);
  scene.add(low);

  // ── Bracket geometry ────────────────────────────────────────────────────────
  function makeBracketShape() {
    const shape = new THREE.Shape();
    const w = 0.38; // horizontal span
    const h = 2.0; // total height
    const t = 0.18; // bar + stem thickness

    // [ shape — opening faces RIGHT (positive X)
    shape.moveTo(0, 0);
    shape.lineTo(w, 0);
    shape.lineTo(w, t);
    shape.lineTo(t, t);
    shape.lineTo(t, h - t);
    shape.lineTo(w, h - t);
    shape.lineTo(w, h);
    shape.lineTo(0, h);
    shape.closePath();
    return shape;
  }

  const extrudeSettings = {
    depth: 0.36,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.04,
    bevelThickness: 0.04,
  };

  const geo = new THREE.ExtrudeGeometry(makeBracketShape(), extrudeSettings);
  geo.translate(-0.11, -1.0, -0.14); // centre at origin

  // Phong: near-black body, bright white specular — edges catch the light, faces stay dark
  const material = new THREE.MeshPhongMaterial({
    color: 0x050505,
    specular: 0xffffff,
    shininess: 180,
  });

  // Left  [
  const leftBracket = new THREE.Mesh(geo, material);
  scene.add(leftBracket);

  // Right ] — rotate 180° on Y so opening faces LEFT, normals stay correct
  const rightBracket = new THREE.Mesh(geo, material);
  rightBracket.rotation.y = Math.PI;
  scene.add(rightBracket);

  // ── Sizing & positioning ────────────────────────────────────────────────────
  function resize() {
    const rect = heroSection.getBoundingClientRect();
    const W = rect.width;
    const H = Math.max(rect.height, 180);

    renderer.setSize(W, H);
    canvas.style.height = H + "px";
    camera.aspect = W / H;
    camera.updateProjectionMatrix();

    const isMobileView = W <= 600;

    const vFov = (camera.fov * Math.PI) / 180;
    const worldH = 2 * Math.tan(vFov / 2) * camera.position.z;
    const worldW = worldH * camera.aspect;
    const pxToWorld = worldH / H;

    const scaleFactor = isMobileView ? 0.19 : W <= 900 ? 0.2 : 0.18;
    const s = (H * scaleFactor * pxToWorld) / 2.2;
    leftBracket.scale.set(s, s, s);
    rightBracket.scale.set(s, s, s);

    let offsetWorld;
    // Both mobile and desktop: hug the actual title width
    const heroTitle = heroSection.querySelector(".hero-title");
    const halfContentPx = heroTitle
      ? heroTitle.getBoundingClientRect().width / 2
      : W * 0.28;
    const padding = isMobileView ? 18 : 32; // tighter gap on mobile
    offsetWorld = Math.min((halfContentPx + padding) * pxToWorld, worldW * 0.46);

    leftBracket.position.x = -offsetWorld;
    rightBracket.position.x = offsetWorld;
    const bracketY = isMobileView ? -0.37 : W <= 900 ? 0.05 : -0.32;
    leftBracket.position.y = bracketY;
    rightBracket.position.y = bracketY;
    rightBracket.position.z = -0.23;
  }

  // ── Animation — very subtle tilt, face-on ───────────────────────────────────
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.004;

    // Tiny rocking — just enough to catch the light, never spin away
    const tilt = Math.sin(time * 0.5) * 0.06;
    leftBracket.rotation.y = tilt;
    rightBracket.rotation.y = Math.PI - tilt;

    renderer.render(scene, camera);
  }

  // ── Fade out on scroll — counterscroll keeps brackets pinned while fading ──
  window.addEventListener(
    "scroll",
    () => {
      const rect = heroSection.getBoundingClientRect();
      const heroH = heroSection.offsetHeight;
      const scrolledPx = Math.max(0, -rect.top);
      // fade starts when hero top hits 0, fully gone at 40% scrolled
      const ratio = Math.min(1, scrolledPx / (heroH * 0.4));
      canvas.style.opacity = 1 - ratio;
      // counteract parent scroll so brackets stay visually fixed in place
      canvas.style.transform = `translateY(${scrolledPx}px)`;
    },
    { passive: true },
  );

  // ── Init ────────────────────────────────────────────────────────────────────
  window.addEventListener("resize", resize);
  requestAnimationFrame(() => {
    resize();
    animate();
  });

  // ── Complementary color mode — invert bracket material ──────────────────────
  function applyCompMode(active) {
    if (active) {
      material.color.set(0xfafafa); // near-white body
      material.specular.set(0x111111); // dark specular — edges go dark
    } else {
      material.color.set(0x050505); // near-black body
      material.specular.set(0xffffff); // white specular — edges catch light
    }
    material.needsUpdate = true;
  }

  // Sync on load (in case comp mode was already active)
  applyCompMode(document.body.classList.contains("complementary-colors"));

  // Watch for future toggles
  new MutationObserver(() => {
    applyCompMode(document.body.classList.contains("complementary-colors"));
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

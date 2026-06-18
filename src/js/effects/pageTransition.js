import * as THREE from "three";

const COLS = 14;
const ROWS = 8;
const EXIT_MS = 720;
const ENTRY_MS = 600;
const STAGGER_WINDOW = 0.72;

let renderer, scene, camera, canvasEl, panels, animFrame;

function smoothstep(x) {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
}

function build() {
  canvasEl = document.createElement("canvas");
  canvasEl.style.cssText =
    "position:fixed;inset:0;z-index:9999;pointer-events:none;width:100%;height:100%;";
  document.body.appendChild(canvasEl);

  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    antialias: false,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dl = new THREE.DirectionalLight(0xffffff, 3);
  dl.position.set(3, 4, 5);
  scene.add(dl);

  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
  camera.position.z = 5;

  panels = [];
  rebuildPanels();
}

function rebuildPanels() {
  panels.forEach(({ mesh, mat, geo }) => {
    scene.remove(mesh);
    geo.dispose();
    mat.dispose();
  });
  panels = [];

  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);

  const aspect = w / h;
  camera.left = -aspect;
  camera.right = aspect;
  camera.updateProjectionMatrix();

  const tileW = (2 * aspect) / COLS;
  const tileH = 2 / ROWS;
  const centerCol = (COLS - 1) / 2;
  const centerRow = (ROWS - 1) / 2;
  const maxDist = Math.sqrt(centerCol ** 2 + centerRow ** 2);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const geo = new THREE.PlaneGeometry(tileW * 0.99, tileH * 0.99);
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#060409"),
        metalness: 0.95,
        roughness: 0.06,
        iridescence: 0.55,
        iridescenceIOR: 1.8,
        iridescenceThicknessRange: [100, 400],
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        -aspect + tileW * (col + 0.5),
        -1 + tileH * (row + 0.5),
        0,
      );
      // slight random tilt so iridescence catches light differently per tile
      mesh.rotation.z = (Math.random() - 0.5) * 0.08;
      // start invisible: full width, zero height
      mesh.scale.set(1, 0, 1);
      scene.add(mesh);

      const distFromCenter =
        Math.sqrt((col - centerCol) ** 2 + (row - centerRow) ** 2) / maxDist;

      panels.push({ mesh, geo, mat, distFromCenter });
    }
  }
}

function teardown() {
  cancelAnimationFrame(animFrame);
  panels.forEach(({ mesh, mat, geo }) => {
    scene.remove(mesh);
    geo.dispose();
    mat.dispose();
  });
  renderer.dispose();
  canvasEl?.remove();
  panels = [];
  renderer = scene = camera = canvasEl = null;
}

// direction:  1 = cover screen (exit),  -1 = uncover screen (entry)
// staggerDir: 1 = edges first,          -1 = center first
function animate(direction, staggerDir, duration, onDone) {
  const start = performance.now();

  function tick() {
    const progress = Math.min((performance.now() - start) / duration, 1);

    panels.forEach(({ mesh, distFromCenter }) => {
      // staggerDir 1 = edges first (distFromCenter ~1 → stagger ~0)
      // staggerDir -1 = center first (distFromCenter ~0 → stagger ~0)
      const stagger =
        staggerDir === 1
          ? 1 - distFromCenter // edges have lower stagger → appear first
          : distFromCenter; // center has lower stagger → appear first

      const panelProgress =
        (progress - stagger * (1 - STAGGER_WINDOW)) / STAGGER_WINDOW;
      const t = smoothstep(Math.max(0, Math.min(1, panelProgress)));
      // Y-scale only — venetian blind effect, never grows from a center dot
      mesh.scale.y = direction === 1 ? t : 1 - t;
    });

    renderer.render(scene, camera);

    if (progress < 1) {
      animFrame = requestAnimationFrame(tick);
    } else {
      onDone?.();
    }
  }

  animFrame = requestAnimationFrame(tick);
}

// Cover the screen (edge-in), then navigate
export function playExit(href) {
  build();
  animate(1, 1, EXIT_MS, () => {
    window.location.href = href;
  });
}

// Panels already covering — sweep out from center to reveal page
export function playEntry() {
  build();
  panels.forEach(({ mesh }) => mesh.scale.set(1, 1, 1));
  renderer.render(scene, camera);

  requestAnimationFrame(() => {
    animate(-1, -1, ENTRY_MS, () => teardown());
  });
}

export function init() {
  // Intercept same-origin link clicks
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto") ||
      href.startsWith("tel") ||
      link.target === "_blank" ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey
    )
      return;
    e.preventDefault();
    sessionStorage.setItem("pt", "1");
    playExit(href);
  });

  // Play entry reveal if we navigated here via a transition
  if (sessionStorage.getItem("pt")) {
    sessionStorage.removeItem("pt");
    playEntry();
  }
}

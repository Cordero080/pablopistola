import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const MODEL_BASE = "/models/xenotchi";

const animConfig = {
  blue: {
    idle: {
      file: "blue_happy_idle.fbx",
      scale: [0.00163, 0.00163, 0.00163],
      position: [0, 0.2, -3],
      rotationY: -Math.PI / -16,
    },
    feed: {
      file: "FEED.fbx",
      scale: [0.0008, 0.0008, 0.0008],
      position: [1, 0.1, -1],
      rotationY: -Math.PI / 1,
    },
    dance: {
      file: "blue_robot.fbx",
      scale: [0.00247, 0.00247, 0.00247],
      position: [0, -3, -6.5],
      rotationY: Math.PI / 9,
    },
    sleep: {
      file: "SLEEP.fbx",
      scale: [0.0018, 0.0018, 0.0018],
      position: [-7.8, -2.8, -4.9],
      rotationY: Math.PI / 5,
    },
    train: {
      file: "cat_punch_kick.fbx",
      scale: [0.00189, 0.00189, 0.00189],
      position: [0, -1.9, -4],
      rotationY: Math.PI / 9,
    },
  },
  green: {
    idle: {
      file: "green_drunk.fbx",
      scale: [0.00186, 0.00186, 0.00186],
      position: [0, -1.5, -3],
      rotationY: -Math.PI / -16,
    },
    feed: {
      file: "green_eat.fbx",
      scale: [0.00427, 0.00427, 0.00427],
      position: [-5.5, -4.5, -14],
      rotationY: -Math.PI / 1.2,
    },
    dance: {
      file: "green_thrille4.fbx",
      scale: [0.00463, 0.00463, 0.00463],
      position: [7, -6, -20.9],
      rotationY: Math.PI / -6,
    },
    sleep: {
      file: "green_sleep.fbx",
      scale: [0.00539, 0.00539, 0.00539],
      position: [-18.3, -3.5, -15.9],
      rotationY: Math.PI / 5,
    },
    train: {
      file: "green_butterfly.fbx",
      scale: [0.0039, 0.0039, 0.0039],
      position: [-3.5, -5.2, -18],
      rotationY: Math.PI / 12,
    },
  },
};

const chatLines = {
  feed: "🍽️ This is so good, it's actually making me angry. How dare you set the bar this high? Hit the spot!",
  dance: "I gets BUZY! Pawz on fire!",
  sleep: "😴 Got tickets to the blanket show...zzz",
  train:
    "🐉 The purpose of today's training is to defeat yesterday's understanding.",
  idleBlue: "Ready to go! What do you want to do?",
  idleGreen: "Evolved and ready! What's the move? 💚",
};

let scene, camera, renderer, petRoot, mixer, clock;
let activeModel = null;
let lastBaseScale = [0.001, 0.001, 0.001];
let loadToken = 0;
let currentStage = "blue";
let busy = false;

const container = document.getElementById("pet-container");
const loadingEl = document.getElementById("scene-loading");
const chatEl = document.getElementById("petChat");

function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = null;

  petRoot = new THREE.Group();
  scene.add(petRoot);

  scene.add(new THREE.AmbientLight(0x0000ff, 1.4));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.castShadow = true;
  dirLight.position.set(-2, 10, 6.5);
  scene.add(dirLight);

  const pinkLight = new THREE.DirectionalLight(0xff00ff, 1.5);
  pinkLight.position.set(2, 4, 2);
  scene.add(pinkLight);

  const topLight = new THREE.DirectionalLight(0xff0099, 0.8);
  topLight.position.set(0, 5, 0);
  topLight.castShadow = true;
  scene.add(topLight);

  const sideLight = new THREE.DirectionalLight(0x0000ff, 0.5);
  sideLight.position.set(-5, 2, 0);
  sideLight.castShadow = true;
  scene.add(sideLight);

  const backLight = new THREE.DirectionalLight(0x00ffff, 0.3);
  backLight.position.set(0, 2, -5);
  backLight.castShadow = true;
  scene.add(backLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.ShadowMaterial({ opacity: 0.3 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.7;
  ground.receiveShadow = true;
  scene.add(ground);

  camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 1.5, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearAlpha(0);
  container.appendChild(renderer.domElement);

  resizeRendererToContainer();
  window.addEventListener("resize", resizeRendererToContainer);

  animate();
  loadAnim("idle");
}

function resizeRendererToContainer() {
  const width = Math.floor(container.offsetWidth);
  const height = Math.floor(container.offsetHeight);
  renderer.setSize(width, height, true);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  fitModelForViewport(activeModel);
}

function fitModelForViewport(model) {
  if (!model) return;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (!isMobile) {
    model.scale.set(...lastBaseScale);
    return;
  }
  const w = container ? container.clientWidth : window.innerWidth;
  const t = Math.max(360, Math.min(900, w));
  const k = 1.21 - ((t - 360) / (900 - 360)) * 0.21;
  model.scale.set(
    lastBaseScale[0] * k,
    lastBaseScale[1] * k,
    lastBaseScale[2] * k,
  );
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
}

function clearModel() {
  if (!activeModel) return;
  petRoot.remove(activeModel);
  activeModel.traverse((child) => {
    if (child.isMesh) {
      child.geometry?.dispose();
      if (Array.isArray(child.material))
        child.material.forEach((m) => m.dispose());
      else child.material?.dispose();
    }
  });
  activeModel = null;
  mixer = null;
}

async function loadAnim(action, loop = true) {
  const cfg = animConfig[currentStage][action];
  if (!cfg) return 0;

  const myToken = ++loadToken;
  const loaderTimer = setTimeout(() => {
    if (loadToken === myToken) {
      loadingEl.classList.remove("hidden");
      loadingEl.querySelector("span").textContent = "Loading model…";
    }
  }, 300);

  try {
    const fbx = await new Promise((res, rej) =>
      new FBXLoader().load(`${MODEL_BASE}/${cfg.file}`, res, undefined, rej),
    );

    if (loadToken !== myToken) return 0;

    clearTimeout(loaderTimer);
    loadingEl.classList.add("hidden");
    clearModel();

    const [sx, sy, sz] = cfg.scale;
    const [px = 0, py = -1, pz = 0] = cfg.position;

    fbx.scale.set(sx, sy, sz);
    fbx.position.set(px, py, pz);
    fbx.rotation.y = cfg.rotationY ?? 0;

    fbx.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    petRoot.add(fbx);
    activeModel = fbx;
    lastBaseScale = [sx, sy, sz];
    fitModelForViewport(activeModel);

    mixer = new THREE.AnimationMixer(fbx);
    const clip = fbx.animations?.[0];
    if (clip) {
      const act = mixer.clipAction(clip);
      act.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
      if (!loop) act.clampWhenFinished = true;
      act.play();
    }

    return clip ? clip.duration * 1000 : 2500;
  } catch (err) {
    clearTimeout(loaderTimer);
    loadingEl.classList.remove("hidden");
    loadingEl.querySelector("span").textContent = "Model unavailable";
    console.error("FBX load error:", err);
    return 0;
  }
}

async function doAction(action) {
  if (busy) return;
  busy = true;
  setButtonsDisabled(true);
  chatEl.textContent = chatLines[action] ?? "…";

  const duration = await loadAnim(action, false);
  if (duration > 0) await delay(Math.min(duration, 7000));

  const idleKey = currentStage === "blue" ? "idleBlue" : "idleGreen";
  chatEl.textContent = chatLines[idleKey];
  await loadAnim("idle", true);

  busy = false;
  setButtonsDisabled(false);
}

function setButtonsDisabled(val) {
  document.querySelectorAll(".Buttons").forEach((b) => (b.disabled = val));
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

document.querySelectorAll(".stage-tab").forEach((tab) => {
  tab.addEventListener("click", async () => {
    if (busy) return;
    const stage = tab.dataset.stage;
    if (stage === currentStage) return;

    currentStage = stage;
    document.querySelectorAll(".stage-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.stage === stage);
      t.setAttribute("aria-selected", t.dataset.stage === stage);
    });

    chatEl.textContent = chatLines[stage === "blue" ? "idleBlue" : "idleGreen"];
    await loadAnim("idle", true);
  });
});

document
  .getElementById("feed-button")
  .addEventListener("click", () => doAction("feed"));
document
  .getElementById("dance-button")
  .addEventListener("click", () => doAction("dance"));
document
  .getElementById("sleep-button")
  .addEventListener("click", () => doAction("sleep"));
document
  .getElementById("power-button")
  .addEventListener("click", () => doAction("train"));

init();

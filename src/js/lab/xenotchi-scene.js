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
    dance2: {
      file: "cat_FREEZE.fbx",
      scale: [0.0027, 0.0027, 0.0027],
      position: [-1.5, -3, -6.7],
      rotationY: Math.PI / 7,
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
    train2: {
      file: "cat_knee-upper.fbx",
      scale: [0.0019, 0.0019, 0.0019],
      position: [0, -2, -5],
      rotationY: Math.PI / -9,
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
    dance2: {
      file: "Salsa.fbx",
      scale: [0.00392, 0.00392, 0.00392],
      position: [0, -5, -9.7],
      rotationY: Math.PI / 16,
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
    train2: {
      file: "green_back_k.fbx",
      scale: [0.0112, 0.0112, 0.0112],
      position: [10, -16, -43],
      rotationY: Math.PI / -7,
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
let themeStarted = false;
const danceIndices = { blue: 0, green: 0 };
const trainIndices = { blue: 0, green: 0 };

function playSound(id, src, delayMs, { volume = 1, playbackRate = 1 } = {}) {
  setTimeout(() => {
    let audio = document.getElementById(id);
    if (!audio) {
      audio = document.createElement("audio");
      audio.id = id;
      audio.src = src;
      audio.preload = "auto";
      document.body.appendChild(audio);
    }
    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audio.play().catch(() => {});
  }, delayMs);
}

function startTheme() {
  if (themeStarted) return;
  themeStarted = true;
  const bgMusic = document.getElementById("bg-music");
  if (bgMusic) {
    bgMusic.volume = 0.35;
    bgMusic.play().catch(() => {});
  }
}

const trainSoundCues = {
  "blue:train": [
    {
      id: "fighting-voice",
      src: "/music/fighting_voice.wav",
      delay: 2700,
      volume: 1.0,
      playbackRate: 3.7,
    },
  ],
  "blue:train2": [
    {
      id: "fighting-voice",
      src: "/music/fighting_voice.wav",
      delay: 3200,
      volume: 1.0,
      playbackRate: 1.5,
    },
  ],
  "green:train": [
    {
      id: "green-grunt",
      src: "/music/green_grunt2.wav",
      delay: 700,
      volume: 0.8,
    },
  ],
  "green:train2": [
    {
      id: "green-grunt",
      src: "/music/green_grunt.wav",
      delay: 990,
      volume: 1.0,
    },
  ],
};

const container = document.getElementById("pet-container");
const loadingEl = document.getElementById("scene-loading");
const chatEl = document.getElementById("petChat");

function getCatMaskData() {
  if (!activeModel) return null;
  const box = new THREE.Box3().setFromObject(activeModel);
  const center = box.getCenter(new THREE.Vector3());
  const layoutW = container.offsetWidth || 600;
  const layoutH = container.offsetHeight || 400;
  const project = (vec) => {
    const v = vec.clone().project(camera);
    return { x: (v.x * 0.5 + 0.5) * layoutW, y: (-v.y * 0.5 + 0.5) * layoutH };
  };
  const screenCenter = project(center);
  const screenTop = project(new THREE.Vector3(center.x, box.max.y, center.z));
  const screenBottom = project(
    new THREE.Vector3(center.x, box.min.y, center.z),
  );
  const screenLeft = project(new THREE.Vector3(box.min.x, center.y, center.z));
  const screenRight = project(new THREE.Vector3(box.max.x, center.y, center.z));
  return {
    xPct: (screenCenter.x / layoutW) * 100,
    yPct: (screenCenter.y / layoutH) * 100,
    width: Math.max(80, Math.abs(screenRight.x - screenLeft.x)),
    height: Math.max(100, Math.abs(screenBottom.y - screenTop.y)),
  };
}

function triggerGlitchStutter(duration = 120) {
  const overlay = document.getElementById("glitchOverlay");
  const overlay2 = document.getElementById("glitchOverlay2");
  if (!overlay) return;

  const catData = getCatMaskData();
  const layoutW = container.offsetWidth || 600;
  const layoutH = container.offsetHeight || 400;

  if (catData) {
    const w = Math.max(catData.width * 2.5, layoutW * 0.38);
    const h = Math.max(catData.height * 2.5, layoutH * 0.55);
    [overlay, overlay2].forEach((el) => {
      if (!el) return;
      el.style.left = `${catData.xPct}%`;
      el.style.top = `${catData.yPct}%`;
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      el.style.transform = "translate(-50%, -50%)";
    });
  }

  [overlay, overlay2].forEach((el) => {
    if (!el) return;
    const scanlines = el.querySelector(".stutter-scanlines");
    const staticEl = el.querySelector(".stutter-static");
    const flash = el.querySelector(".stutter-flash");
    if (scanlines) {
      scanlines.style.display = "block";
      scanlines.style.animation =
        "xeno-stutterScan 0.08s linear infinite, xeno-scanlinesWarp 1.2s linear infinite";
      scanlines.style.opacity = "1";
    }
    if (staticEl) {
      staticEl.style.display = "block";
      staticEl.style.animation =
        "xeno-stutterStatic 0.07s linear infinite, xeno-staticWarp 2.2s linear infinite";
      staticEl.style.opacity = "0.9";
    }
    if (flash) {
      flash.style.display = "block";
      flash.style.animation =
        "xeno-stutterFlash 0.1s ease-out, xeno-flashWarp 1.7s linear infinite";
      flash.style.opacity = "1";
    }
    el.classList.add("active");
    el.style.opacity = "1";
    el.style.filter = "saturate(400%) brightness(250%) contrast(150%)";
  });

  setTimeout(() => {
    [overlay, overlay2].forEach((el) => {
      if (!el) return;
      el.style.opacity = "0";
      el.querySelector(".stutter-scanlines").style.opacity = "0";
      el.querySelector(".stutter-static").style.opacity = "0";
      el.querySelector(".stutter-flash").style.opacity = "0";
      setTimeout(() => {
        el.classList.remove("active");
        el.style.filter = "";
        ["stutter-scanlines", "stutter-static", "stutter-flash"].forEach(
          (cls) => {
            const child = el.querySelector(`.${cls}`);
            if (child) {
              child.style.display = "none";
              child.style.animation = "";
              child.style.opacity = "";
            }
          },
        );
      }, 600);
    });
  }, duration);
}

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
  startTheme();
  busy = true;
  setButtonsDisabled(true);
  chatEl.textContent = chatLines[action] ?? "…";

  // Resolve dance/train variants (cycle between base and variant 2)
  let animKey = action;
  if (action === "dance") {
    const idx = danceIndices[currentStage];
    animKey = idx % 2 === 0 ? "dance" : "dance2";
    danceIndices[currentStage] = idx + 1;
  } else if (action === "train") {
    const idx = trainIndices[currentStage];
    animKey = idx % 2 === 0 ? "train" : "train2";
    trainIndices[currentStage] = idx + 1;
  }

  triggerGlitchStutter(90);

  if (action === "dance") {
    const bgMusic = document.getElementById("bg-music");
    if (bgMusic) bgMusic.pause();

    const stutterMaskAudio = document.getElementById("stutterMask");
    if (stutterMaskAudio) {
      stutterMaskAudio.currentTime = 0;
      stutterMaskAudio.volume = 1.0;
      stutterMaskAudio.play().catch(() => {});
    }

    let radianceAudio = document.getElementById("radiance-music");
    if (!radianceAudio) {
      radianceAudio = document.createElement("audio");
      radianceAudio.id = "radiance-music";
      radianceAudio.src = "/music/radiance.mp3";
      radianceAudio.preload = "auto";
      document.body.appendChild(radianceAudio);
    }
    radianceAudio.pause();
    radianceAudio.currentTime = 18;
    radianceAudio.volume = 0.5;
    radianceAudio.play().catch(() => {});
  } else {
    const stutterMaskAudio = document.getElementById("stutterMask");
    if (stutterMaskAudio) {
      stutterMaskAudio.currentTime = 0;
      stutterMaskAudio.volume = 1.0;
      stutterMaskAudio.play().catch(() => {});
    }
    if (action === "train") {
      for (const c of trainSoundCues[`${currentStage}:${animKey}`] ?? []) {
        playSound(c.id, c.src, c.delay, {
          volume: c.volume,
          playbackRate: c.playbackRate,
        });
      }
    }
  }

  const duration = await loadAnim(animKey, false);
  const cap = action === "dance" ? 15000 : 7000;
  if (duration > 0) await delay(Math.min(duration, cap));

  triggerGlitchStutter(150);

  if (action === "dance") {
    const radianceAudio = document.getElementById("radiance-music");
    if (radianceAudio) {
      radianceAudio.pause();
      radianceAudio.currentTime = 0;
    }
    const bgMusic = document.getElementById("bg-music");
    if (bgMusic) bgMusic.play().catch(() => {});
  }

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

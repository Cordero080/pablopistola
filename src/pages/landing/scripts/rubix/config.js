// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  🎨  COLOR PALETTE                                                       ║
// ║  The base color of each flat panel and sphere orb.                       ║
// ║  These are very dark on purpose — the glow colors below do the work.     ║
// ║                                                                          ║
// ║  PANEL_COLOR    → the fill color of each tile (hex)                      ║
// ║  PANEL_EMISSIVE → how much the panel "glows" on its own before glow math ║
// ╚══════════════════════════════════════════════════════════════════════════╝

export const PANEL_COLOR = "#050508"; // near-black with a subtle blue cast
export const PANEL_EMISSIVE = "#050508"; // keep this the same as PANEL_COLOR

// 🌈  LIVE GLOW — applied per-panel each frame based on wave + position
//
//  Each channel is a 0–1 multiplier. Higher = more of that color in the glow.
//  R < G < B by default → blue-dominant. Want purple? raise R. Want teal? lower R.
//  These only affect the dynamic glow, not the base color above.

export const GLOW_COLOR_R = 0.6; // red  contribution to panel color glow
export const GLOW_COLOR_G = 0.7; // green contribution
export const GLOW_COLOR_B = 1.0; // blue  contribution  ← dominant, keep this highest

export const GLOW_EMIT_R = 0.4; // red  contribution to self-emissive glow
export const GLOW_EMIT_G = 0.5; // green contribution
export const GLOW_EMIT_B = 1.0; // blue  contribution  ← dominant

// 🖊️  EDGE LINE COLORS — one hex per face of the cube
//
//  Order is: front · back · right · left · top · bottom
//  These are the thin outlines around each flat tile.

export const FACE_EDGE_COLORS = [
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

export const PANEL_OPACITY_BASE = 0.12;
export const PANEL_OPACITY_CENTER = 0.15;
export const PANEL_OPACITY_WAVE = 0.03;

// Edge line opacity — same three knobs, for the outline lines

export const EDGE_OPACITY_BASE = 0.13;
export const EDGE_OPACITY_CENTER = 1;
export const EDGE_OPACITY_WAVE = 0.5;

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  🌀  MOTION — rotation, wave, spin, scale                                ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// 🔄  CUBE ROTATION — how fast the whole cube slowly spins (radians/second)
//  Lower = slower. Set to 0 to freeze that axis.

export const ROT_Y = 0.01; // left–right spin (yaw)   ← main visible spin
export const ROT_X = 0.0076; // up–down tilt   (pitch)
export const ROT_Z = 0.01; // clockwise roll (roll)

// 🌊  WAVE — panels ripple in and out from the face surface
//  WAVE_AMPLITUDE: how far panels travel. 0 = flat/no ripple, 1.5 = very dramatic

export const WAVE_AMPLITUDE = 0.4;

// 🌀  PANEL SELF-SPIN — each flat tile slowly rotates on its own axis
//  Higher = faster spinning tiles. 0 = no spin. Panels alternate direction.

export const PANEL_SPIN_SPEED = 0.2375; // slightly slower than before

// 💓  SCALE BREATHE — tiles gently pulse in size with the wave
//  0 = no size pulse, 0.3 = very noticeable pulse

export const SCALE_BREATHE = 0.3;

// 🌈  HUE SHIFT — each face starts at a different color angle, creating variety

export const FACE_HUE_OFFSETS = [0, 3.5, 1.0, 1.5, 2.2, 2.8];

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  🔮  MORPH — flat panel tiles ↔ sphere orbs                              ║
// ║                                                                          ║
// ║  CUBE_HOLD   → how many seconds to stay as flat panels before morphing   ║
// ║  MORPH_DUR   → how many seconds the morph transition takes               ║
// ║  SPHERE_HOLD → how many seconds to stay as spheres before morphing back  ║
// ║                                                                          ║
// ║  MORPH_CYCLE is calculated automatically — don't edit it directly.       ║
// ╚══════════════════════════════════════════════════════════════════════════╝

export const CUBE_HOLD = 8; // seconds showing flat panels
export const MORPH_DUR = 4; // seconds for the morph transition
export const SPHERE_HOLD = 3; // seconds showing sphere orbs

export const MORPH_CYCLE = CUBE_HOLD + MORPH_DUR + SPHERE_HOLD + MORPH_DUR; // auto

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  🌐  SPHERE ORB OPTIONS                                                  ║
// ║                                                                          ║
// ║  ORB_HUE_SPEED → how fast the orbs slowly shift color while in sphere   ║
// ║                  form. In radians/second. 0.12 = very subtle.            ║
// ║                  0 = no shift, 0.5 = noticeable cycling.                 ║
// ╚══════════════════════════════════════════════════════════════════════════╝

export const ORB_HUE_SPEED = 0.5; // radians/second — only active during sphere phase

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  💥  ORB SEPARATION                                                      ║
// ║                                                                          ║
// ║  During the sphere hold, each face's orbs push outward along their face  ║
// ║  normal, then smoothly reunite. Value is in world units.                 ║
// ╚══════════════════════════════════════════════════════════════════════════╝

export const ORB_SEPARATION = 0.52; // world units of outward push per face

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

export const CONN_DELAY = 2; // seconds into sphere phase before lines appear
export const CONN_DUR = 2; // total seconds lines are visible
export const CONN_COLOR = "#6633cc"; // cyan — matches the site accent color
export const CONN_MAX_OPACITY = 0.3; // subtle; raise for more visible lines

/**
 * mcpBridge.js
 * ============
 * Vanilla JS MCP ↔ Frontend Bridge
 *
 * Data flow:
 *
 *   User types message
 *       │
 *       ▼
 *   POST /chat  ──→  FastAPI  ──→  Claude (with resume context + tools)
 *                                       │
 *                          if Claude calls toggle_portfolio_theme:
 *                                       │
 *                                       ▼
 *   GET /stream  ←── SSE broadcast ←── broadcaster.broadcast()
 *       │  (EventSource — persistent open connection)
 *       │
 *       ▼  event: toggle_theme
 *   window.toggleComplementaryColors()   ← your existing global function
 *   (triggers wave color swap, feather particles, holographic gradients)
 */

// ─────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────

const MCP_BASE_URL = "__VITE_MCP_URL__";

// ── Session ID — persisted in localStorage so conversation history survives page reloads ──
let sessionId = localStorage.getItem("mcp_session_id") || null;

// ─────────────────────────────────────────────────────────
//  SSE BRIDGE  — listens to /stream for MCP tool events
//
//  The FastAPI server calls broadcaster.broadcast() when
//  the AI calls toggle_portfolio_theme. That pushes an
//  SSE event here, which routes to the correct UI handler.
// ─────────────────────────────────────────────────────────

function initMCPStream() {
  const source = new EventSource(`${MCP_BASE_URL}/stream`);

  // Confirm the connection is live
  source.addEventListener("connected", (e) => {
    const data = JSON.parse(e.data);
    console.log("[MCP Bridge] SSE connected:", data.status);
  });

  // ── THE KEY EVENT ──────────────────────────────────────
  // When the AI calls toggle_portfolio_theme on the server,
  // FastAPI pushes this event down the SSE stream.
  // We catch it here and fire your existing global function.
  source.addEventListener("toggle_theme", () => {
    console.log(
      "[MCP Bridge] toggle_theme received — firing window.toggleComplementaryColors()",
    );

    if (typeof window.toggleComplementaryColors === "function") {
      window.toggleComplementaryColors();
    } else {
      // Fallback: bare classList toggle if the function hasn't loaded yet
      console.warn(
        "[MCP Bridge] toggleComplementaryColors not found — falling back to classList",
      );
      document.body.classList.toggle("complementary-colors");
    }
  });

  source.addEventListener("error", (e) => {
    if (source.readyState === EventSource.CLOSED) {
      console.warn("[MCP Bridge] SSE connection closed. Reconnecting in 5s...");
      setTimeout(initMCPStream, 5000);
    }
  });

  return source;
}

// ─────────────────────────────────────────────────────────
//  CHAT API  — sends a message to Claude via /chat
//
//  Returns: { response: string, tool_called: boolean }
// ─────────────────────────────────────────────────────────

async function sendChatMessage(message) {
  try {
    const res = await fetch(`${MCP_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sessionId }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json(); // { response, tool_called, session_id }

    // Persist session ID so follow-up messages continue the same conversation
    if (data.session_id) {
      sessionId = data.session_id;
      localStorage.setItem("mcp_session_id", sessionId);
    }

    return data;
  } catch (err) {
    console.error("[MCP Bridge] /chat error:", err);
    return {
      response: "Connection error. Is the MCP server running?",
      tool_called: false,
    };
  }
}

// ─────────────────────────────────────────────────────────
//  CHAT UI
//  Injects a minimal chat widget into the page.
//  Each page that loads this script gets the assistant.
// ─────────────────────────────────────────────────────────

function buildChatUI() {
  // Don't double-inject
  if (document.getElementById("mcp-chat-widget")) return;

  // ── Styles ──────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    #mcp-chat-widget {
      position: fixed;
      /* Sits directly above the audio-toggle button (bottom:24px + 44px + 12px gap) */
      bottom: 80px;
      right: 24px;
      z-index: 9998;
      font-family: var(--font-body, 'aktiv-grotesk', sans-serif);
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    /* Match the existing audio-toggle holographic button style exactly */
    #mcp-chat-toggle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      overflow: visible;
      background:
        linear-gradient(145deg, #221d27, #000000),
        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(0,0,0,0.5), transparent 50%),
        linear-gradient(45deg, rgba(138,43,226,0.05), rgba(0,212,255,0.05), rgba(138,43,226,0.05));
      background-size: 100% 100%, 150% 150%, 150% 150%, 200% 200%;
      background-blend-mode: overlay, multiply, overlay;
      box-shadow:
        0 2px 8px rgba(0,0,0,0.6),
        inset 0 1px 2px rgba(255,255,255,0.1),
        0 0 12px rgba(131,56,236,0.2);
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    /*
     * Ripple rings — 3 rings cascade outward from the chat button.
     * Tune these two values to control feel:
     *   duration  — how long each ring takes to expand and fade (longer = slower/calmer)
     *   delay gap — time between each ring firing (larger = more breathing room)
     * Current: 5s duration, 1.8s stagger → one ring every 1.8s, never overlapping aggressively.
     */
    #mcp-chat-toggle .ring {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1.5px solid rgba(0, 255, 247, 0.45);
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
      pointer-events: none;
      animation: none;
    }

    /*
     * Sequential rings — each ring expands and fully fades (0-25% of cycle),
     * then holds invisible for the rest (25-100%). Stagger = 1/3 of duration
     * so rings fire one after the other with no overlap.
     * Tune: increase duration to slow the whole sequence down.
     */
    #mcp-chat-toggle.pulse-active .ring:nth-child(1) {
      animation: chat-ripple 12s ease-out infinite;
      animation-delay: 0s;
    }
    #mcp-chat-toggle.pulse-active .ring:nth-child(2) {
      animation: chat-ripple 12s ease-out infinite;
      animation-delay: 4s;
    }
    #mcp-chat-toggle.pulse-active .ring:nth-child(3) {
      animation: chat-ripple 12s ease-out infinite;
      animation-delay: 8s;
    }

    @keyframes chat-ripple {
      0%   {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.4;
        border-radius: 50%;
        border-color: rgba(0, 255, 247, 0.4);
      }
      /* organic wobble as ring expands — no opacity jumps, just shape and color shift */
      8%   { border-radius: 48% 52% 50% 50% / 50% 50% 52% 48%; }
      15%  {
        border-radius: 52% 48% 49% 51% / 48% 52% 50% 50%;
        border-color: rgba(180, 0, 255, 0.35);
      }
      22%  {
        border-radius: 50%;
        border-color: rgba(0, 255, 247, 0.15);
      }
      25%  {
        transform: translate(-50%, -50%) scale(2.2);
        opacity: 0;
        border-radius: 50%;
      }
      100% {
        transform: translate(-50%, -50%) scale(2.2);
        opacity: 0;
      }
    }

    #mcp-chat-toggle:hover {
      transform: scale(1.1);
      box-shadow:
        0 4px 16px rgba(0,0,0,0.7),
        inset 0 1px 2px rgba(255,255,255,0.15),
        0 0 20px rgba(131,56,236,0.4);
    }

    #mcp-chat-toggle svg {
      width: 20px;
      height: 20px;
      color: rgba(255,255,255,0.6);
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: all 0.3s ease;
    }

    #mcp-chat-toggle:hover svg {
      color: #8338ec;
      filter: drop-shadow(0 0 6px rgba(131,56,236,0.6));
    }

    #mcp-chat-panel {
      display: none;
      flex-direction: column;
      width: 320px;
      height: 460px;
      /* More transparent — holographic glass */
      background:
        linear-gradient(145deg, rgba(20,15,30,0.55), rgba(0,0,0,0.45)),
        radial-gradient(circle at 30% 0%, rgba(131,56,236,0.08), transparent 60%);
      border: 1px solid rgba(131, 56, 236, 0.25);
      border-radius: 16px;
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      box-shadow:
        0 20px 60px rgba(0,0,0,0.55),
        0 0 0 0.5px rgba(255,255,255,0.04) inset,
        0 0 24px rgba(131,56,236,0.12);
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    #mcp-chat-panel.open { display: flex; }

    #mcp-chat-header {
      padding: 0.7rem 1rem;
      background: linear-gradient(90deg, rgba(131,56,236,0.1), rgba(0,0,0,0.1));
      border-bottom: 1px solid rgba(131,56,236,0.15);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    #mcp-chat-header .mcp-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #333;
      flex-shrink: 0;
      transition: background 0.3s;
    }

    #mcp-chat-header .mcp-status-dot.live { background: #00ff88; box-shadow: 0 0 6px #00ff88; }

    #mcp-chat-header span {
      flex: 1;
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(0,255,136,0.6);
    }

    /* Close button */
    #mcp-chat-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.35);
      transition: color 0.2s;
    }
    #mcp-chat-close:hover { color: rgba(255,255,255,0.8); }
    #mcp-chat-close svg {
      width: 14px;
      height: 14px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
    }

    #mcp-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    #mcp-chat-messages::-webkit-scrollbar { width: 3px; }
    #mcp-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #mcp-chat-messages::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.2); border-radius: 2px; }

    .mcp-msg {
      max-width: 86%;
      padding: 0.55rem 0.8rem;
      border-radius: 10px;
      font-size: 0.82rem;
      line-height: 1.55;
    }

    /* User bubble — holographic dark, green text */
    .mcp-msg.user {
      align-self: flex-end;
      background:
        linear-gradient(145deg, rgba(20,15,30,0.7), rgba(0,0,0,0.6)),
        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06), transparent 60%);
      border: 1px solid rgba(0,255,136,0.2);
      box-shadow: inset 0 1px 1px rgba(255,255,255,0.05), 0 0 8px rgba(0,255,136,0.08);
      color: #00ff88;
    }

    /* Assistant bubble — same holographic dark, green text */
    .mcp-msg.assistant {
      align-self: flex-start;
      background:
        linear-gradient(145deg, rgba(15,10,25,0.65), rgba(0,0,0,0.55)),
        radial-gradient(circle at 70% 70%, rgba(131,56,236,0.06), transparent 60%);
      border: 1px solid rgba(131,56,236,0.15);
      box-shadow: inset 0 1px 1px rgba(255,255,255,0.04);
      color: #00ff88;
    }

    .mcp-msg.thinking {
      align-self: flex-start;
      color: rgba(0,255,136,0.3);
      font-style: italic;
      font-size: 0.75rem;
      background: none;
      border: none;
      padding-left: 0;
    }

    #mcp-chat-input-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 0.75rem;
      border-top: 1px solid rgba(131,56,236,0.12);
    }

    /* Holographic input — matches the audio button dark base */
    #mcp-chat-input {
      flex: 1;
      background:
        linear-gradient(145deg, #181320, #0a0a0f),
        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.04), transparent 50%);
      background-blend-mode: overlay;
      border: 1px solid rgba(0,255,136,0.15);
      border-radius: 8px;
      padding: 0.5rem 0.7rem;
      color: #00ff88;
      font-family: inherit;
      font-size: 0.82rem;
      outline: none;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.03) inset;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    #mcp-chat-input::placeholder { color: rgba(0,255,136,0.25); }
    #mcp-chat-input:focus {
      border-color: rgba(0,255,136,0.35);
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.5), 0 0 8px rgba(0,255,136,0.1);
    }

    /* Send button — transparent, green arrow only */
    #mcp-chat-send {
      background: none;
      border: 1px solid rgba(0,255,136,0.2);
      border-radius: 8px;
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
      padding: 0;
    }

    #mcp-chat-send svg {
      width: 16px;
      height: 16px;
      stroke: rgba(0,255,136,0.6);
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: stroke 0.2s;
    }

    #mcp-chat-send:hover { border-color: rgba(0,255,136,0.5); box-shadow: 0 0 8px rgba(0,255,136,0.15); }
    #mcp-chat-send:hover svg { stroke: #00ff88; }
    #mcp-chat-send:disabled { opacity: 0.3; cursor: not-allowed; }

    @media (max-width: 768px) {
      #mcp-chat-widget { bottom: 72px; right: 16px; }
      #mcp-chat-panel { width: 290px; height: 400px; }
      #mcp-chat-toggle { width: 40px; height: 40px; }
      #mcp-chat-toggle svg { width: 18px; height: 18px; }
      #mcp-chat-toggle::after { width: 40px; height: 40px; }
    }
  `;
  document.head.appendChild(style);

  // ── HTML ────────────────────────────────────────────────
  const widget = document.createElement("div");
  widget.id = "mcp-chat-widget";
  widget.innerHTML = `
    <div id="mcp-chat-panel">
      <div id="mcp-chat-header">
        <div class="mcp-status-dot" id="mcp-status-dot"></div>
        <span>Portfolio AI</span>
        <button id="mcp-chat-close" aria-label="Close">
          <svg viewBox="0 0 14 14"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
        </button>
      </div>
      <div id="mcp-chat-messages">
      </div>
      <div id="mcp-chat-input-row">
        <input id="mcp-chat-input" type="text" placeholder="Ask anything..." autocomplete="off" />
        <button id="mcp-chat-send" aria-label="Send">
          <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>

    <button id="mcp-chat-toggle" aria-label="Open AI Assistant" title="Portfolio AI">
      <span class="ring"></span>
      <span class="ring"></span>
      <span class="ring"></span>
      <svg viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  `;
  document.body.appendChild(widget);

  // ── Logic ───────────────────────────────────────────────
  const panel = widget.querySelector("#mcp-chat-panel");
  const toggle = widget.querySelector("#mcp-chat-toggle");
  const closeBtn = widget.querySelector("#mcp-chat-close");
  const messages = widget.querySelector("#mcp-chat-messages");
  const input = widget.querySelector("#mcp-chat-input");
  const sendBtn = widget.querySelector("#mcp-chat-send");
  const statusDot = widget.querySelector("#mcp-status-dot");

  // Start pulsing immediately
  toggle.classList.add("pulse-active");

  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      // Panel opened — stop pulse
      toggle.classList.remove("pulse-active");
      input.focus();
    } else {
      // Panel closed — resume pulse after a short pause
      setTimeout(() => toggle.classList.add("pulse-active"), 800);
    }
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
    setTimeout(() => toggle.classList.add("pulse-active"), 800);
  });

  function appendMessage(role, text) {
    const msg = document.createElement("div");
    msg.className = `mcp-msg ${role}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
  }

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    sendBtn.disabled = true;
    appendMessage("user", text);

    const thinking = appendMessage("thinking", "thinking...");

    const { response, tool_called } = await sendChatMessage(text);

    thinking.remove();
    appendMessage("assistant", response);

    // If the theme was toggled, give a small visual cue
    if (tool_called) {
      const cue = appendMessage("thinking", "⚡ theme toggled");
      setTimeout(() => cue.remove(), 2500);
    }

    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener("click", handleSend);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleSend();
  });

  // ── Wire up SSE status dot ───────────────────────────────
  window.__mcpSource = initMCPStream();

  window.__mcpSource.addEventListener("connected", () => {
    statusDot.classList.add("live");
  });

  window.__mcpSource.addEventListener("error", () => {
    statusDot.classList.remove("live");
  });

  // Panel stays closed on load — the sonar pulse on the toggle draws attention naturally.
}

// ─────────────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────────────

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", buildChatUI);
} else {
  buildChatUI();
}

// ─────────────────────────────────────────────────────────
//  PUBLIC API  (for use from browser console or other scripts)
//
//  window.mcpBridge.sendMessage("tell me about Pneuma")
//  window.mcpBridge.toggleTheme()  ← fires locally without AI
// ─────────────────────────────────────────────────────────

window.mcpBridge = {
  sendMessage: sendChatMessage,
  toggleTheme: () => {
    if (typeof window.toggleComplementaryColors === "function") {
      window.toggleComplementaryColors();
    }
  },
};

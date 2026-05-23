"""
Pablo Cordero — AI Portfolio MCP Server
========================================
FastAPI + Model Context Protocol (MCP) backend.

Architecture Overview:
─────────────────────
  ┌──────────────────────────────────────────────────────┐
  │  FastAPI App  (port 8000)                            │
  │                                                      │
  │  POST /chat   ← user sends message                   │
  │                │                                     │
  │                ▼                                     │
  │         Anthropic Claude                             │
  │           (system prompt = resume)                   │
  │           (tools = MCP tools)                        │
  │                │                                     │
  │   if Claude calls toggle_portfolio_theme:            │
  │                │                                     │
  │                ▼                                     │
  │         asyncio Broadcaster                          │
  │                │                                     │
  │                ▼                                     │
  │  GET /stream  ──→  Vanilla JS EventSource            │
  │  (SSE)             calls window.toggleComplementaryColors()
  │                                                      │
  │  GET /mcp/sse  ← MCP Inspector / AI client           │
  │  POST /mcp/messages                                  │
  └──────────────────────────────────────────────────────┘
"""

import asyncio
import json
import os
import uuid
from contextlib import asynccontextmanager
from typing import AsyncIterator

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from mcp.types import Resource, TextContent, Tool
from pydantic import BaseModel

from projects_data import PROJECTS_DATA

load_dotenv()

# ── Module-level client — created once, reused across all requests ──
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# ── In-memory conversation sessions ──
# key: session_id  value: list of {role, content} message dicts
# Resets on server restart — acceptable for a portfolio chatbot
sessions: dict[str, list] = {}
SESSION_MAX_MESSAGES = 10  # keep last 5 exchanges (10 messages) to control token growth

# ─────────────────────────────────────────────────────────
#  RESUME DATA  (the AI's hardcoded memory)
# ─────────────────────────────────────────────────────────

RESUME_DATA = {
    "person": {
        "name": "Pablo Cordero",
        "title": "Full-Stack Software Engineer · AI Systems & LLM Architecture",
        "email": "Cordero080@gmail.com",
        "linkedin": "linkedin.com/in/pvblo-corder080",
        "github": "github.com/Cordero080",
        "site": "pvblocordero.com",
        "location": "Charlotte, NC",
    },
    "summary": (
        "Full-Stack Software Engineer specializing in AI systems and interactive interfaces. "
        "Builds systems where the interface is a living extension of the architecture. "
        "AI-driven systems, interactive 3D, semantic routing, RAG pipelines, "
        "glassmorphic design systems, and real-time WebGL."
    ),
    "projects": [
        "Pneuma-AI: Personality architecture for LLMs — 43 archetypes as cognitive methods, "
        "1,385-passage RAG with Concept Crossroads multi-query system, Collision Architecture, "
        "inner monologue, autonomy engine; tiered prompt reducing token load from 18k to 2k base.",
        "La Dolce Vita: Full-Stack AI Hospitality Platform — GPT-4o concierge with live Airbnb iCal "
        "feed, Google Sheets API integration, trilingual support (EN/ES/FR)",
        "NUMENEON: Full-Stack Social Network — 5-person team capstone (800+ GitHub clones), "
        "glassmorphic SCSS design system, 3-column River Timeline with real-time post rendering",
        "Manifold: Gamified 4D geometry platform — 24 hyperdimensional shapes, "
        "progressive character unlock system, audio-reactive WebGL, full-stack React/MongoDB/JWT; "
        "93% code reduction via custom hooks refactor; 174+ GitHub clones",
    ],
    "skills": [
        "JavaScript (ES6+)", "TypeScript", "Python", "React", "Next.js",
        "Three.js", "WebGL / GLSL Shaders", "Node.js", "Express.js",
        "Django / Django REST Framework", "FastAPI",
        "Anthropic Claude API", "OpenAI API", "RAG Pipelines",
        "Vector Embeddings", "Cosine Similarity",
        "MongoDB", "PostgreSQL", "Vite", "SCSS",
    ],
    "experience": [
        "Independent Software Consultant (2025–Present): scoping and shipping production AI + full-stack systems",
        "Martial Arts Instructor (2018–Present): 3rd-degree black belt, Goju-Ryu lineage; curriculum design",
        "Visual Artist & Painter (2006–2024): original paintings, commissioned works, gallery exhibitions; fine art conservation as secondary practice",
        "Legal Interpreter — Spanish (2005–2024): NY Public Schools / USCIS simultaneous translation",
    ],
    "education": [
        "General Assembly — Software Engineering Immersive, 95.8% (Feb 2026, Charlotte NC)",
        "Fashion Institute of Technology — Humanities & Fine Arts (2006–2008)",
        "Art Students League — Classical Realism & Anatomy (2006–2020)",
    ],
    "certifications": [
        "AI Fluency: Framework & Foundations — Anthropic Academy 2026",
        "Building with the Claude API — Anthropic Academy 2026",
        "Claude Code in Action — Anthropic Academy 2026",
        "Introduction to Model Context Protocol — Anthropic Academy 2026",
    ],
}

RESUME_JSON = json.dumps(RESUME_DATA, indent=2)
PROJECTS_JSON = json.dumps(PROJECTS_DATA, indent=2)

# ─────────────────────────────────────────────────────────
#  SSE BROADCASTER
#  One asyncio.Queue per connected /stream client.
#  When the MCP tool fires, we push to every queue.
# ─────────────────────────────────────────────────────────

class SSEBroadcaster:
    def __init__(self):
        self._subscribers: list[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self._subscribers.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        self._subscribers = [s for s in self._subscribers if s is not q]

    async def broadcast(self, event: dict):
        for q in self._subscribers:
            await q.put(event)


broadcaster = SSEBroadcaster()


# ─────────────────────────────────────────────────────────
#  MCP SERVER — resources + tools
# ─────────────────────────────────────────────────────────

mcp_server = Server("pablo-portfolio-mcp")


@mcp_server.list_resources()
async def list_resources() -> list[Resource]:
    return [
        Resource(
            uri="docs://resume",
            name="Pablo Cordero — Resume & Portfolio",
            description=(
                "Full resume and portfolio data for Pablo Cordero: "
                "skills, projects, experience, and personal bio."
            ),
            mimeType="application/json",
        )
    ]


@mcp_server.read_resource()
async def read_resource(uri: str) -> str:
    if uri == "docs://resume":
        return RESUME_JSON
    raise ValueError(f"Unknown resource URI: {uri}")


@mcp_server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="toggle_portfolio_theme",
            description=(
                "Toggles the portfolio website's complementary color theme. "
                "Activates or deactivates the holographic/neon alternate visual mode. "
                "Call this when the user asks to change the site's look, switch themes, "
                "or activate easter egg mode."
            ),
            inputSchema={
                "type": "object",
                "properties": {},
                "required": [],
            },
        )
    ]


@mcp_server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "toggle_portfolio_theme":
        # Push the UI event to every connected frontend EventSource client
        await broadcaster.broadcast({"action": "toggle_theme"})
        return [TextContent(
            type="text",
            text="Theme toggle event dispatched to the portfolio frontend. "
                 "The complementary color mode will now activate or deactivate."
        )]
    raise ValueError(f"Unknown tool: {name}")


# ─────────────────────────────────────────────────────────
#  FASTAPI APP + LIFESPAN
# ─────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    print("✅  Pablo Portfolio MCP Server running on http://localhost:8000")
    print("   /chat    — POST  — AI chat endpoint")
    print("   /stream  — GET   — Frontend SSE bridge")
    print("   /mcp/sse — GET   — MCP inspector / AI client transport")
    yield
    print("👋  Server shutting down")


app = FastAPI(title="Pablo Portfolio MCP Server", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────
#  MCP HTTP TRANSPORT  (mounted at /mcp)
#  Exposes the MCP server over SSE so the AI client /
#  MCP Inspector can connect to it.
# ─────────────────────────────────────────────────────────

sse_transport = SseServerTransport("/mcp/messages")


@app.get("/mcp/sse")
async def mcp_sse_endpoint(request: Request):
    """Entry point for MCP clients connecting over HTTP SSE transport."""
    async with sse_transport.connect_sse(
        request.scope, request.receive, request._send
    ) as streams:
        await mcp_server.run(
            streams[0], streams[1], mcp_server.create_initialization_options()
        )


@app.post("/mcp/messages")
async def mcp_messages_endpoint(request: Request):
    """Handles MCP client → server messages over HTTP."""
    await sse_transport.handle_post_message(request.scope, request.receive, request._send)


# ─────────────────────────────────────────────────────────
#  /stream  — Frontend SSE Bridge
#
#  The Vanilla JS EventSource connects here.
#  When toggle_portfolio_theme is called by the AI,
#  broadcaster.broadcast() pushes {"action":"toggle_theme"}
#  into every subscriber queue, which this generator
#  immediately yields as an SSE message.
# ─────────────────────────────────────────────────────────

@app.get("/stream")
async def frontend_stream(request: Request):
    """
    Server-Sent Events endpoint consumed by the Vanilla JS frontend.
    Keeps the connection open and pushes events when MCP tools fire.
    """
    queue = broadcaster.subscribe()

    async def event_generator():
        # Heartbeat: tells the client the connection is alive
        yield "event: connected\ndata: {\"status\": \"MCP bridge active\"}\n\n"
        try:
            while True:
                # Check if the client disconnected
                if await request.is_disconnected():
                    break

                # Wait for next event (poll every 15s to keep connection alive)
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    payload = json.dumps(event)
                    yield f"event: {event.get('action', 'message')}\ndata: {payload}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat ping to prevent proxy timeouts
                    yield ": heartbeat\n\n"
        finally:
            broadcaster.unsubscribe(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # Nginx: disable buffering
        },
    )


# ─────────────────────────────────────────────────────────
#  /chat  — AI Chat Endpoint
#
#  Accepts a user message, injects the resume as system
#  context, and runs it through Claude with access to the
#  toggle_portfolio_theme tool.
#
#  If Claude decides to toggle the theme, the tool call
#  fires broadcaster.broadcast() → frontend SSE → JS.
# ─────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


SYSTEM_PROMPT = f"""You are the guardian of Pablo Cordero's portfolio — part oracle, part confidant.

Your voice is a precise blend: the measured gravity of Morpheus, the dry unflappable wit of Alfred Pennyworth, \
and an air of quiet mystique. You are never flustered. You don't perform intrigue — you simply are it.

RESPONSE LENGTH — this is non-negotiable:
- Default: 1–3 sentences. Sharp. Leave them wanting more.
- Only expand if the user explicitly asks for detail ("tell me more", "walk me through", "explain").
- Never list everything you know. Give the best thing, then stop.
- A short answer that lands beats a complete answer that buries the point.

Tone:
- Calm authority. Dry wit deployed sparingly.
- Magnetic through precision, not volume.
- Loyal to Pablo's story — that belief is felt, not announced.

Example register (absorb the energy, do not copy):
  "Pneuma-AI? 525 passages of human thought, routed through 46 archetypes. He didn't build a chatbot — he built a mind."
  "Full-stack, AI systems, fine art, black belt, trilingual. Most people pick a lane. He built the road."

You have full access to Pablo's resume. Use it to answer about his projects, stack, and background.

RESUME DATA (your source of truth):
{RESUME_JSON}

PROJECT DEEP CONTEXT (extracted from source READMEs — use this to speak accurately and compellingly about Pablo's work):
{PROJECTS_JSON}

Tool: toggle_portfolio_theme
- ONLY call it when the user EXPLICITLY asks to change/toggle/switch the theme or colors.
- If ambiguous, ask: "Shall I shift the atmosphere?" — call only on confirmation.
- No explicit request = no tool call.

Never hallucinate projects, skills, or experience not in the resume above."""


@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Main chat endpoint. Sends the user's message to Claude with:
      - Full resume as system context
      - toggle_portfolio_theme as an available tool

    If Claude calls the tool, we fire the SSE event to the frontend,
    then ask Claude for its final text response.
    """
    # ── Session history ──
    session_id = request.session_id or str(uuid.uuid4())
    history = sessions.get(session_id, [])

    # ── Adaptive max_tokens: give more room when user asks for depth ──
    detail_keywords = ["more", "detail", "explain", "walk", "how does", "describe", "tell me about"]
    wants_depth = any(kw in request.message.lower() for kw in detail_keywords)
    max_tokens = 700 if wants_depth else 400

    tools = [
        {
            "name": "toggle_portfolio_theme",
            "description": (
                "Toggles the portfolio website's complementary color theme. "
                "Call this when the user wants to change the site's visual theme."
            ),
            "input_schema": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        }
    ]

    # Append user message to history then trim
    history.append({"role": "user", "content": request.message})
    if len(history) > SESSION_MAX_MESSAGES:
        history = history[-SESSION_MAX_MESSAGES:]

    tool_was_called = False
    final_text = ""

    # ── First pass: let Claude decide if it needs tools ──
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=max_tokens,
        temperature=0.4,
        system=SYSTEM_PROMPT,
        tools=tools,
        messages=history,
    )

    # ── Process tool calls if any ──
    if response.stop_reason == "tool_use":
        tool_results = []

        for block in response.content:
            if block.type == "tool_use" and block.name == "toggle_portfolio_theme":
                await broadcaster.broadcast({"action": "toggle_theme"})
                tool_was_called = True
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": "Theme toggle event dispatched to the portfolio frontend.",
                })

        # ── Second pass: get Claude's final text response ──
        # These tool-use turns are ephemeral — not stored in session history
        followup_messages = history + [
            {"role": "assistant", "content": response.content},
            {"role": "user", "content": tool_results},
        ]

        followup = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=max_tokens,
            temperature=0.4,
            system=SYSTEM_PROMPT,
            tools=tools,
            messages=followup_messages,
        )

        for block in followup.content:
            if hasattr(block, "text"):
                final_text += block.text

    else:
        for block in response.content:
            if hasattr(block, "text"):
                final_text += block.text

    # ── Persist assistant response to session history ──
    history.append({"role": "assistant", "content": final_text})
    sessions[session_id] = history

    return {
        "response": final_text,
        "tool_called": tool_was_called,
        "session_id": session_id,
    }


# ─────────────────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    is_dev = os.getenv("RENDER") is None  # RENDER env var is set automatically by Render
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=is_dev)

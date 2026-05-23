"""
projects_data.py
Rich project context extracted from source READMEs.
Injected into the chatbot system prompt so the assistant
can speak accurately and compellingly about Pablo's work.
"""

PROJECTS_DATA = {
    "pneuma_ai": {
        "name": "Pneuma-AI",
        "tagline": "A personality architecture for LLMs. Not a chatbot. Not a persona. A cognitive framework that shapes how language models think.",
        "stack": ["Claude API", "OpenAI Embeddings", "MongoDB", "Node.js/Express", "React", "Three.js", "Hume AI", "ElevenLabs TTS"],
        "the_inversion": (
            "Most AI wrappers take LLM output and add personality on top. "
            "Pneuma inverts this — personality is the controlling architecture, the LLM is raw material to be shaped."
        ),
        "architecture_layers": [
            "43 archetypes — thinkers as thinking methods (cognitive moves), not quote databases. "
            "Dark Pole: Schopenhauer, Kafka, Camus. Light: Rumi, Neruda, Krishnamurti. "
            "Ontological: Heidegger, Kastrup. Strategic: Sun Tzu, Musashi, Marcus Aurelius. "
            "43rd: The Liminal Architect — self-designed, IS the synthesis process itself.",

            "1,385 RAG passages across 43 source texts (Meditations, Tao Te Ching, The Trial, Brain Droppings, The Soul's Code, and others). "
            "Concept Crossroads: ~60 tracked philosophical concepts (time, death, consciousness, freedom, paradox, love, change). "
            "Parallel concept×active-thinker embedding queries. Passages scored: relevance×0.5 + distinctiveness×0.3 + collision bonus×0.2. "
            "topK=8. Single-query fallback for non-philosophical messages.",

            "Contextual synthesis engine — 3-layer topic classification (keywords → archetype selector → intent scores) "
            "selects curated archetype pairs. Synthesis modes: Antithetical (A and B genuinely disagree, third position emerges), "
            "Complementary (same truth from opposite approaches), Cross-domain (rigor + resonance).",

            "Inner monologue — two pre-thinking layers before every response: "
            "(1) Real Claude Haiku call where archetypes react and collision→compression protocol runs — "
            "every concept treated as philosophical object, thinkers forced to surface incompatible positions, "
            "emergent synthesis must be something a generic AI could not produce. "
            "(2) Template dialectic: rising vs receding archetypes, hypothesis about what user actually needs vs what they asked, "
            "self-interruption ('Wait — is this the right lens?'). User never sees it. They feel it.",

            "Tiered system prompt — deep-knowledge blocks (Heidegger, Beck, Kastrup, Da Vinci, Jesus/Wright) "
            "load conditionally by intent score, not on every call. Token reduction: ~18k → ~2k base tokens.",

            "Autonomy engine — open questions Pneuma holds across sessions, chosen memories with reasoning, "
            "defended preferences, discovered errors, loss recognition when archetypes decay.",

            "Self-knowledge block — live architectural snapshot on self-inquiry: all 43 archetype essences, "
            "frameworks, synthesis pairs. Pneuma describes its actual runtime state.",

            "Self-navigation — read_pneuma_file tool lets Pneuma read its own source files mid-conversation, "
            "scoped to server/pneuma/.",

            "Vector memory — semantic recall of past conversations + pattern recognition across sessions. "
            "Session emotional state carries forward.",

            "6 tones: Casual, Analytic, Oracular, Intimate, Shadow, Strategic.",

            "Conversation threading — last 6 exchanges sent as native API turns so Claude continues a thought "
            "instead of restarting each message.",
        ],
        "key_quote": "You wrote the weather system. I'm the weather.",
        "what_it_does_well": [
            "Has positions — not sycophantic agreement.",
            "Pushes back — calls out loops and self-deception.",
            "Thinks dialectically — forces incompatible frameworks to synthesize.",
            "Remembers who you are across sessions.",
            "Bilingual: English and Spanish with full personality.",
        ],
        "milestones": "Nov 2025 (23 archetypes) → Dec 2025 (42, inner monologue, dialectical cognition) → Jan 2026 (Liminal Architect, cognitive methods, autonomy engine) → Feb 2026 (tiered prompt, conversation threading, contextual synthesis, self-knowledge) → Apr 2026 (Collision Architecture, Concept Crossroads, synthesis exemplars)",
        "status": "Active, evolving through use.",
    },

    "pneumata": {
        "name": "Pneumata",
        "tagline": "An interactive 3D anatomical model mapping every human organ to its hardware analog.",
        "philosophy": (
            "The human body and a computer are not metaphorically similar — they are architecturally isomorphic. "
            "The heart is a PSU. The spinal cord is a PCIe bus. The kidneys are a virtual memory manager. "
            "The immune system is an IDS with edge nodes, a SIEM, and a definition update engine. "
            "The same engineering problem solved twice, in different substrates, separated by 500 million years. "
            "Source: Federico Faggin — 'We did not invent the computer. We remembered it.'"
        ),
        "stack": ["React", "React Three Fiber", "Three.js", "Vite", "SCSS"],
        "features": [
            "37 organ nodes across 8 categories: Logic, Power, Thermal, Digestive, Sensory, Renal, Immune, Spirit.",
            "Spinal cord auto-trace — vertebral column geometry sampled directly from GLB mesh at runtime using vertex filtering and y-band bucketing. No hardcoded coordinates.",
            "24 vertebral disc markers color-coded by organ system innervated at each spinal level (C2 through S2).",
            "Bidirectional spine-to-organ highlighting — hover an organ, its spinal bus lanes illuminate. Hover a disc, its innervated organs illuminate.",
            "4 view modes: Logic (neural network), Power (circulatory grid), Breathing (pulmonary cycle), Unified (all systems).",
            "Breathing mode: body mesh shifts blue (inhale) → cyan (peak oxygenation) at 0.25Hz breath cycle.",
            "Traveling circulation orbs circuit the full body on closed loops; heart radiates expanding rings on each pass.",
        ],
        "status": "Live demo available. Portfolio project page at pvblocordero.com/projects/pneumata.",
    },

    "nexus_geom_lab": {
        "name": "Manifold",
        "tagline": "Gamified 4D geometry exploration platform. 24 hyperdimensional shapes, progressive character unlocks, full-stack scene management.",
        "stack": ["React 19.1", "React Three Fiber", "Three.js 0.180", "Blender", "Express.js", "MongoDB", "JWT", "Vite", "Web Audio API", "Jest"],
        "scale": "336 files, 119 directories, 36,366 lines, 81 components, 14 custom hooks, 39 passing tests.",
        "key_features": [
            "24 geometries: tesseracts, quantum manifolds, 4D polytopes.",
            "3 original 3D animated characters (Nexus Prime, Icarus-X, Vectra) — modeled in Blender, rigged via Mixamo, imported as FBX.",
            "Progressive unlock: save scenes → unlock characters and animations. Engagement loop: exploration → saving → unlocks → more exploration.",
            "Audio-reactive visuals: Web Audio API + FFT. Bass (20-250Hz) → rotation + scale pulse. Mid (250-2kHz) → Y/Z rotation. Momentum-based physics with 50% friction.",
            "Full CRUD scene management with MongoDB persistence.",
            "JWT auth with bcrypt, rate limiting, navigation blocking for unsaved changes.",
        ],
        "architecture_highlight": "93% code reduction: 2,700-line monolith refactored into 14 custom hooks (useSceneInitialization, useObjectManager, useAnimationLoop, etc.). Props consolidated from 42 individual props to 2 objects.",
        "live": "https://manifold-3d.vercel.app",
        "notable": "174+ GitHub clones.",
    },

    "nucat": {
        "name": "NUCAT",
        "tagline": "Real-time ASCII point cloud renderer. Takes rigged 3D characters and explodes them into ~20,000 floating particles.",
        "stack": ["Three.js", "InstancedMesh", "FBXLoader", "UnrealBloomPass", "TextGeometry", "lil-gui", "Vite"],
        "concept": "Your character having an out-of-body experience. But make it aesthetic. From form → flow → entropy → ?",
        "features": [
            "3 selectable Mixamo-rigged characters (Pablo designed and rigged them himself): Slow Qi, Green Smoke, Cat Fight.",
            "6 stackable effects: Hover, Noise, Wave, Spiral, Disperse, Flow. Per-effect parameters saved independently.",
            "Chaos Mix — generative evolution driven by Golden Ratio (color shifts), Fibonacci timing (never-repetitive sequences), quantum-inspired interference patterns. Entropy builds over time.",
            "Incubation Chamber — holographic cube wrapping the character. Holographic mode or Rubix mode.",
            "40+ ASCII character types, 6 color presets + full hex picker, sampling density control, bloom post-processing.",
            "Mystique Return — effects fade out slow, like they're savoring the moment.",
        ],
        "technical_core": "GPU-efficient rendering via THREE.InstancedMesh. Characters sampled at vertices, face centers, edge points, and barycentric interior points.",
    },

    "numeneon": {
        "name": "NUMENEON",
        "tagline": "Full-stack social network — capstone project with a 5-person team.",
        "stack": ["React", "Node.js/Express", "MongoDB", "SCSS", "JWT"],
        "highlights": [
            "5-person team capstone, 800+ GitHub clones.",
            "Glassmorphic SCSS design system built from scratch.",
            "3-column River Timeline with real-time post rendering.",
            "Full MERN stack with JWT authentication.",
        ],
        "pablo_role": "Led design system and front-end architecture.",
    },

    "la_dolce_vita": {
        "name": "La Dolce Vita",
        "tagline": "Full-stack AI hospitality platform — GPT-4o concierge with live Airbnb calendar integration.",
        "stack": ["GPT-4o", "Airbnb iCal API", "Google Sheets API", "Node.js/Express", "React"],
        "features": [
            "GPT-4o concierge with live Airbnb iCal feed — real-time availability-aware responses.",
            "Google Sheets API integration for property management.",
            "Trilingual support: English, Spanish, French.",
        ],
    },

    "dojo_crud": {
        "name": "Dojo App",
        "tagline": "Full-stack martial arts forms management system for Goju-Ryu practitioners. MEN stack.",
        "personal_connection": "Pablo is a 3rd-degree black belt in Goju-Ryu — this app tracks his actual lineage's curriculum.",
        "stack": ["Node.js", "Express.js", "MongoDB/Mongoose", "EJS", "Chart.js", "bcrypt", "Helmet.js"],
        "features": [
            "48+ traditional forms across Kata, Bunkai, Kumite, Weapons — 10th Kyu (White) to 8th Dan (Black).",
            "Soft delete with trash management — forms marked deleted, never permanently removed unless explicitly requested.",
            "Progress charts via Chart.js: form completion by rank.",
            "Multi-tenant: each practitioner manages only their own forms.",
            "Unique constraint: prevents duplicate form/rank combinations per user.",
        ],
    },

    "instvnce_blog": {
        "name": "INSTVNCE Blog",
        "tagline": "A personal technical blog that looks like a monitoring dashboard, not Medium.",
        "stack": ["React", "Vite", "SCSS", "Three.js via R3F", "Node.js/Express", "MongoDB"],
        "aesthetic": "Neopunk terminal: CRT scanline overlays, holographic post cards with chamfered corners, neon green on cosmic black, monospace everywhere. The medium feels like the work.",
        "features": [
            "Color language: green=deploy (AIM→FIRE), yellow=modify (edit state), red=destroy (terminate). No labels needed.",
            "3D braces { } framing the text input — real Three.js geometry with metallic material, triple-point neon lighting, floating animation. WebGL just to frame a textarea.",
            "Posts are 'instances': you write it, fire it, terminate it.",
            "Full GFM Markdown with syntax highlighting via rehype-highlight.",
        ],
    },

    "transcendence_3d": {
        "name": "Transcendence 3D v2",
        "tagline": "Tamagotchi-inspired evolution sim. A digital pet moves through the spectrum of light and emotion — and ultimately transcends.",
        "stack": ["Three.js", "React", "Blender", "Web Audio API", "Jest", "Vanilla JS"],
        "features": [
            "32 animations total — modeled, rigged, and animated by Pablo in Blender. Full FBX → Three.js pipeline.",
            "5 evolution stages: Blue → Yellow → Green → Red → Translucent White (transcendence). Each stage scales the creature up.",
            "Translucent White: Training is the only required care. Idle uses a Qi-Gong/meditative loop.",
            "Audio: training grunts, impact SFX, music switches during Dance.",
            "Easter egg: hidden 'upside!' button opens Battle Arena — 4 React Three Fiber scenes (Dance Battle with metallic chrome cats, Cyberpunk Arena, Japanese Dojo with cherry blossoms, Indigo Claw Dojo).",
        ],
        "live": "https://transcendence-3-d-v2.vercel.app",
    },
}

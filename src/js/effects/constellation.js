/**
 * constellation.js
 * Draws SVG connection lines between tech stack nodes on the skills page.
 */

const CONNECTIONS = [
  ["js", "ts"],
  ["js", "react"],
  ["js", "nodejs"],
  ["js", "htmlcss"],
  ["ts", "react"],
  ["ts", "nextjs"],
  ["react", "nextjs"],
  ["nodejs", "express"],
  ["nodejs", "postgresql"],
  ["nodejs", "mongodb"],
  ["postgresql", "graphql"],
  ["mongodb", "graphql"],
  ["threejs", "blender"],
  ["figma", "react"],
  ["git", "docker"],
  ["docker", "aws"],
  ["aws", "vercel"],
  ["nodejs", "docker"],
  ["python", "nodejs"],
];

const wrapper = document.getElementById("constellation");
const svg = document.getElementById("constellationSvg");
if (!wrapper || !svg) {
  // not on skills page or constellation disabled
} else {
  function getCenter(el) {
    const wrapRect = wrapper.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - wrapRect.left,
      y: r.top + r.height / 2 - wrapRect.top,
    };
  }

  function drawLines() {
    svg.innerHTML = "";
    CONNECTIONS.forEach(([aId, bId]) => {
      const aEl = wrapper.querySelector(`[data-id="${aId}"] .c-node-inner`);
      const bEl = wrapper.querySelector(`[data-id="${bId}"] .c-node-inner`);
      if (!aEl || !bEl) return;
      const a = getCenter(aEl);
      const b = getCenter(bEl);
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", a.x);
      line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x);
      line.setAttribute("y2", b.y);
      line.dataset.from = aId;
      line.dataset.to = bId;
      line.classList.add("c-line");
      svg.appendChild(line);
    });
  }

  function setupHover() {
    const nodes = wrapper.querySelectorAll(".c-node");
    nodes.forEach((node) => {
      const id = node.dataset.id;
      node.addEventListener("mouseenter", () => {
        wrapper.classList.add("has-hover");
        const connectedIds = new Set([id]);
        svg
          .querySelectorAll(`line[data-from="${id}"], line[data-to="${id}"]`)
          .forEach((line) => {
            line.classList.add("active");
            connectedIds.add(line.dataset.from);
            connectedIds.add(line.dataset.to);
          });
        nodes.forEach((n) => {
          if (connectedIds.has(n.dataset.id)) n.classList.add("connected");
        });
      });
      node.addEventListener("mouseleave", () => {
        wrapper.classList.remove("has-hover");
        svg
          .querySelectorAll("line.active")
          .forEach((l) => l.classList.remove("active"));
        nodes.forEach((n) => n.classList.remove("connected"));
      });
    });
  }

  function setupReveal() {
    const nodes = wrapper.querySelectorAll(".c-node");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // stagger based on index
            const idx = Array.from(nodes).indexOf(entry.target);
            entry.target.style.transitionDelay = `${idx * 40}ms`;
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
  }

  window.addEventListener("load", () => {
    drawLines();
    setupHover();
    setupReveal();
  });
  window.addEventListener("resize", drawLines);
}

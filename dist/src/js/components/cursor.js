// Custom Cursor System
document.addEventListener("DOMContentLoaded", function () {
  console.log("Creating custom cursor system...");

  // Create cursor elements
  const cursorMain = document.createElement("div");
  cursorMain.className = "cursor-main";
  cursorMain.style.display = "block";

  const cursorFollow = document.createElement("div");
  cursorFollow.className = "cursor-follow";
  cursorFollow.style.display = "block";

  const cursorGlow = document.createElement("div");
  cursorGlow.className = "cursor-glow";
  cursorGlow.style.display = "block";

  document.body.appendChild(cursorMain);
  document.body.appendChild(cursorFollow);
  document.body.appendChild(cursorGlow);

  console.log("Cursor elements created:", cursorMain, cursorFollow, cursorGlow);

  let mouseX = window.innerWidth / 2,
    mouseY = window.innerHeight / 2;
  let followerX = mouseX,
    followerY = mouseY;
  let glowX = mouseX,
    glowY = mouseY;

  // Initial positioning
  cursorMain.style.left = mouseX - 10 + "px";
  cursorMain.style.top = mouseY - 10 + "px";
  cursorFollow.style.left = mouseX - 4 + "px";
  cursorFollow.style.top = mouseY - 4 + "px";

  // Update cursor position
  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorMain.style.left = mouseX - 10 + "px";
    cursorMain.style.top = mouseY - 10 + "px";
  });

  // Smooth follow animation
  function animateFollower() {
    const speed = 0.15;

    followerX += (mouseX - followerX) * speed;
    followerY += (mouseY - followerY) * speed;

    cursorFollow.style.left = followerX - 4 + "px";
    cursorFollow.style.top = followerY - 4 + "px";

    // Glow follows even slower
    const glowSpeed = 0.08;
    glowX += (mouseX - glowX) * glowSpeed;
    glowY += (mouseY - glowY) * glowSpeed;

    cursorGlow.style.left = glowX - 50 + "px";
    cursorGlow.style.top = glowY - 50 + "px";

    requestAnimationFrame(animateFollower);
  }

  animateFollower();

  // Hover effects on interactive elements
  const interactiveElements =
    'a, button, .card, .nav-links a, #myName, [role="button"], input, textarea';

  document.addEventListener("mouseover", function (e) {
    if (e.target.matches(interactiveElements)) {
      cursorMain.classList.add("hover");
      cursorGlow.classList.add("active");
    }
  });

  document.addEventListener("mouseout", function (e) {
    if (e.target.matches(interactiveElements)) {
      cursorMain.classList.remove("hover");
      cursorGlow.classList.remove("active");
    }
  });

  // Hide cursor when leaving window
  document.addEventListener("mouseenter", function () {
    cursorMain.style.opacity = "1";
    cursorFollow.style.opacity = "0.8";
  });

  document.addEventListener("mouseleave", function () {
    cursorMain.style.opacity = "0";
    cursorFollow.style.opacity = "0";
    cursorGlow.classList.remove("active");
  });
});

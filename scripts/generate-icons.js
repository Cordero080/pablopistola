const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "..", "icons");

// Read the original logo SVG
const logoSvg = fs.readFileSync(path.join(iconsDir, "logo-one.svg"), "utf8");

// Extract viewBox dimensions from the original
const viewBoxMatch = logoSvg.match(/viewBox="([^"]+)"/);
const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 711.88 712.44";

// Create icon SVG with gradient background and embedded logo
function createIconSvg(size) {
  // The logo viewBox is roughly 712x712, center it with some padding
  const padding = size * 0.1; // 10% padding
  const logoSize = size - padding * 2;
  const scale = logoSize / 712;

  // Extract the content inside the original SVG (defs and paths)
  const svgContent = logoSvg
    .replace(/<\?xml[^>]*\?>/, "")
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>/, "");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#001743;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#001030;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000810;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Background with gradient -->
  <rect width="${size}" height="${size}" fill="url(#bgGradient)"/>
  <!-- Logo centered and scaled -->
  <g transform="translate(${padding}, ${padding}) scale(${scale})">
    ${svgContent}
  </g>
</svg>`;
}

async function generateIcons() {
  const sizes = [192, 512];

  for (const size of sizes) {
    const iconSvg = createIconSvg(size);
    const outputPath = path.join(iconsDir, `icon-${size}.png`);

    await sharp(Buffer.from(iconSvg)).png().toFile(outputPath);

    console.log(`Generated: ${outputPath}`);
  }

  console.log("Done!");
}

generateIcons().catch(console.error);

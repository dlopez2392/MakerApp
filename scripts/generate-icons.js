const sharp = require("sharp");
const path = require("path");

const BG = "#0f0f1a";
const ACCENT = "#f59e0b";
const OUTPUT_DIR = path.join(__dirname, "..", "assets", "images");

function createIconSvg(size) {
  const fontSize = Math.round(size * 0.48);
  const yOffset = Math.round(size * 0.04);
  const borderRadius = Math.round(size * 0.2);

  // Subtle grid lines for "maker" feel
  const gridSpacing = Math.round(size * 0.12);
  let gridLines = "";
  for (let i = gridSpacing; i < size; i += gridSpacing) {
    gridLines += `<line x1="${i}" y1="0" x2="${i}" y2="${size}" stroke="#1e1e2e" stroke-width="1"/>`;
    gridLines += `<line x1="0" y1="${i}" x2="${size}" y2="${i}" stroke="#1e1e2e" stroke-width="1"/>`;
  }

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${borderRadius}" fill="${BG}"/>
  ${gridLines}
  <text x="${size / 2}" y="${size / 2 + yOffset}"
        font-family="Arial, Helvetica, sans-serif" font-weight="bold"
        font-size="${fontSize}" fill="${ACCENT}"
        text-anchor="middle" dominant-baseline="central">M</text>
  <text x="${size / 2}" y="${size * 0.82}"
        font-family="Arial, Helvetica, sans-serif" font-weight="600"
        font-size="${Math.round(size * 0.09)}" fill="#94a3b8"
        text-anchor="middle" dominant-baseline="central" letter-spacing="${Math.round(size * 0.02)}">MAKER</text>
</svg>`;
}

function createSplashSvg(size) {
  const fontSize = Math.round(size * 0.35);
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <text x="${size / 2}" y="${size / 2}"
        font-family="Arial, Helvetica, sans-serif" font-weight="bold"
        font-size="${fontSize}" fill="${ACCENT}"
        text-anchor="middle" dominant-baseline="central">M</text>
</svg>`;
}

function createAdaptiveIconSvg(size) {
  const fontSize = Math.round(size * 0.38);
  const yOffset = Math.round(size * 0.03);

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <text x="${size / 2}" y="${size / 2 + yOffset}"
        font-family="Arial, Helvetica, sans-serif" font-weight="bold"
        font-size="${fontSize}" fill="${ACCENT}"
        text-anchor="middle" dominant-baseline="central">M</text>
  <text x="${size / 2}" y="${size * 0.72}"
        font-family="Arial, Helvetica, sans-serif" font-weight="600"
        font-size="${Math.round(size * 0.07)}" fill="#94a3b8"
        text-anchor="middle" dominant-baseline="central" letter-spacing="${Math.round(size * 0.015)}">MAKER</text>
</svg>`;
}

async function generate() {
  // iOS App Icon (1024x1024)
  await sharp(Buffer.from(createIconSvg(1024)))
    .png()
    .toFile(path.join(OUTPUT_DIR, "icon.png"));
  console.log("icon.png (1024x1024)");

  // Android Adaptive Icon foreground (1024x1024)
  await sharp(Buffer.from(createAdaptiveIconSvg(1024)))
    .png()
    .toFile(path.join(OUTPUT_DIR, "adaptive-icon.png"));
  console.log("adaptive-icon.png (1024x1024)");

  // Splash icon (200x200)
  await sharp(Buffer.from(createSplashSvg(200)))
    .png()
    .toFile(path.join(OUTPUT_DIR, "splash-icon.png"));
  console.log("splash-icon.png (200x200)");

  // Favicon (48x48)
  await sharp(Buffer.from(createIconSvg(48)))
    .png()
    .toFile(path.join(OUTPUT_DIR, "favicon.png"));
  console.log("favicon.png (48x48)");

  console.log("Done!");
}

generate().catch(console.error);

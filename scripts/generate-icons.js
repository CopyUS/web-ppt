/**
 * Generate Web.PPT add-in icons.
 * 16x16 — blue "W" letter, no circle, transparent background
 * 32x32, 80x80, 128x128 — blue circle on transparent background with "W.P." inside
 *
 * Usage: node scripts/generate-icons.js
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const BRAND_COLOR = '#4B7BEC';
const WHITE = '#FFFFFF';
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

/**
 * 16px icon: just a blue "W" letter on transparent background.
 */
function drawSmallIcon(ctx, size) {
  ctx.clearRect(0, 0, size, size);

  ctx.fillStyle = BRAND_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${size * 0.85}px Arial, sans-serif`;
  ctx.fillText('W', size / 2, size / 2 + size * 0.05);
}

/**
 * 32/80/128px icon: blue circle on transparent background with "W.P." text inside.
 */
function drawCircleIcon(ctx, size) {
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.46;

  // Blue circle
  ctx.fillStyle = BRAND_COLOR;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // "W.P." text inside
  ctx.fillStyle = WHITE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let fontSize = size * 0.34;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  let textWidth = ctx.measureText('W.P.').width;

  // Scale down if too wide for the circle
  const maxWidth = r * 1.6;
  if (textWidth > maxWidth) {
    fontSize *= maxWidth / textWidth;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  }

  ctx.fillText('W.P.', cx, cy + fontSize * 0.05);
}

function generateIcon(size, type) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  if (type === 'letter') {
    drawSmallIcon(ctx, size);
  } else {
    drawCircleIcon(ctx, size);
  }

  return canvas.toBuffer('image/png');
}

// Generate all icons
const icons = [
  { size: 16, type: 'letter' },
  { size: 32, type: 'circle' },
  { size: 80, type: 'circle' },
  { size: 128, type: 'circle' },
];

for (const { size, type } of icons) {
  const buffer = generateIcon(size, type);
  const filePath = path.join(ASSETS_DIR, `icon-${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated: icon-${size}.png (${type}, ${buffer.length} bytes)`);
}

console.log('Done!');

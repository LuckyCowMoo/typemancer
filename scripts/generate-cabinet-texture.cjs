const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Palette definition
const PALETTE = {
  BASE_DARK: [0x3b, 0x28, 0x1c], // #3b281c - base dark oak plank
  MID_GRAIN: [0x46, 0x30, 0x22], // #463022 - mid tone wood grain
  LIGHT_GRAIN: [0x52, 0x39, 0x28], // #523928 - lighter wood grain
  DEEP_SHADOW: [0x31, 0x20, 0x16], // #312016 - deep shadow / plank groove
  WARM_HL: [0x5d, 0x42, 0x2f], // #5d422f - warm highlight / rivet edge
  SEAM_DARKEST: [0x27, 0x19, 0x11], // #271911 - darkest seam / rivet center
};

const WIDTH = 64;
const HEIGHT = 64;

// 2D grid of RGB tuples
const grid = Array.from({ length: HEIGHT }, () =>
  Array.from({ length: WIDTH }, () => PALETTE.BASE_DARK)
);

// 4 horizontal wood planks (each 16px high: 0..15, 16..31, 32..47, 48..63)
for (let y = 0; y < HEIGHT; y++) {
  const plankIndex = Math.floor(y / 16);
  const plankY = y % 16;

  for (let x = 0; x < WIDTH; x++) {
    // Seam line between planks (tileable across y=0/64)
    if (plankY === 0) {
      grid[y][x] = PALETTE.SEAM_DARKEST;
      continue;
    }
    if (plankY === 1) {
      grid[y][x] = PALETTE.DEEP_SHADOW;
      continue;
    }
    if (plankY === 15) {
      // Subtle bevel highlight along bottom edge of plank
      grid[y][x] = PALETTE.LIGHT_GRAIN;
      continue;
    }

    // Natural wood grain wavy lines (periodic in x with period 64)
    // Sine waves with integer harmonics so it tiles seamlessly at x=0 and x=63
    const phase = plankIndex * 1.57;
    const wave1 = Math.sin((x / WIDTH) * 2 * Math.PI * 2 + phase);
    const wave2 = Math.cos((x / WIDTH) * 2 * Math.PI * 3 + plankY * 0.4);
    const grainVal = (wave1 * 1.8 + wave2 * 1.2 + ((x * 7 + plankY * 13) % 5) * 0.3);

    // Color bands within plank
    if (plankY === 4 || plankY === 8 || plankY === 12) {
      if (grainVal > 1.0) {
        grid[y][x] = PALETTE.LIGHT_GRAIN;
      } else if (grainVal < -1.0) {
        grid[y][x] = PALETTE.DEEP_SHADOW;
      } else {
        grid[y][x] = PALETTE.MID_GRAIN;
      }
    } else if (grainVal > 1.8) {
      grid[y][x] = PALETTE.WARM_HL;
    } else if (grainVal > 0.8) {
      grid[y][x] = PALETTE.LIGHT_GRAIN;
    } else if (grainVal < -0.9) {
      grid[y][x] = PALETTE.DEEP_SHADOW;
    } else if (grainVal < 0) {
      grid[y][x] = PALETTE.MID_GRAIN;
    } else {
      grid[y][x] = PALETTE.BASE_DARK;
    }
  }
}

// Add subtle pixel rivets (tileable placement: plank rivets)
// Rivets at x = 8 and x = 56 on plank rows
const rivetCoords = [
  { rx: 8, ry: 7 },
  { rx: 56, ry: 7 },
  { rx: 20, ry: 23 },
  { rx: 44, ry: 23 },
  { rx: 12, ry: 39 },
  { rx: 52, ry: 39 },
  { rx: 28, ry: 55 },
  { rx: 36, ry: 55 },
];

for (const { rx, ry } of rivetCoords) {
  // 3x3 pixel rivet
  // Top-left highlight, center dark indent, right/bottom shadow
  const put = (dx, dy, color) => {
    const px = (rx + dx + WIDTH) % WIDTH;
    const py = (ry + dy + HEIGHT) % HEIGHT;
    grid[py][px] = color;
  };

  put(-1, -1, PALETTE.WARM_HL);
  put(0, -1, PALETTE.WARM_HL);
  put(1, -1, PALETTE.MID_GRAIN);

  put(-1, 0, PALETTE.WARM_HL);
  put(0, 0, PALETTE.SEAM_DARKEST);
  put(1, 0, PALETTE.DEEP_SHADOW);

  put(-1, 1, PALETTE.DEEP_SHADOW);
  put(0, 1, PALETTE.DEEP_SHADOW);
  put(1, 1, PALETTE.SEAM_DARKEST);
}

// Generate PNG Buffer
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

// IHDR
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr.writeUInt8(8, 8); // 8-bit depth
ihdr.writeUInt8(6, 9); // RGBA
ihdr.writeUInt8(0, 10); // Deflate
ihdr.writeUInt8(0, 11); // Filter
ihdr.writeUInt8(0, 12); // Interlace

// Raw scanlines
const scanlines = Buffer.alloc(HEIGHT * (1 + WIDTH * 4));
let offset = 0;
for (let y = 0; y < HEIGHT; y++) {
  scanlines[offset++] = 0; // Filter: None
  for (let x = 0; x < WIDTH; x++) {
    const [r, g, b] = grid[y][x];
    scanlines[offset++] = r;
    scanlines[offset++] = g;
    scanlines[offset++] = b;
    scanlines[offset++] = 255; // Alpha
  }
}

const idatData = zlib.deflateSync(scanlines);
const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const ihdrChunk = makeChunk('IHDR', ihdr);
const idatChunk = makeChunk('IDAT', idatData);
const iendChunk = makeChunk('IEND', Buffer.alloc(0));

const finalPng = Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);

const outDir = path.resolve(__dirname, '..', 'public', 'assets', 'ui');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, 'cabinet_wood_pixel.png');
fs.writeFileSync(outPath, finalPng);
console.log('Successfully generated pixel texture at:', outPath, 'Size:', finalPng.length, 'bytes');

/**
 * Generate PWA icons as valid PNG files using only Node.js built-ins.
 * Creates simple recognizable icons with ink-900 background + gold circle.
 */
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "public", "icons");

// RGBA palette
const INK_900 = [0x1a, 0x1a, 0x18, 0xff];  // dark bg
const GOLD_500 = [0xf4, 0xc4, 0x3d, 0xff];  // gold circle
const GOLD_300 = [0xf8, 0xd8, 0x76, 0xff];  // lighter gold highlight

function crc32(buf) {
  let crc = 0xffffffff;
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeB, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData));
  return Buffer.concat([len, typeB, data, crc]);
}

function createPNG(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);   // width
  ihdr.writeUInt32BE(size, 4);   // height
  ihdr[8] = 8;                   // bit depth
  ihdr[9] = 6;                   // color type (RGBA)
  ihdr[10] = 0;                  // compression
  ihdr[11] = 0;                  // filter
  ihdr[12] = 0;                  // interlace

  // Generate pixel data (RGBA)
  const raw = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;        // circle radius
  const dotR = size * 0.08;     // center dot radius

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < r) {
        // Gold circle with slight highlight
        const highlight = Math.max(0, 1 - dist / r);
        raw[i] = Math.min(255, GOLD_500[0] + highlight * 20);
        raw[i + 1] = Math.min(255, GOLD_500[1] + highlight * 30);
        raw[i + 2] = Math.max(0, GOLD_500[2] - (1 - highlight) * 20);
        raw[i + 3] = 255;
        
        // Cross-hatch football laces
        if (Math.abs(dx) < size * 0.03 && dist < r * 0.6) {
          raw[i] = INK_900[0]; raw[i+1] = INK_900[1]; raw[i+2] = INK_900[2];
        }
      } else {
        raw[i] = INK_900[0];
        raw[i + 1] = INK_900[1];
        raw[i + 2] = INK_900[2];
        raw[i + 3] = 255;
      }
    }
  }

  // Apply filter bytes (none filter = 0 per row)
  const filtered = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    filtered[y * (size * 4 + 1)] = 0; // filter byte
    raw.copy(filtered, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  const compressed = zlib.deflateSync(filtered);

  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// Generate icons
fs.mkdirSync(OUT_DIR, { recursive: true });

[192, 512].forEach((size) => {
  const png = createPNG(size);
  const outPath = path.join(OUT_DIR, `icon-${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Created ${outPath} (${png.length} bytes)`);
});

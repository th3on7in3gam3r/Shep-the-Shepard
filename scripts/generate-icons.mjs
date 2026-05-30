import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconsDir = join(root, "public/icons");
const svg = readFileSync(join(iconsDir, "icon.svg"));

const BRAND_GREEN = { r: 0x5c, g: 0x7a, b: 0x56, alpha: 1 };

async function writeStandardIcon(size) {
  await sharp(svg).resize(size, size).png().toFile(join(iconsDir, `icon-${size}.png`));
}

/** Maskable icons keep artwork in the ~66% safe zone for circular crops. */
async function writeMaskableIcon(size) {
  const inner = Math.round(size * 0.82);
  const offset = Math.round((size - inner) / 2);
  const artwork = await sharp(svg).resize(inner, inner).png().toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_GREEN,
    },
  })
    .composite([{ input: artwork, top: offset, left: offset }])
    .png()
    .toFile(join(iconsDir, `icon-maskable-${size}.png`));
}

async function writeAppleTouchIcon() {
  await sharp(svg).resize(180, 180).png().toFile(join(iconsDir, "apple-touch-icon.png"));
}

await Promise.all([
  writeStandardIcon(192),
  writeStandardIcon(512),
  writeMaskableIcon(192),
  writeMaskableIcon(512),
  writeAppleTouchIcon(),
]);

console.log("Generated PWA icons in public/icons/");

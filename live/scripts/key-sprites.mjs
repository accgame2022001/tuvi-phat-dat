import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..', '..');
const SRC = path.join(ROOT, 'vibe_images');
const OUT = path.join(ROOT, 'assets');

for (const [srcFile, outBase] of [
  ['tuvi-bg-dark.jpg', 'tuvi-bg-dark'],
  ['tuvi-bg-light.jpg', 'tuvi-bg-light'],
]) {
  await sharp(path.join(SRC, srcFile))
    .resize(1080, 1920, { fit: 'cover' })
    .webp({ quality: 88, effort: 5 })
    .toFile(path.join(OUT, `${outBase}.webp`));
  console.log(`${outBase}.webp 1080x1920`);
}

const inputs = {
  master_idle:  { file: 'master-idle.jpg',  chroma: 'magenta', height: 520, out: 'master_idle.webp' },
  master_shake: { file: 'master-shake.jpg', chroma: 'magenta', height: 520, out: 'master_shake.webp' },
  master_cast:  { file: 'master-cast.jpg',  chroma: 'magenta', height: 520, out: 'master_cast.webp' },
  master_read:  { file: 'master-read.jpg',  chroma: 'magenta', height: 520, out: 'master_read.webp' },
  man:          { file: 'seeker-man.jpg',      chroma: 'green', height: 420, out: 'guest_man.webp' },
  woman:        { file: 'seeker-woman.jpg',    chroma: 'green', height: 420, out: 'guest_woman.webp' },
  uncle:        { file: 'seeker-uncle.jpg',    chroma: 'green', height: 420, out: 'guest_uncle.webp' },
  oldwoman:     { file: 'seeker-oldwoman.jpg', chroma: 'green', height: 420, out: 'guest_oldwoman.webp' },
  cap:          { file: 'seeker-cap.jpg',      chroma: 'green', height: 420, out: 'guest_cap.webp' },
  sexy:         { file: 'seeker-sexy.jpg',     chroma: 'green', height: 420, out: 'guest_sexy.webp' },
  walk_man:      { file: 'walk-tuvi-man.jpg',      chroma: 'green', height: 740, out: 'walk_man.webp' },
  walk_woman:    { file: 'walk-tuvi-woman.jpg',    chroma: 'green', height: 740, out: 'walk_woman.webp' },
  walk_uncle:    { file: 'walk-tuvi-uncle.jpg',    chroma: 'green', height: 740, out: 'walk_uncle.webp' },
  walk_oldwoman: { file: 'walk-tuvi-oldwoman.jpg', chroma: 'green', height: 740, out: 'walk_oldwoman.webp' },
  walk_cap:      { file: 'walk-tuvi-cap.jpg',      chroma: 'green', height: 740, out: 'walk_cap.webp' },
  walk_sexy:     { file: 'walk-tuvi-sexy.jpg',     chroma: 'green', height: 740, out: 'walk_sexy.webp' },
};

const CHROMA = {
  green: (r, g, b) => g - Math.max(r, b),
  magenta: (r, g, b) => Math.min(r, b) - g,
};
const STRONG = 48, WEAK = 14;
const M_STRONG = 140, M_WEAK = 50;

for (const [key, spec] of Object.entries(inputs)) {
  const { data, info } = await sharp(path.join(SRC, spec.file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const strength = CHROMA[spec.chroma];
  const strong = spec.chroma === 'green' ? STRONG : M_STRONG;
  const weak = spec.chroma === 'green' ? WEAK : M_WEAK;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  const colHits = new Int32Array(width), rowHits = new Int32Array(height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const m = strength(r, g, b);
      let a = 255;
      if (m > strong) a = 0;
      else if (m > weak) a = Math.round((strong - m) / (strong - weak) * 255);
      if (spec.chroma === 'green' && m > weak) {
        const mm = Math.max(r, b);
        data[i] = Math.round((r + mm) / 2);
        data[i + 1] = mm;
        data[i + 2] = Math.round((b + mm) / 2);
      } else if (spec.chroma === 'magenta' && m > 12) {
        const cap = g + 42;
        if (data[i] > cap) data[i] = cap;
        if (data[i + 2] > cap) data[i + 2] = cap;
      }
      data[i + 3] = a;
      if (a < 80){ data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 0; continue; }
      if (a > 150){ colHits[x]++; rowHits[y]++; }
    }
  }
  const colMin = Math.max(3, Math.round(height * .004)), rowMin = Math.max(3, Math.round(width * .004));
  const edgeX = Math.round(width * .015), edgeY = Math.round(height * .01);
  for (let x = edgeX; x < width - edgeX; x++) if (colHits[x] >= colMin){ if (x < minX) minX = x; if (x > maxX) maxX = x; }
  for (let y = edgeY; y < height - edgeY; y++) if (rowHits[y] >= rowMin){ if (y < minY) minY = y; if (y > maxY) maxY = y; }
  if (maxX < 0) { console.warn(`skip ${key}`); continue; }
  const box = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
  const file = spec.out;
  await sharp(data, { raw: { width, height, channels: 4 } })
    .extract(box)
    .resize({ height: spec.height, fit: 'inside', withoutEnlargement: false })
    .webp({ quality: 92, alphaQuality: 96, effort: 6 })
    .toFile(path.join(OUT, file));
  const out = await sharp(path.join(OUT, file)).metadata();
  console.log(`${file} ${out.width}x${out.height}`);
}

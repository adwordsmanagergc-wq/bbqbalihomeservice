/* ============================================================================
 * IMAGE BUILD — responsive WebP + JPG variants and an optimised logo.
 *   node tools/build-images.js
 * Commit the outputs in assets/img/.
 * ========================================================================== */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const IMG = path.join(__dirname, "..", "assets", "img");

const PHOTOS = ["bbq-in-action.jpg", "chef-in-action.jpg", "how-it-works.jpg"];
const WIDTHS = [480, 768, 1200];

(async () => {
  for (const file of PHOTOS) {
    const base = file.replace(/\.jpg$/, "");
    const src = path.join(IMG, file);
    const meta = await sharp(src).metadata();
    for (const w of WIDTHS) {
      if (w > meta.width && w !== WIDTHS[WIDTHS.length - 1]) continue; // skip upsizing intermediates
      const width = Math.min(w, meta.width);
      await sharp(src).resize({ width, withoutEnlargement: true })
        .webp({ quality: 78 }).toFile(path.join(IMG, `${base}-${w}.webp`));
      await sharp(src).resize({ width, withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(IMG, `${base}-${w}.jpg`));
    }
    console.log("photo ✓ " + base + " (" + meta.width + "x" + meta.height + ")");
  }

  // Logo: rasterise the 174KB SVG to a small transparent PNG + WebP (~220px)
  const logoSrc = path.join(IMG, "logo.svg");
  await sharp(logoSrc, { density: 200 }).resize({ width: 220 }).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(path.join(IMG, "logo.png"));
  await sharp(logoSrc, { density: 200 }).resize({ width: 220 }).webp({ quality: 90 }).toFile(path.join(IMG, "logo.webp"));

  // Slim logo.svg: a minimal wrapper embedding the optimised PNG (universally
  // supported inside <img>-loaded SVG), so every existing
  // <img src="assets/img/logo.png"> shrinks from 174KB to a few KB.
  const pngB64 = fs.readFileSync(path.join(IMG, "logo.png")).toString("base64");
  const slim = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 220 220" width="220" height="220"><image width="220" height="220" xlink:href="data:image/png;base64,${pngB64}"/></svg>`;
  fs.writeFileSync(logoSrc, slim);

  const sz = (f) => (fs.statSync(path.join(IMG, f)).size / 1024).toFixed(1) + "KB";
  console.log("logo ✓ svg=" + sz("logo.svg") + " png=" + sz("logo.png") + " webp=" + sz("logo.webp"));
})().catch((e) => { console.error(e); process.exit(1); });

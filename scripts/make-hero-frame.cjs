/**
 * 给首屏截图包一圈「窄黑色屏幕边框」。
 * 用法: node scripts/make-hero-frame.cjs <输入图> <输出webp>
 * 做法: 外圈圆角纯黑底 + 内圈圆角裁切的截图 + 1px 内描边高光，
 *       四角透明，配合站点 CSS 的 drop-shadow 出立体感。
 */
const sharp = require('sharp');

const SRC = process.argv[2];
const OUT = process.argv[3] || 'public/portal/screenshots/hero-desktop.webp';

const BEZEL = 14;      // 边框厚度（源图 1920 宽下的像素）
const OUTER_R = 22;    // 外圆角
const INNER_R = 9;     // 屏幕内圆角

const maskSvg = (w, h, r) =>
  Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`
  );

(async () => {
  const meta = await sharp(SRC).metadata();
  const w = meta.width;
  const h = meta.height;
  const W = w + BEZEL * 2;
  const H = h + BEZEL * 2;

  // 屏幕内容：按内圆角裁切，保留透明角
  const screen = await sharp(SRC)
    .composite([{ input: maskSvg(w, h, INNER_R), blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 边框底板：圆角纯黑，外圈 1px 亮边模拟金属反光
  const frameSvg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
           <stop offset="0.45" stop-color="#ffffff" stop-opacity="0.05"/>
           <stop offset="1" stop-color="#ffffff" stop-opacity="0.12"/>
         </linearGradient>
       </defs>
       <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="${OUTER_R}" ry="${OUTER_R}" fill="#0d0d0f"/>
       <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="${OUTER_R}" ry="${OUTER_R}" fill="none" stroke="url(#edge)" stroke-width="1"/>
     </svg>`
  );

  // 屏幕与边框之间的 1px 细线，让屏幕「嵌」进去
  const hairlineSvg = Buffer.from(
    `<svg width="${BEZEL * 2 + w}" height="${BEZEL * 2 + h}" xmlns="http://www.w3.org/2000/svg">
       <rect x="${BEZEL - 1}" y="${BEZEL - 1}" width="${w + 2}" height="${h + 2}" rx="${INNER_R + 1}" ry="${INNER_R + 1}" fill="none" stroke="#000000" stroke-opacity="0.9" stroke-width="1"/>
     </svg>`
  );

  // 合成的无损母版：后续所有编码都从它出，避免二次压缩
  const master = await sharp(frameSvg)
    .composite([
      { input: screen, top: BEZEL, left: BEZEL },
      { input: hairlineSvg, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  // 不做任何缩放：保持源图原生像素，界面文字 1:1 清晰
  const out = await sharp(master)
    .webp({ quality: 96, effort: 6, smartSubsample: false })
    .toFile(OUT);

  const avifPath = OUT.replace(/\.webp$/i, '.avif');
  const avif = await sharp(master).avif({ quality: 72, effort: 6 }).toFile(avifPath);

  console.log(
    JSON.stringify({
      src: `${w}x${h}`,
      out: `${out.width}x${out.height}`,
      ratio: +(out.width / out.height).toFixed(4),
      webpKB: Math.round(out.size / 1024),
      avifKB: Math.round(avif.size / 1024),
    })
  );
})();

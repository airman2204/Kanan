const fs = require("fs");
const { PNG } = require("pngjs");

function cropPng(inputPath, outputPath) {
  const data = fs.readFileSync(inputPath);
  const png = PNG.sync.read(data);
  let minX = png.width, minY = png.height, maxX = 0, maxY = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      const alpha = png.data[idx + 3];
      if (alpha > 15) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const pad = 12;
  const startX = Math.max(0, minX - pad);
  const startY = Math.max(0, minY - pad);
  const endX = Math.min(png.width, maxX + pad);
  const endY = Math.min(png.height, maxY + pad);
  const cropW = endX - startX;
  const cropH = endY - startY;

  const cropped = new PNG({ width: cropW, height: cropH });
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcIdx = (png.width * (startY + y) + (startX + x)) << 2;
      const dstIdx = (cropW * y + x) << 2;
      cropped.data[dstIdx] = png.data[srcIdx];
      cropped.data[dstIdx + 1] = png.data[srcIdx + 1];
      cropped.data[dstIdx + 2] = png.data[srcIdx + 2];
      cropped.data[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }
  fs.writeFileSync(outputPath, PNG.sync.write(cropped));
  console.log("Success cropping", inputPath, "to", outputPath, cropW, "x", cropH);
}

cropPng("public/assets/brand/kanan-logo-oficial.png", "public/assets/brand/kanan-logo-cropped.png");
cropPng("public/assets/brand/kanan-logo-white.png", "public/assets/brand/kanan-logo-white-cropped.png");

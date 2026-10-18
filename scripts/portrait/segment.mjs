// Step 1 of the portrait cutout: coarse subject mask with ISNet (bundled
// weights in @imgly/background-removal-node, runs locally on CPU).
// usage: node segment.mjs <tools-dir> <input.jpg> <out-mask.pgm>
import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";

const [toolsDir, input, outMask] = process.argv.slice(2);
const require = createRequire(toolsDir + "/package.json");
const { segmentForeground } = require("@imgly/background-removal-node");
const sharp = require("sharp");

const buf = await readFile(input);
const { width, height } = await sharp(buf).metadata();
const blob = new Blob([buf], { type: "image/jpeg" });
const rgba = await segmentForeground(blob, {
  publicPath: `file://${toolsDir}/node_modules/@imgly/background-removal-node/dist/`,
  model: "medium",
  // raw output keeps full 8-bit alpha (the PNG encoder palettises the mask)
  output: { format: "image/x-rgba8" },
});
const px = new Uint8Array(await rgba.arrayBuffer());
const alpha = new Uint8Array(width * height);
for (let i = 0; i < alpha.length; i++) alpha[i] = px[i * 4 + 3];
await writeFile(outMask, Buffer.concat([Buffer.from(`P5\n${width} ${height}\n255\n`), Buffer.from(alpha)]));
console.log(`mask ${width}x${height} -> ${outMask}`);

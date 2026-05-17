import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import sharp from "sharp";

const postProcessSource = readFileSync(
  new URL("../lib/llm/imageJobs/postProcessImage.ts", import.meta.url),
  "utf8"
);
const runJobsSource = readFileSync(
  new URL("../lib/llm/imageJobs/runObjectImageJobs.ts", import.meta.url),
  "utf8"
);

assert.match(postProcessSource, /import sharp from "sharp"/);
assert.match(postProcessSource, /export async function postProcessAssetBuffer/);
assert.match(postProcessSource, /export function isPostProcessableMimeType/);
assert.match(postProcessSource, /\.modulate\(/);
assert.match(postProcessSource, /\.linear\(/);
assert.match(postProcessSource, /\.composite\(/);
assert.match(postProcessSource, /soft-light/);
assert.match(postProcessSource, /multiply/);
assert.match(postProcessSource, /room_shell_background/);

assert.match(runJobsSource, /import \{[\s\S]*postProcessAssetBuffer[\s\S]*\} from "@\/lib\/llm\/imageJobs\/postProcessImage"/);
assert.match(runJobsSource, /isPostProcessableMimeType\(decoded\.mimeType\)/);
assert.match(runJobsSource, /postProcessAssetBuffer\(\s*decoded\.buffer/);
assert.match(runJobsSource, /buffer: processedBuffer/);
assert.match(runJobsSource, /console\.warn\(/);

const baseBuffer = await sharp({
  create: {
    width: 64,
    height: 64,
    channels: 3,
    background: { r: 220, g: 180, b: 130 }
  }
})
  .png()
  .toBuffer();

const noiseSize = 64;
const pixels = Buffer.alloc(noiseSize * noiseSize * 3);
for (let i = 0; i < pixels.length; i += 3) {
  const value = 124 + Math.round((Math.random() - 0.5) * 32);
  pixels[i] = value;
  pixels[i + 1] = value;
  pixels[i + 2] = value;
}
const grain = await sharp(pixels, {
  raw: { width: noiseSize, height: noiseSize, channels: 3 }
})
  .png()
  .toBuffer();

const vignette = await sharp(
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><defs><radialGradient id="g" cx="50%" cy="50%" r="78%"><stop offset="42%" stop-color="black" stop-opacity="0"/><stop offset="100%" stop-color="black" stop-opacity="0.55"/></radialGradient></defs><rect width="64" height="64" fill="url(#g)"/></svg>'
  )
)
  .png()
  .toBuffer();

const processed = await sharp(baseBuffer)
  .modulate({ saturation: 0.92, brightness: 1.02 })
  .linear(1.05, -8)
  .composite([
    { input: vignette, blend: "multiply" },
    { input: grain, blend: "soft-light" }
  ])
  .png()
  .toBuffer();

assert.ok(processed.length > 0, "processed buffer should be non-empty");

const processedMeta = await sharp(processed).metadata();
assert.equal(processedMeta.width, 64);
assert.equal(processedMeta.height, 64);
assert.equal(processedMeta.format, "png");

const baseStats = await sharp(baseBuffer).stats();
const processedStats = await sharp(processed).stats();
assert.notEqual(
  processedStats.channels[0].mean.toFixed(2),
  baseStats.channels[0].mean.toFixed(2),
  "post-process should shift red channel mean"
);

console.log("# imagePostProcess source + sharp runtime checks passed");

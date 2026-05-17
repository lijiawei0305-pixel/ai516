import sharp from "sharp";
import type { ImageAssetRole } from "@/lib/llm/pipeline/types";

const GRAIN_INTENSITY = 32;
const GRAIN_BASE = 124;

type CachedNoise = {
  width: number;
  height: number;
  buffer: Buffer;
};

let cachedGrain: CachedNoise | null = null;

async function buildGrainBuffer(width: number, height: number): Promise<Buffer> {
  const pixels = Buffer.alloc(width * height * 3);

  for (let i = 0; i < pixels.length; i += 3) {
    const value = GRAIN_BASE + Math.round((Math.random() - 0.5) * GRAIN_INTENSITY);
    pixels[i] = value;
    pixels[i + 1] = value;
    pixels[i + 2] = value;
  }

  return sharp(pixels, {
    raw: { width, height, channels: 3 }
  })
    .png()
    .toBuffer();
}

async function getGrainBuffer(width: number, height: number): Promise<Buffer> {
  if (cachedGrain && cachedGrain.width === width && cachedGrain.height === height) {
    return cachedGrain.buffer;
  }

  const buffer = await buildGrainBuffer(width, height);
  cachedGrain = { width, height, buffer };
  return buffer;
}

async function buildVignetteBuffer(width: number, height: number): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="vignette" cx="50%" cy="50%" r="78%">
        <stop offset="42%" stop-color="black" stop-opacity="0"/>
        <stop offset="100%" stop-color="black" stop-opacity="0.55"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#vignette)"/>
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function shouldApplyVignette(role: ImageAssetRole): boolean {
  return role === "room_shell_background";
}

export async function postProcessAssetBuffer(
  input: Buffer,
  role: ImageAssetRole
): Promise<Buffer> {
  const metadata = await sharp(input).metadata();
  const width = metadata.width && metadata.width > 0 ? metadata.width : 1024;
  const height = metadata.height && metadata.height > 0 ? metadata.height : 1024;
  const format = metadata.format ?? "png";
  const hasAlpha = Boolean(metadata.hasAlpha);

  let pipeline = sharp(input)
    .modulate({ saturation: 0.92, brightness: 1.02 })
    .linear(1.05, -8);

  const composites: sharp.OverlayOptions[] = [];

  if (shouldApplyVignette(role)) {
    const vignette = await buildVignetteBuffer(width, height);
    composites.push({ input: vignette, blend: "multiply" });
  }

  const grain = await getGrainBuffer(width, height);
  composites.push({ input: grain, blend: "soft-light" });

  if (composites.length > 0) {
    pipeline = pipeline.composite(composites);
  }

  if (format === "jpeg" || format === "jpg") {
    return pipeline.jpeg({ quality: 92 }).toBuffer();
  }

  return pipeline
    .png({ compressionLevel: 8, ...(hasAlpha ? {} : { palette: false }) })
    .toBuffer();
}

export function isPostProcessableMimeType(mimeType: string | null | undefined): boolean {
  if (!mimeType) return false;
  return mimeType === "image/png" || mimeType === "image/jpeg" || mimeType === "image/jpg";
}

import sharp from "sharp";
import type { ImageAssetRole } from "@/lib/llm/pipeline/types";

const GRAIN_INTENSITY = 32;
const GRAIN_BASE = 124;
const FOREGROUND_ALPHA_THRESHOLD = 18;
const BACKGROUND_COLOR_THRESHOLD = 18;
const BACKGROUND_TOTAL_DIFF_THRESHOLD = 42;
const SPRITE_BOTTOM_INSET_RATIO = 0.04;
const SPRITE_OCCUPANCY_BY_ROLE: Record<Extract<ImageAssetRole, "clue_object_sprite" | "pet_sprite">, number> = {
  clue_object_sprite: 0.56,
  pet_sprite: 0.52
};

type CachedNoise = {
  width: number;
  height: number;
  buffer: Buffer;
};

let cachedGrain: CachedNoise | null = null;

type RgbaSample = {
  r: number;
  g: number;
  b: number;
  a: number;
};

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

function shouldApplyGrain(role: ImageAssetRole, hasAlpha: boolean): boolean {
  if (role === "clue_object_sprite" || role === "pet_sprite") {
    return false;
  }

  return !hasAlpha || role === "room_shell_background" || role === "foreground_occluder";
}

function getPostProcessOutputMimeType(
  originalMimeType: string | null | undefined,
  role: ImageAssetRole
) {
  if (role === "clue_object_sprite" || role === "pet_sprite") {
    return "image/png";
  }

  if (originalMimeType === "image/jpeg" || originalMimeType === "image/jpg") {
    return "image/jpeg";
  }

  return "image/png";
}

function pixelOffset(width: number, x: number, y: number) {
  return (y * width + x) * 4;
}

function readPixel(data: Buffer, width: number, x: number, y: number): RgbaSample {
  const offset = pixelOffset(width, x, y);
  return {
    r: data[offset] ?? 0,
    g: data[offset + 1] ?? 0,
    b: data[offset + 2] ?? 0,
    a: data[offset + 3] ?? 0
  };
}

function averageCornerBackground(data: Buffer, width: number, height: number): RgbaSample {
  const corners: Array<[number, number]> = [
    [0, 0],
    [Math.max(0, width - 1), 0],
    [0, Math.max(0, height - 1)],
    [Math.max(0, width - 1), Math.max(0, height - 1)]
  ];

  const total = corners.reduce(
    (acc, [x, y]) => {
      const pixel = readPixel(data, width, x, y);
      return {
        r: acc.r + pixel.r,
        g: acc.g + pixel.g,
        b: acc.b + pixel.b,
        a: acc.a + pixel.a
      };
    },
    { r: 0, g: 0, b: 0, a: 0 }
  );

  return {
    r: Math.round(total.r / corners.length),
    g: Math.round(total.g / corners.length),
    b: Math.round(total.b / corners.length),
    a: Math.round(total.a / corners.length)
  };
}

function isBackgroundLike(pixel: RgbaSample, background: RgbaSample) {
  if (pixel.a <= FOREGROUND_ALPHA_THRESHOLD) {
    return true;
  }

  const dr = Math.abs(pixel.r - background.r);
  const dg = Math.abs(pixel.g - background.g);
  const db = Math.abs(pixel.b - background.b);
  const da = Math.abs(pixel.a - background.a);

  return (
    dr <= BACKGROUND_COLOR_THRESHOLD &&
    dg <= BACKGROUND_COLOR_THRESHOLD &&
    db <= BACKGROUND_COLOR_THRESHOLD &&
    dr + dg + db <= BACKGROUND_TOTAL_DIFF_THRESHOLD &&
    da <= 48
  );
}

function floodFillBackgroundMask(
  data: Buffer,
  width: number,
  height: number,
  background: RgbaSample
) {
  const visited = new Uint8Array(width * height);
  const stack: number[] = [];

  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const index = y * width + x;
    if (visited[index]) return;
    const pixel = readPixel(data, width, x, y);

    if (!isBackgroundLike(pixel, background)) return;

    visited[index] = 1;
    stack.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }

  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (stack.length > 0) {
    const index = stack.pop();

    if (typeof index !== "number") {
      continue;
    }

    const x = index % width;
    const y = Math.floor(index / width);

    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }

  return visited;
}

function foregroundBoundsFromMask(
  data: Buffer,
  width: number,
  height: number,
  backgroundMask: Uint8Array
) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const alpha = data[index * 4 + 3] ?? 0;

      if (backgroundMask[index] || alpha <= FOREGROUND_ALPHA_THRESHOLD) {
        continue;
      }

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return { minX, minY, maxX, maxY };
}

async function normalizeSpriteCanvas(
  input: Buffer,
  role: Extract<ImageAssetRole, "clue_object_sprite" | "pet_sprite">
) {
  const raw = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const width = info.width;
  const height = info.height;
  const canvasSize = Math.max(width, height);
  const background = averageCornerBackground(data, width, height);
  const backgroundMask = floodFillBackgroundMask(data, width, height, background);
  const bounds = foregroundBoundsFromMask(data, width, height, backgroundMask);

  if (!bounds) {
    return input;
  }

  const cutout = Buffer.from(data);

  for (let index = 0; index < backgroundMask.length; index += 1) {
    if (backgroundMask[index]) {
      cutout[index * 4 + 3] = 0;
    }
  }

  const contentWidth = bounds.maxX - bounds.minX + 1;
  const contentHeight = bounds.maxY - bounds.minY + 1;
  const margin = Math.max(12, Math.round(Math.max(contentWidth, contentHeight) * 0.06));
  const extractLeft = Math.max(0, bounds.minX - margin);
  const extractTop = Math.max(0, bounds.minY - margin);
  const extractWidth = Math.min(width - extractLeft, contentWidth + margin * 2);
  const extractHeight = Math.min(height - extractTop, contentHeight + margin * 2);
  const targetInnerSize = Math.max(
    64,
    Math.round(canvasSize * SPRITE_OCCUPANCY_BY_ROLE[role])
  );
  const bottomInset = Math.max(16, Math.round(canvasSize * SPRITE_BOTTOM_INSET_RATIO));
  const cropped = sharp(cutout, {
    raw: { width, height, channels: 4 }
  }).extract({
    left: extractLeft,
    top: extractTop,
    width: extractWidth,
    height: extractHeight
  });
  const resized = await cropped
    .resize({
      width: targetInnerSize,
      height: targetInnerSize,
      fit: "inside",
      withoutEnlargement: false
    })
    .png()
    .toBuffer({ resolveWithObject: true });
  const left = Math.round((canvasSize - resized.info.width) / 2);
  const top = Math.max(
    0,
    Math.round(canvasSize - resized.info.height - bottomInset)
  );

  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resized.data, left, top }])
    .png()
    .toBuffer();
}

export { getPostProcessOutputMimeType };

export async function postProcessAssetBuffer(
  input: Buffer,
  role: ImageAssetRole,
  originalMimeType?: string | null
): Promise<Buffer> {
  const normalizedInput =
    role === "clue_object_sprite" || role === "pet_sprite"
      ? await normalizeSpriteCanvas(input, role)
      : input;
  const metadata = await sharp(normalizedInput).metadata();
  const width = metadata.width && metadata.width > 0 ? metadata.width : 1024;
  const height = metadata.height && metadata.height > 0 ? metadata.height : 1024;
  const outputMimeType = getPostProcessOutputMimeType(
    originalMimeType || (metadata.format ? `image/${metadata.format}` : null),
    role
  );
  const hasAlpha = Boolean(metadata.hasAlpha);

  let pipeline = sharp(normalizedInput)
    .modulate({ saturation: 0.92, brightness: 1.02 })
    .linear(1.05, -8);

  const composites: sharp.OverlayOptions[] = [];

  if (shouldApplyVignette(role)) {
    const vignette = await buildVignetteBuffer(width, height);
    composites.push({ input: vignette, blend: "multiply" });
  }

  if (shouldApplyGrain(role, hasAlpha)) {
    const grain = await getGrainBuffer(width, height);
    composites.push({ input: grain, blend: "soft-light" });
  }

  if (composites.length > 0) {
    pipeline = pipeline.composite(composites);
  }

  if (outputMimeType === "image/jpeg") {
    return pipeline.jpeg({ quality: 92 }).toBuffer();
  }

  return pipeline
    .png({ compressionLevel: 8, ...(hasAlpha ? {} : { palette: false }) })
    .toBuffer();
}

export function isPostProcessableMimeType(mimeType: string | null | undefined): boolean {
  if (!mimeType) return false;
  const normalized = mimeType.split(";")[0]?.trim() || mimeType;
  return normalized === "image/png" || normalized === "image/jpeg" || normalized === "image/jpg";
}

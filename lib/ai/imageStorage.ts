import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import type { GeneratedImageSource } from "@/lib/ai/openAiCompatible";
import {
  getPostProcessOutputMimeType,
  isPostProcessableMimeType,
  postProcessAssetBuffer
} from "@/lib/llm/imageJobs/postProcessImage";

export type PersistedGeneratedImage = {
  sourceType: "url" | "base64";
  url: string;
  storagePath: string | null;
  mimeType: string | null;
};

function extensionFromMimeType(mimeType: string) {
  const normalized = mimeType.split(";")[0]?.trim() || mimeType;

  if (normalized === "image/jpeg" || normalized === "image/jpg") {
    return "jpg";
  }

  if (normalized === "image/webp") {
    return "webp";
  }

  return "png";
}

async function materializeImage(image: GeneratedImageSource) {
  if (image.kind === "base64") {
    return {
      buffer: Buffer.from(image.b64, "base64") as Buffer,
      mimeType: image.mimeType
    };
  }

  const response = await fetch(image.url);

  if (!response.ok) {
    throw new Error(`GENERATED_IMAGE_FETCH_FAILED_${response.status}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()) as Buffer,
    mimeType: response.headers.get("content-type") || "image/png"
  };
}

export async function persistGeneratedImage(
  image: GeneratedImageSource,
  key: string
): Promise<PersistedGeneratedImage> {
  const materialized = await materializeImage(image);
  let buffer = materialized.buffer;
  let mimeType = materialized.mimeType;

  if (isPostProcessableMimeType(mimeType)) {
    buffer = await postProcessAssetBuffer(
      materialized.buffer,
      "clue_object_sprite",
      mimeType
    );
    mimeType = getPostProcessOutputMimeType(
      materialized.mimeType,
      "clue_object_sprite"
    );
  }

  const extension = extensionFromMimeType(mimeType);
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${safeKey}-${crypto.randomUUID()}.${extension}`;
  const relativePath = path.posix.join("generated", "room-assets", fileName);
  const outputDir = path.join(process.cwd(), "public", "generated", "room-assets");
  const outputPath = path.join(outputDir, fileName);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, buffer);

  return {
    sourceType: image.kind,
    url: `/${relativePath}`,
    storagePath: relativePath,
    mimeType
  };
}

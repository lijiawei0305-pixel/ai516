import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getSupabaseServerConfig, supabaseStorage } from "@/lib/server/supabaseRest";

const BUCKET = "room-assets";
const FALLBACK_DIR = path.join(process.cwd(), "public", "generated", "room-assets");

export type UploadGeneratedAssetInput = {
  roomId: string;
  creatorId: string;
  objectId: string;
  assetId: string;
  buffer: Buffer;
  mimeType: string;
};

export type UploadedGeneratedAsset = {
  storagePath: string;
  publicUrl: string | null;
  mimeType: string;
  storageMode: "supabase" | "local";
};

function extensionFromMimeType(mimeType: string) {
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return "jpg";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  if (mimeType === "image/gif") {
    return "gif";
  }

  return "png";
}

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function buildStoragePath(input: UploadGeneratedAssetInput) {
  const extension = extensionFromMimeType(input.mimeType);
  const fileName = `${safeSegment(input.objectId)}-${input.assetId}.${extension}`;

  return {
    storagePath: `${safeSegment(input.creatorId)}/${safeSegment(
      input.roomId
    )}/${fileName}`,
    fileName,
    extension
  };
}

async function uploadToSupabaseStorage(
  storagePath: string,
  buffer: Buffer,
  mimeType: string
) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return null;
  }

  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const response = await fetch(
    `${config.url}/storage/v1/object/${BUCKET}/${encodedPath}`,
    {
      method: "POST",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        "Content-Type": mimeType,
        "x-upsert": "true"
      },
      body: new Uint8Array(buffer)
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`SUPABASE_STORAGE_UPLOAD_FAILED:${response.status}:${body}`);
  }

  return config;
}

async function createSignedPreviewUrl(storagePath: string) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return null;
  }

  try {
    const signed = await supabaseStorage<{ signedURL: string }>(
      `object/sign/${BUCKET}`,
      {
        method: "POST",
        body: JSON.stringify({ expiresIn: 60 * 60, path: storagePath })
      },
      config
    );

    return signed.signedURL.startsWith("http")
      ? signed.signedURL
      : `${config.url}/storage/v1${signed.signedURL}`;
  } catch {
    return `${config.url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
  }
}

async function writeLocalFallbackFile(storagePath: string, buffer: Buffer) {
  const filePath = path.join(FALLBACK_DIR, ...storagePath.split("/"));
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return `/generated/room-assets/${storagePath}`;
}

export async function uploadGeneratedAsset(
  input: UploadGeneratedAssetInput
): Promise<UploadedGeneratedAsset> {
  const { storagePath } = buildStoragePath(input);
  const config = getSupabaseServerConfig();

  if (config) {
    await uploadToSupabaseStorage(storagePath, input.buffer, input.mimeType);
    const publicUrl = await createSignedPreviewUrl(storagePath);

    return {
      storagePath,
      publicUrl,
      mimeType: input.mimeType,
      storageMode: "supabase"
    };
  }

  const publicUrl = await writeLocalFallbackFile(storagePath, input.buffer);

  return {
    storagePath,
    publicUrl,
    mimeType: input.mimeType,
    storageMode: "local"
  };
}

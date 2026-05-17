import crypto from "node:crypto";

const KEY_ENV_NAMES = [
  "HEART_CABIN_LLM_SETTINGS_ENCRYPTION_KEY",
  "LLM_PROVIDER_ENCRYPTION_KEY"
];

const DEV_FALLBACK_KEY = "heart-cabin-dev-llm-key";

let warnedAboutDevFallback = false;

function getRawSecretKey() {
  for (const name of KEY_ENV_NAMES) {
    const value = process.env[name];
    if (value && value.trim()) {
      return value.trim();
    }
  }

  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (fallback && fallback.trim()) {
    return fallback.trim();
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("LLM_ENCRYPTION_KEY_REQUIRED");
  }

  if (!warnedAboutDevFallback) {
    warnedAboutDevFallback = true;
    console.warn(
      "[llmKeyCrypto] 未检测到 HEART_CABIN_LLM_SETTINGS_ENCRYPTION_KEY / LLM_PROVIDER_ENCRYPTION_KEY / SUPABASE_SERVICE_ROLE_KEY，开发模式下使用内置兜底密钥。生产环境必须配置上述任一变量，否则启动会抛出 LLM_ENCRYPTION_KEY_REQUIRED。"
    );
  }

  return DEV_FALLBACK_KEY;
}

function deriveKeyMaterial() {
  return crypto
    .createHash("sha256")
    .update(getRawSecretKey())
    .digest();
}

export function encryptApiKey(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", deriveKeyMaterial(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url")
  ].join(":");
}

export function decryptApiKey(value: string) {
  const [version, ivPart, tagPart, dataPart] = value.split(":");

  if (version !== "v1" || !ivPart || !tagPart || !dataPart) {
    throw new Error("LLM_KEY_DECRYPTION_UNSUPPORTED_FORMAT");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    deriveKeyMaterial(),
    Buffer.from(ivPart, "base64url")
  );

  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, "base64url")),
    decipher.final()
  ]).toString("utf8");
}

export function maskApiKey(value: string) {
  const normalized = value.trim();

  if (normalized.length <= 8) {
    return "********";
  }

  return `${normalized.slice(0, 3)}********${normalized.slice(-4)}`;
}

export function normalizeServiceBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");

  if (!trimmed) {
    throw new Error("LLM_BASE_URL_EMPTY");
  }

  const parsed = new URL(trimmed);

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("LLM_BASE_URL_INVALID_PROTOCOL");
  }

  if (parsed.username || parsed.password) {
    throw new Error("LLM_BASE_URL_CREDENTIALS_NOT_ALLOWED");
  }

  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
}

export function normalizeEndpointPath(path: string) {
  const trimmed = path.trim();

  if (!trimmed) {
    return "/";
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return normalized;
}

export function joinOpenAiCompatibleUrl(
  baseUrl: string,
  endpointPath: string
) {
  const base = baseUrl.replace(/\/+$/, "");
  const path = normalizeEndpointPath(endpointPath).replace(/^\/v1(?=\/)/, "");

  return `${base}${path}`;
}


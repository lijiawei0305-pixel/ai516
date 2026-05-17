import type { AiProviderConfig } from "@/lib/ai/adminConfig";
import type { StructuredLlmClient } from "@/lib/ai/schemas";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ImageGenerationRequest = {
  prompt: string;
  size?: string;
  background?: "transparent" | "opaque" | "auto";
};

export type GeneratedImageSource =
  | {
      kind: "url";
      url: string;
    }
  | {
      kind: "base64";
      b64: string;
      mimeType: string;
    };

function buildUrl(config: AiProviderConfig, path: string) {
  return `${config.baseUrl}${path}`;
}

function extractJsonFromText(text: string): unknown {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

    if (fenced?.[1]) {
      return JSON.parse(fenced[1]);
    }

    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }

    throw new Error("OPENAI_COMPATIBLE_JSON_MISSING");
  }
}

function extractChatText(payload: unknown): string {
  const record = payload as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };
  const content = record.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof part.text === "string"
        ) {
          return part.text;
        }

        return "";
      })
      .join("");

    if (text.trim()) {
      return text;
    }
  }

  throw new Error("OPENAI_COMPATIBLE_CHAT_TEXT_MISSING");
}

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;

async function postJson<T>(
  config: AiProviderConfig,
  path: string,
  payload: unknown,
  timeoutMs = 180_000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(buildUrl(config, path), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        const err = new Error(
          `OPENAI_COMPATIBLE_${path}_${response.status}:${body}`
        );

        if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES) {
          lastError = err;
          console.warn(
            `[postJson] ${path} attempt ${attempt + 1} got ${response.status}, retrying...`
          );
          continue;
        }

        throw err;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        const err = new Error(`OPENAI_COMPATIBLE_${path}_TIMEOUT`);
        if (attempt < MAX_RETRIES) {
          lastError = err;
          console.warn(
            `[postJson] ${path} attempt ${attempt + 1} timed out, retrying...`
          );
          continue;
        }
        throw err;
      }

      if (
        error instanceof Error &&
        error.message.startsWith("OPENAI_COMPATIBLE_")
      ) {
        throw error;
      }

      if (attempt < MAX_RETRIES) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `[postJson] ${path} attempt ${attempt + 1} network error, retrying...`
        );
        continue;
      }

      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error(`OPENAI_COMPATIBLE_${path}_RETRY_EXHAUSTED`);
}

export function createOpenAiCompatibleStructuredClient(
  config: AiProviderConfig
): StructuredLlmClient {
  return async (request) => {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: [
          request.system,
          "你必须只输出一个 JSON 对象，不要输出 Markdown、解释或额外文本。"
        ].join("\n")
      },
      {
        role: "user",
        content: [
          request.user,
          "JSON Schema:",
          JSON.stringify(request.jsonSchema)
        ].join("\n\n")
      }
    ];
    const payload = await postJson<unknown>(config, "/chat/completions", {
      model: config.chatModel,
      messages,
      temperature: request.temperature ?? 0.2,
      response_format: {
        type: "json_object"
      }
    });

    return extractJsonFromText(extractChatText(payload));
  };
}

function normalizeBase64(value: string) {
  const dataUrl = value.match(/^data:([^;]+);base64,(.+)$/);

  if (dataUrl) {
    return {
      b64: dataUrl[2],
      mimeType: dataUrl[1]
    };
  }

  return {
    b64: value,
    mimeType: "image/png"
  };
}

function extractImageFromMultimodalContent(payload: unknown): GeneratedImageSource | null {
  const record = payload as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };
  const content = record.choices?.[0]?.message?.content;

  if (!Array.isArray(content)) {
    return null;
  }

  for (const part of content) {
    if (!part || typeof part !== "object") continue;

    if (part.type === "image_url" && part.image_url) {
      const imageUrl = part.image_url as { url?: string };
      if (typeof imageUrl.url === "string" && imageUrl.url.trim()) {
        const dataMatch = imageUrl.url.match(/^data:([^;]+);base64,(.+)$/);
        if (dataMatch) {
          return { kind: "base64", b64: dataMatch[2], mimeType: dataMatch[1] };
        }
        return { kind: "url", url: imageUrl.url };
      }
    }

    if (part.type === "image" && typeof part.data === "string") {
      return {
        kind: "base64",
        b64: part.data,
        mimeType: (typeof part.mime_type === "string" ? part.mime_type : "image/png")
      };
    }

    if (part.type === "image" && typeof part.url === "string" && part.url.trim()) {
      return { kind: "url", url: part.url };
    }

    if (part.type === "image_url" && typeof part.url === "string" && part.url.trim()) {
      const dataMatch = part.url.match(/^data:([^;]+);base64,(.+)$/);
      if (dataMatch) {
        return { kind: "base64", b64: dataMatch[2], mimeType: dataMatch[1] };
      }
      return { kind: "url", url: part.url };
    }
  }

  return null;
}

function extractGeneratedImageSource(payload: unknown): GeneratedImageSource {
  const record = payload as {
    data?: Array<{
      url?: unknown;
      b64_json?: unknown;
      base64?: unknown;
      image?: unknown;
    }>;
  };
  const first = record.data?.[0];

  if (typeof first?.url === "string" && first.url.trim()) {
    return {
      kind: "url",
      url: first.url
    };
  }

  const rawBase64 =
    typeof first?.b64_json === "string"
      ? first.b64_json
      : typeof first?.base64 === "string"
        ? first.base64
        : typeof first?.image === "string"
          ? first.image
          : null;

  if (rawBase64) {
    return {
      kind: "base64",
      ...normalizeBase64(rawBase64)
    };
  }

  const multimodal = extractImageFromMultimodalContent(payload);
  if (multimodal) {
    return multimodal;
  }

  const text = (() => {
    try {
      return extractChatText(payload);
    } catch {
      return null;
    }
  })();

  if (text) {
    if (text.startsWith("data:image/") || (text.length > 1000 && /^[A-Za-z0-9+/=\s]+$/.test(text.trim()))) {
      return { kind: "base64", ...normalizeBase64(text.trim()) };
    }

    try {
      const parsed = extractJsonFromText(text) as {
        url?: unknown;
        b64_json?: unknown;
        base64?: unknown;
        image?: unknown;
      };

      if (typeof parsed.url === "string" && parsed.url.trim()) {
        return {
          kind: "url",
          url: parsed.url
        };
      }

      const parsedBase64 =
        typeof parsed.b64_json === "string"
          ? parsed.b64_json
          : typeof parsed.base64 === "string"
            ? parsed.base64
            : typeof parsed.image === "string"
              ? parsed.image
              : null;

      if (parsedBase64) {
        return {
          kind: "base64",
          ...normalizeBase64(parsedBase64)
        };
      }
    } catch {
      // not JSON, already handled above
    }
  }

  throw new Error("OPENAI_COMPATIBLE_IMAGE_MISSING");
}

export async function generateOpenAiCompatibleImage(
  config: AiProviderConfig,
  request: ImageGenerationRequest
): Promise<GeneratedImageSource> {
  const imageConfig: AiProviderConfig = config.imageBaseUrl
    ? {
        ...config,
        baseUrl: config.imageBaseUrl,
        apiKey: config.imageApiKey ?? config.apiKey
      }
    : config;

  if (config.imageGenerationMode === "images_generations") {
    const payload = await postJson<unknown>(imageConfig, "/images/generations", {
      model: config.imageModel,
      prompt: request.prompt,
      n: 1,
      size: request.size ?? "1024x1024",
      ...(request.background ? { background: request.background } : {})
    });

    return extractGeneratedImageSource(payload);
  }

  const payload = await postJson<unknown>(imageConfig, "/chat/completions", {
    model: config.imageModel,
    messages: [
      {
        role: "user",
        content: request.prompt
      }
    ],
    temperature: 0.2
  });

  return extractGeneratedImageSource(payload);
}

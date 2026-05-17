import type { AiProviderConfig } from "@/lib/ai/adminConfig";
import type { StructuredLlmClient } from "@/lib/ai/schemas";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ImageGenerationRequest = {
  prompt: string;
  size?: string;
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

async function postJson<T>(
  config: AiProviderConfig,
  path: string,
  payload: unknown
): Promise<T> {
  const response = await fetch(buildUrl(config, path), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OPENAI_COMPATIBLE_${path}_${response.status}:${body}`);
  }

  return (await response.json()) as T;
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

  const text = (() => {
    try {
      return extractChatText(payload);
    } catch {
      return null;
    }
  })();

  if (text) {
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
      size: request.size ?? "1024x1024"
    });

    return extractGeneratedImageSource(payload);
  }

  const payload = await postJson<unknown>(imageConfig, "/chat/completions", {
    model: config.imageModel,
    messages: [
      {
        role: "system",
        content:
          "你是图像生成模型。请根据用户提示生成一张图，并返回 JSON：{\"url\":\"...\"} 或 {\"b64_json\":\"...\"}。"
      },
      {
        role: "user",
        content: request.prompt
      }
    ],
    temperature: 0.2,
    response_format: {
      type: "json_object"
    }
  });

  return extractGeneratedImageSource(payload);
}

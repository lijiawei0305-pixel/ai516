import { z } from "zod";

export const imageGenerationModeSchema = z.enum([
  "images_generations",
  "chat_completions"
]);

export type ImageGenerationMode = z.infer<typeof imageGenerationModeSchema>;

export type AiProviderConfig = {
  baseUrl: string;
  apiKey: string;
  chatModel: string;
  imageModel: string;
  imageGenerationMode: ImageGenerationMode;
  imageBaseUrl?: string;
  imageApiKey?: string;
};

const envConfigSchema = z.object({
  baseUrl: z.string().trim().url(),
  apiKey: z.string().trim().min(1),
  chatModel: z.string().trim().min(1),
  imageModel: z.string().trim().min(1),
  imageGenerationMode: imageGenerationModeSchema
});

function readEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function normalizeOpenAiBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/+$/, "");

  if (trimmed.endsWith("/v1")) {
    return trimmed;
  }

  if (/\/v\d+$/.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}/v1`;
}

export function getAiProviderConfigFromEnv(): AiProviderConfig | null {
  const baseUrl =
    readEnv("HEART_CABIN_OPENAI_BASE_URL") ??
    readEnv("OPENAI_BASE_URL") ??
    "https://api.openai.com";
  const apiKey =
    readEnv("HEART_CABIN_OPENAI_API_KEY") ?? readEnv("OPENAI_API_KEY");
  const chatModel =
    readEnv("HEART_CABIN_OPENAI_CHAT_MODEL") ??
    readEnv("OPENAI_CHAT_MODEL") ??
    readEnv("OPENAI_MODEL");
  const imageModel =
    readEnv("HEART_CABIN_OPENAI_IMAGE_MODEL") ??
    readEnv("OPENAI_IMAGE_MODEL") ??
    chatModel;
  const imageGenerationMode =
    readEnv("HEART_CABIN_IMAGE_GENERATION_MODE") ??
    readEnv("OPENAI_IMAGE_GENERATION_MODE") ??
    "images_generations";

  const parsed = envConfigSchema.safeParse({
    baseUrl,
    apiKey,
    chatModel,
    imageModel,
    imageGenerationMode
  });

  if (!parsed.success) {
    return null;
  }

  const imageBaseUrlRaw =
    readEnv("HEART_CABIN_IMAGE_BASE_URL") ?? readEnv("OPENAI_IMAGE_BASE_URL");
  const imageApiKeyRaw =
    readEnv("HEART_CABIN_IMAGE_API_KEY") ?? readEnv("OPENAI_IMAGE_API_KEY");

  return {
    ...parsed.data,
    baseUrl: normalizeOpenAiBaseUrl(parsed.data.baseUrl),
    imageBaseUrl: imageBaseUrlRaw
      ? normalizeOpenAiBaseUrl(imageBaseUrlRaw)
      : undefined,
    imageApiKey: imageApiKeyRaw ?? undefined
  };
}

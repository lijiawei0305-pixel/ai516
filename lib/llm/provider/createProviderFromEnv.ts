import { createOpenAiCompatibleProvider } from "@/lib/llm/provider/openaiCompatibleProvider";
import type {
  LlmProvider,
  OpenAiCompatibleProviderConfig
} from "@/lib/llm/provider/types";
import { normalizeOpenAiBaseUrl } from "@/lib/ai/adminConfig";

function readEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function mapImageMode(
  envMode: string | undefined
): "images_api" | "chat_completions_image_model" {
  if (envMode === "chat_completions") {
    return "chat_completions_image_model";
  }
  return "images_api";
}

export function createProviderFromEnv(): LlmProvider | null {
  const baseUrl =
    readEnv("HEART_CABIN_IMAGE_BASE_URL") ??
    readEnv("HEART_CABIN_OPENAI_BASE_URL") ??
    readEnv("OPENAI_BASE_URL");

  const apiKey =
    readEnv("HEART_CABIN_IMAGE_API_KEY") ??
    readEnv("HEART_CABIN_OPENAI_API_KEY") ??
    readEnv("OPENAI_API_KEY");

  const imageModel =
    readEnv("HEART_CABIN_OPENAI_IMAGE_MODEL") ??
    readEnv("OPENAI_IMAGE_MODEL");

  const chatModel =
    readEnv("HEART_CABIN_OPENAI_CHAT_MODEL") ??
    readEnv("OPENAI_MODEL") ??
    "gpt-4o-mini";

  if (!baseUrl || !apiKey || !imageModel) {
    return null;
  }

  const imageGenerationMode = readEnv("HEART_CABIN_IMAGE_GENERATION_MODE");

  const config: OpenAiCompatibleProviderConfig = {
    providerName: "env",
    baseUrl: normalizeOpenAiBaseUrl(baseUrl),
    apiKey,
    chatModel,
    imageModel,
    chatEndpointPath: "/v1/chat/completions",
    imageEndpointPath: "/v1/images/generations",
    imageMode: mapImageMode(imageGenerationMode),
    imageResponseFormat: "auto",
    defaultImageSize: "1024x1024",
    timeoutMs: 180_000,
    maxConcurrentImageJobs: 3,
    enableSemanticAnalysis: true,
    enableSchemaValidation: true,
    globalVisualStylePrompt: "",
    objectStylePrompt: "",
    negativePrompt: null,
    isActive: true
  };

  return createOpenAiCompatibleProvider(config);
}

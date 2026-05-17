import crypto from "node:crypto";

import { apiError, jsonResponse, parseJsonBody } from "@/lib/api/http";
import { getAiProviderConfigFromEnv } from "@/lib/ai/adminConfig";
import { generateRoomWithImages } from "@/lib/ai/generateRoomPipeline";
import { createOpenAiCompatibleStructuredClient } from "@/lib/ai/openAiCompatible";
import { generateRoomService } from "@/lib/api/mock-services";
import {
  generateRoomRequestSchema,
  generateRoomResponseSchema
} from "@/lib/schemas/api";
import type { GenerateRoomResponse } from "@/lib/contracts/api";
import type { Json } from "@/lib/database.types";
import {
  getRequestUserId,
  getSupabaseServerConfig,
  supabaseRest
} from "@/lib/server/supabaseRest";

async function persistGeneratedRoom(
  request: Request,
  input: {
    roomId: string;
    sentence: string;
    visibility: "private" | "unlisted" | "public";
  },
  generated: Awaited<ReturnType<typeof generateRoomWithImages>>
): Promise<{ roomId: string; createdAt: string }> {
  const createdAt = new Date().toISOString();
  const supabaseConfig = getSupabaseServerConfig();
  const creatorId = getRequestUserId(request);

  if (!supabaseConfig) {
    return {
      roomId: input.roomId,
      createdAt
    };
  }

  const rows = await supabaseRest<
    Array<{
      id: string;
      created_at: string;
    }>
  >(
    "rooms",
    {
      method: "POST",
      body: JSON.stringify({
        id: input.roomId,
        creator_id: creatorId ?? null,
        original_sentence: input.sentence,
        hidden_meaning: generated.room.hiddenMeaning,
        room_title: generated.room.roomTitle,
        public_title: generated.room.publicTitle,
        emotion_type: generated.room.emotionType,
        visual_theme: generated.room.visualTheme,
        room_json: generated.roomJson as Json,
        visibility: input.visibility,
        status: "active"
      })
    },
    supabaseConfig
  );
  const row = rows[0];

  if (!row) {
    throw new Error("ROOM_INSERT_EMPTY_RESPONSE");
  }

  return {
    roomId: row.id,
    createdAt: new Date(row.created_at).toISOString()
  };
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, generateRoomRequestSchema);

  if ("response" in parsed) {
    return parsed.response;
  }

  const aiConfig = getAiProviderConfigFromEnv();
  const supabaseConfig = getSupabaseServerConfig();

  if (!aiConfig || !supabaseConfig) {
    if (process.env.NODE_ENV === "production") {
      return apiError("service_unavailable", "AI 或数据库服务未配置", 503);
    }
    const mockResult = await generateRoomService(parsed.data);
    return jsonResponse(generateRoomResponseSchema, mockResult, 201);
  }

  try {
    const llmClient = createOpenAiCompatibleStructuredClient(aiConfig);
    const roomId = crypto.randomUUID();
    const generated = await generateRoomWithImages(
      {
        sentence: parsed.data.sentence,
        emotionTags:
          parsed.data.emotionTags.length > 0
            ? parsed.data.emotionTags
            : ["未命名情绪"],
        imageSafeDescription: null,
        creatorStylePreference: null
      },
      llmClient,
      aiConfig,
      roomId
    );
    const persisted = await persistGeneratedRoom(
      request,
      {
        roomId,
        sentence: parsed.data.sentence,
        visibility: parsed.data.visibility
      },
      generated
    );
    const response: GenerateRoomResponse = {
      roomId: persisted.roomId,
      roomTitle: generated.room.roomTitle,
      publicTitle: generated.room.publicTitle,
      createdAt: persisted.createdAt,
      redirectUrl: `/rooms/${persisted.roomId}/play`
    };

    return jsonResponse(generateRoomResponseSchema, response, 201);
  } catch (error) {
    return apiError(
      "room_generation_failed",
      "Room generation failed",
      502,
      error instanceof Error ? error.message : String(error)
    );
  }
}

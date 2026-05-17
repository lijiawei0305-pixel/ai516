import { apiError, jsonResponse, parseJsonBody } from "@/lib/api/http";
import {
  handlePetChat,
  type PetChatRepository
} from "@/lib/ai/petChat";
import type { StructuredLlmClient } from "@/lib/ai/schemas";
import { petChatRequestSchema, petChatResponseSchema } from "@/lib/schemas/api";
import type { Json } from "@/lib/database.types";

type RoomJsonObject = {
  id?: string;
  name?: string;
  title?: string;
  keyword?: string;
  clue?: string;
};

const demoObjects = [
  {
    id: "envelope",
    name: "未寄出的信",
    keyword: "没说出口",
    clue: "它知道地址，却一直没有出发。"
  },
  {
    id: "clock",
    name: "停住的钟",
    keyword: "等待",
    clue: "时间在某个名字附近慢下来。"
  },
  {
    id: "window",
    name: "月亮窗",
    keyword: "偷偷关注",
    clue: "窗边的光像是在等对面亮起。"
  }
];

const demoRepository: PetChatRepository = {
  async loadRoomContext(roomId) {
    return {
      roomId,
      creatorId: "demo_creator",
      publicTitle: "朋友的心事小屋",
      visualTheme: "paper_cabin",
      hiddenMeaning: "想念一个人但不敢先开口",
      pet: {
        type: "cat",
        name: "纸团",
        personality: "温柔、谨慎，只围绕线索提示"
      },
      objects: demoObjects
    };
  },
  async loadGuessAttemptContext(guessAttemptId) {
    return {
      id: guessAttemptId,
      roomId: "demo-room",
      playerId: null,
      anonymousId: "demo-anon",
      selectedObjectIds: []
    };
  },
  async savePetMessages() {},
  async loadMemoryMarkdown() {
    return "";
  },
  async saveMemoryMarkdown() {}
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

async function supabaseRest<T>(
  path: string,
  init: RequestInit,
  config: { url: string; serviceRoleKey: string }
): Promise<T> {
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`SUPABASE_REST_${response.status}`);
  }

  return (await response.json()) as T;
}

function asRecord(value: Json): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value
    : {};
}

function extractRoomObjects(roomJson: Json): RoomJsonObject[] {
  const record = asRecord(roomJson);
  const objects = record.objects;

  return Array.isArray(objects) ? (objects as RoomJsonObject[]) : [];
}

function extractPet(roomJson: Json) {
  const record = asRecord(roomJson);
  const pet = asRecord((record.pet ?? {}) as Json);
  const type: "cat" | "dog" = pet.type === "dog" ? "dog" : "cat";

  return {
    type,
    name: typeof pet.name === "string" ? pet.name : "纸团",
    personality:
      typeof pet.personality === "string"
        ? pet.personality
        : "温柔、谨慎，只围绕线索提示"
  };
}

function createSupabaseRepository(config: {
  url: string;
  serviceRoleKey: string;
}): PetChatRepository {
  return {
    async loadRoomContext(roomId) {
      const rooms = await supabaseRest<
        Array<{
          id: string;
          creator_id: string;
          public_title: string;
          visual_theme: string;
          hidden_meaning: string;
          room_json: Json;
        }>
      >(
        `rooms?id=eq.${encodeURIComponent(
          roomId
        )}&select=id,creator_id,public_title,visual_theme,hidden_meaning,room_json&limit=1`,
        { method: "GET" },
        config
      );
      const room = rooms[0];

      if (!room) {
        return null;
      }

      const roomObjects = extractRoomObjects(room.room_json);
      const objects = roomObjects.map((object) => ({
        id: object.id ?? object.title ?? "object",
        name: object.name ?? object.title ?? object.id ?? "线索物件",
        keyword: object.keyword ?? "",
        clue: object.clue ?? ""
      }));

      return {
        roomId: room.id,
        creatorId: room.creator_id,
        publicTitle: room.public_title,
        visualTheme: room.visual_theme,
        hiddenMeaning: room.hidden_meaning,
        pet: extractPet(room.room_json),
        objects
      };
    },
    async loadGuessAttemptContext(guessAttemptId) {
      const guesses = await supabaseRest<
        Array<{
          id: string;
          room_id: string;
          player_id: string | null;
          anonymous_id: string | null;
          selected_object_ids: string[];
        }>
      >(
        `guess_attempts?id=eq.${encodeURIComponent(
          guessAttemptId
        )}&select=id,room_id,player_id,anonymous_id,selected_object_ids&limit=1`,
        { method: "GET" },
        config
      );
      const guess = guesses[0];

      if (!guess) {
        return null;
      }

      return {
        id: guess.id,
        roomId: guess.room_id,
        playerId: guess.player_id,
        anonymousId: guess.anonymous_id,
        selectedObjectIds: guess.selected_object_ids
      };
    },
    async savePetMessages(args) {
      const rows = [
        {
          room_id: args.roomId,
          guess_attempt_id: args.guessAttemptId,
          user_id: args.userId,
          role: "user",
          content: args.userMessage,
          safe_summary: null,
          hint_level: args.hintLevel
        },
        {
          room_id: args.roomId,
          guess_attempt_id: args.guessAttemptId,
          user_id: args.userId,
          role: "assistant",
          content: args.assistantReply,
          safe_summary: args.memoryNote,
          hint_level: args.hintLevel
        }
      ];

      await supabaseRest("pet_conversations", {
        method: "POST",
        body: JSON.stringify(rows)
      }, config);
    },
    async loadMemoryMarkdown(args) {
      const documents = await supabaseRest<Array<{ markdown_content: string }>>(
        `memory_documents?owner_id=eq.${encodeURIComponent(
          args.ownerId
        )}&scope_type=eq.${args.scopeType}&scope_id=eq.${encodeURIComponent(
          args.scopeId
        )}&select=markdown_content&limit=1`,
        { method: "GET" },
        config
      );

      return documents[0]?.markdown_content ?? "";
    },
    async saveMemoryMarkdown(args) {
      const existing = await supabaseRest<Array<{ id: string }>>(
        `memory_documents?owner_id=eq.${encodeURIComponent(
          args.ownerId
        )}&scope_type=eq.${args.scopeType}&scope_id=eq.${encodeURIComponent(
          args.scopeId
        )}&select=id&limit=1`,
        { method: "GET" },
        config
      );
      const body = JSON.stringify({
        owner_id: args.ownerId,
        scope_type: args.scopeType,
        scope_id: args.scopeId,
        markdown_content: args.markdownContent,
        summary: args.summary
      });

      if (existing[0]) {
        await supabaseRest(
          `memory_documents?id=eq.${encodeURIComponent(existing[0].id)}`,
          {
            method: "PATCH",
            body
          },
          config
        );
        return;
      }

      await supabaseRest(
        "memory_documents",
        {
          method: "POST",
          body
        },
        config
      );
    }
  };
}

function createRepository() {
  const config = getSupabaseConfig();
  return config ? createSupabaseRepository(config) : demoRepository;
}

function extractChatCompletionText(response: unknown) {
  const record = response as {
    choices?: Array<{
      message?: { content?: string };
    }>;
  };

  const content = record.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : null;
}

function createOpenAiStructuredClient(): StructuredLlmClient | undefined {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return undefined;
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, "");

  return async (llmRequest) => {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: llmRequest.system },
          { role: "user", content: llmRequest.user }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: llmRequest.schemaName,
            schema: llmRequest.jsonSchema,
            strict: true
          }
        },
        temperature: llmRequest.temperature ?? 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OPENAI_CHAT_COMPLETIONS_${response.status}`);
    }

    const payload = await response.json();
    const text = extractChatCompletionText(payload);

    if (!text) {
      throw new Error("OPENAI_STRUCTURED_OUTPUT_MISSING");
    }

    return JSON.parse(text) as unknown;
  };
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, petChatRequestSchema);

  if ("response" in parsed) {
    return parsed.response;
  }

  try {
    const response = await handlePetChat(parsed.data, {
      repository: createRepository(),
      llmClient: createOpenAiStructuredClient()
    });

    return jsonResponse(petChatResponseSchema, response);
  } catch (error) {
    if (error instanceof Error && error.message === "ROOM_NOT_FOUND") {
      return apiError("not_found", "Room not found", 404);
    }

    if (error instanceof Error && error.message === "GUESS_ATTEMPT_NOT_FOUND") {
      return apiError("not_found", "Guess attempt not found", 404);
    }

    return apiError("pet_chat_failed", "Pet chat failed", 500);
  }
}

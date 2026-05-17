import { apiError, jsonResponse } from "@/lib/api/http";
import { DEFAULT_DIARY_ACCESS_THRESHOLD } from "@/lib/affinity/canRequestDiaryAccess";
import { getGuessResultService } from "@/lib/api/mock-services";
import {
  getGuessResultParamsSchema,
  getGuessResultResponseSchema
} from "@/lib/schemas/api";
import {
  getSupabaseServerConfig,
  supabaseRest
} from "@/lib/server/supabaseRest";

type RouteContext = {
  params: Promise<{
    guessId: string;
  }>;
};

type GuessRow = {
  id: string;
  room_id: string;
  score: number | null;
  affinity_score: number | null;
  hit_keywords: string[];
  missed_keywords: string[];
  title: string | null;
  comment: string | null;
  reveal_level: number;
};

type RoomRow = {
  id: string;
  original_sentence: string;
  room_json: { shareText?: string } | null;
};

function buildPartialSentence(original: string): string {
  const len = Math.ceil(original.length * 0.4);
  if (len >= original.length) return original;
  return original.slice(0, len) + "……";
}

export async function GET(_request: Request, context: RouteContext) {
  const params = getGuessResultParamsSchema.safeParse(await context.params);

  if (!params.success) {
    return apiError("validation_error", "Invalid guess id", 422, params.error.flatten());
  }

  const supabaseConfig = getSupabaseServerConfig();

  if (!supabaseConfig) {
    if (process.env.NODE_ENV === "production") {
      return apiError("service_unavailable", "数据库服务未配置", 503);
    }
    const mockResult = await getGuessResultService(params.data.guessId);
    return jsonResponse(getGuessResultResponseSchema, mockResult);
  }

  const guessId = params.data.guessId;

  const rows = await supabaseRest<GuessRow[]>(
    `guess_attempts?id=eq.${encodeURIComponent(guessId)}&select=id,room_id,score,affinity_score,hit_keywords,missed_keywords,title,comment,reveal_level&limit=1`,
    { method: "GET" },
    supabaseConfig
  );

  const guess = rows[0];

  if (!guess) {
    return apiError("not_found", "猜测记录不存在", 404);
  }

  const roomRows = await supabaseRest<RoomRow[]>(
    `rooms?id=eq.${encodeURIComponent(guess.room_id)}&select=id,original_sentence,room_json&limit=1`,
    { method: "GET" },
    supabaseConfig
  );

  const room = roomRows[0];
  const shareText = room?.room_json?.shareText ?? "我做了一间心事小屋，想邀请你来看看。";
  const partialOriginalSentence = room
    ? buildPartialSentence(room.original_sentence)
    : "";

  const affinityScore = guess.affinity_score ?? 0;
  const canRequestDiaryAccess = affinityScore >= DEFAULT_DIARY_ACCESS_THRESHOLD;

  const response = {
    score: guess.score ?? 0,
    affinityScore,
    title: guess.title ?? "心事解读",
    comment: guess.comment ?? "",
    hitKeywords: guess.hit_keywords ?? [],
    missedKeywords: guess.missed_keywords ?? [],
    partialOriginalSentence,
    shareText,
    canRequestDiaryAccess,
    diaryAccessThreshold: DEFAULT_DIARY_ACCESS_THRESHOLD
  };

  return jsonResponse(getGuessResultResponseSchema, response);
}

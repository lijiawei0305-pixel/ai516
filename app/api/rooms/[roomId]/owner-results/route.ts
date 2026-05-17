import { apiError, jsonResponse } from "@/lib/api/http";
import {
  getOwnerResultsParamsSchema,
  getOwnerResultsResponseSchema
} from "@/lib/schemas/api";
import {
  getRequestUserId,
  getSupabaseServerConfig,
  supabaseRest
} from "@/lib/server/supabaseRest";

type RouteContext = {
  params: Promise<{
    roomId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const params = getOwnerResultsParamsSchema.safeParse(await context.params);

  if (!params.success) {
    return apiError("validation_error", "Invalid room id", 422, params.error.flatten());
  }

  const { roomId } = params.data;
  const supabaseConfig = getSupabaseServerConfig();

  if (!supabaseConfig) {
    return apiError("service_unavailable", "数据库服务未配置", 503);
  }

  const currentUserId = getRequestUserId(request);

  if (!currentUserId) {
    return apiError("unauthorized", "Missing user context", 401);
  }

  const rooms = await supabaseRest<Array<{ creator_id: string }>>(
    `rooms?id=eq.${encodeURIComponent(
      roomId
    )}&select=creator_id&limit=1`,
    { method: "GET" },
    supabaseConfig
  );

  if (!rooms[0] || rooms[0].creator_id !== currentUserId) {
    return apiError("forbidden", "Only the room creator can view results", 403);
  }

  const rows = await supabaseRest<
    Array<{
      id: string;
      player_id: string;
      selected_object_ids: string[];
      selected_choice_index: number | null;
      free_text_guess: string | null;
      score: number;
      affinity_score: number;
      comment: string | null;
      created_at: string;
    }>
  >(
    `guess_attempts?room_id=eq.${encodeURIComponent(
      roomId
    )}&select=id,player_id,selected_object_ids,selected_choice_index,free_text_guess,score,affinity_score,comment,created_at&order=created_at.desc`,
    { method: "GET" },
    supabaseConfig
  );

  const accessRequests = await supabaseRest<
    Array<{
      id: string;
      requester_id: string;
      status: "pending" | "approved" | "rejected";
    }>
  >(
    `diary_access_requests?room_id=eq.${encodeURIComponent(
      roomId
    )}&select=id,requester_id,status`,
    { method: "GET" },
    supabaseConfig
  );

  const accessByPlayer = new Map(
    accessRequests.map((r) => [r.requester_id, { id: r.id, status: r.status }])
  );

  const guesses = rows.map((row) => ({
    guessId: row.id,
    player: {
      userId: row.player_id.startsWith("anon_") ? null : row.player_id,
      anonymousId: row.player_id.startsWith("anon_") ? row.player_id : null,
      displayName: row.player_id.startsWith("anon_")
        ? "匿名玩家"
        : `玩家 ${row.player_id.slice(0, 6)}`,
      avatarUrl: null
    },
    selectedObjectIds: row.selected_object_ids ?? [],
    selectedChoiceIndex: row.selected_choice_index,
    freeTextGuess: row.free_text_guess,
    score: row.score,
    affinityScore: row.affinity_score,
    comment: row.comment ?? "",
    diaryAccessRequest: accessByPlayer.get(row.player_id) ?? null,
    createdAt: row.created_at
  }));

  return jsonResponse(getOwnerResultsResponseSchema, { guesses });
}

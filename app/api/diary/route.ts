import { apiError, jsonResponse } from "@/lib/api/http";
import { markdownPreview } from "@/lib/diary/repository";
import {
  getRequestUserId,
  getSupabaseServerConfig,
  supabaseRest
} from "@/lib/server/supabaseRest";
import { getDiaryResponseSchema } from "@/lib/schemas/api";

export async function GET(request: Request) {
  const currentUserId = getRequestUserId(request);

  if (!currentUserId) {
    return apiError("unauthorized", "Missing user context", 401);
  }

  const config = getSupabaseServerConfig();

  if (!config) {
    if (process.env.NODE_ENV === "production") {
      return apiError("service_unavailable", "数据库服务未配置", 503);
    }
    return jsonResponse(getDiaryResponseSchema, { entries: [] });
  }

  const owned = await supabaseRest<
    Array<{
      id: string;
      entry_type: "created_room" | "guessed_room" | "mutual_result" | "pet_memory" | "manual_note";
      title: string;
      markdown_content: string;
      visibility: "private" | "shared_by_request" | "shared";
      room_id: string | null;
      guess_attempt_id: string | null;
      created_at: string;
      updated_at: string;
    }>
  >(
    `diary_entries?owner_id=eq.${encodeURIComponent(
      currentUserId
    )}&select=id,entry_type,title,markdown_content,visibility,room_id,guess_attempt_id,created_at,updated_at&order=created_at.desc`,
    { method: "GET" },
    config
  );

  const entries = owned.map((entry) => ({
    id: entry.id,
    entryType: entry.entry_type,
    title: entry.title,
    markdownPreview: markdownPreview(entry.markdown_content),
    visibility: entry.visibility,
    roomId: entry.room_id,
    guessAttemptId: entry.guess_attempt_id,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at
  }));

  return jsonResponse(getDiaryResponseSchema, { entries });
}

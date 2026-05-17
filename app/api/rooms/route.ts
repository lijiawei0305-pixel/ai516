import { apiError, jsonResponse } from "@/lib/api/http";
import {
  getRequestUserId,
  getSupabaseServerConfig,
  supabaseRest
} from "@/lib/server/supabaseRest";
import { listRoomsResponseSchema } from "@/lib/schemas/api";

export async function GET(request: Request) {
  const currentUserId = getRequestUserId(request);

  if (!currentUserId) {
    return apiError("unauthorized", "Missing user context", 401);
  }

  const config = getSupabaseServerConfig();

  if (!config) {
    return jsonResponse(listRoomsResponseSchema, { rooms: [] });
  }

  const rows = await supabaseRest<
    Array<{
      id: string;
      room_title: string;
      public_title: string;
      visibility: "private" | "unlisted" | "public";
      status: "draft" | "active" | "archived" | "deleted";
      created_at: string;
    }>
  >(
    `rooms?creator_id=eq.${encodeURIComponent(
      currentUserId
    )}&status=neq.deleted&select=id,room_title,public_title,visibility,status,created_at&order=created_at.desc`,
    { method: "GET" },
    config
  );

  const rooms = rows.map((row) => ({
    id: row.id,
    roomTitle: row.room_title,
    publicTitle: row.public_title,
    visibility: row.visibility,
    status: row.status,
    createdAt: row.created_at
  }));

  return jsonResponse(listRoomsResponseSchema, { rooms });
}

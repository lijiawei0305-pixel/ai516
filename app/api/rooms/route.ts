import { apiError, jsonResponse } from "@/lib/api/http";
import { listPublicRoomsResponseSchema } from "@/lib/schemas/api";
import {
  getSupabaseServerConfig,
  supabaseRest
} from "@/lib/server/supabaseRest";

export async function GET() {
  const config = getSupabaseServerConfig();

  if (!config) {
    return apiError("service_unavailable", "数据库服务未配置", 503);
  }

  const rows = await supabaseRest<
    Array<{
      id: string;
      public_title: string;
      visual_theme: string;
      created_at: string;
    }>
  >(
    "rooms?visibility=eq.public&status=eq.active&select=id,public_title,visual_theme,created_at&order=created_at.desc&limit=50",
    { method: "GET" },
    config
  );

  const rooms = rows.map((row) => ({
    id: row.id,
    publicTitle: row.public_title,
    visualTheme: row.visual_theme,
    createdAt: row.created_at
  }));

  return jsonResponse(listPublicRoomsResponseSchema, { rooms });
}

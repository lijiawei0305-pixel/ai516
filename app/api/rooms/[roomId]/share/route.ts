import crypto from "node:crypto";

import { apiError, jsonResponse, parseJsonBody } from "@/lib/api/http";
import {
  getRequestUserId,
  getSupabaseServerConfig,
  supabaseRest
} from "@/lib/server/supabaseRest";
import {
  createShareRequestSchema,
  createShareResponseSchema,
  listSharesResponseSchema
} from "@/lib/schemas/api";

type RouteContext = {
  params: Promise<{
    roomId: string;
  }>;
};

function generateShareToken() {
  return crypto.randomBytes(18).toString("base64url");
}

function buildShareUrl(roomId: string, shareToken: string) {
  return `/rooms/${roomId}/play?share=${shareToken}`;
}

export async function GET(_request: Request, context: RouteContext) {
  const { roomId } = await context.params;
  const config = getSupabaseServerConfig();

  if (!config) {
    if (process.env.NODE_ENV === "production") {
      return apiError("service_unavailable", "数据库服务未配置", 503);
    }
    return jsonResponse(listSharesResponseSchema, { shares: [] });
  }

  const rows = await supabaseRest<
    Array<{
      id: string;
      share_token: string;
      target_user_id: string | null;
      created_at: string;
      expires_at: string | null;
    }>
  >(
    `room_shares?room_id=eq.${encodeURIComponent(
      roomId
    )}&select=id,share_token,target_user_id,created_at,expires_at&order=created_at.desc`,
    { method: "GET" },
    config
  );

  const shares = rows.map((row) => ({
    id: row.id,
    shareToken: row.share_token,
    shareUrl: buildShareUrl(roomId, row.share_token),
    targetUserId: row.target_user_id,
    createdAt: row.created_at,
    expiresAt: row.expires_at
  }));

  return jsonResponse(listSharesResponseSchema, { shares });
}

export async function POST(request: Request, context: RouteContext) {
  const { roomId } = await context.params;
  const parsed = await parseJsonBody(request, createShareRequestSchema);

  if ("response" in parsed) {
    return parsed.response;
  }

  const currentUserId = getRequestUserId(request);

  if (!currentUserId) {
    return apiError("unauthorized", "Missing user context", 401);
  }

  const config = getSupabaseServerConfig();

  if (!config) {
    if (process.env.NODE_ENV === "production") {
      return apiError("service_unavailable", "数据库服务未配置", 503);
    }
    const token = generateShareToken();

    return jsonResponse(
      createShareResponseSchema,
      {
        shareId: crypto.randomUUID(),
        shareToken: token,
        shareUrl: buildShareUrl(roomId, token),
        expiresAt: null
      },
      201
    );
  }

  const rooms = await supabaseRest<Array<{ id: string; creator_id: string }>>(
    `rooms?id=eq.${encodeURIComponent(
      roomId
    )}&select=id,creator_id&limit=1`,
    { method: "GET" },
    config
  );
  const room = rooms[0];

  if (!room) {
    return apiError("not_found", "Room not found", 404);
  }

  if (room.creator_id !== currentUserId) {
    return apiError("forbidden", "Only the room creator can create share links", 403);
  }

  const shareToken = generateShareToken();
  const expiresAt = parsed.data.expiresInHours
    ? new Date(Date.now() + parsed.data.expiresInHours * 60 * 60 * 1000).toISOString()
    : null;

  const rows = await supabaseRest<
    Array<{ id: string; share_token: string; created_at: string; expires_at: string | null }>
  >(
    "room_shares",
    {
      method: "POST",
      body: JSON.stringify({
        room_id: roomId,
        creator_id: currentUserId,
        share_token: shareToken,
        target_user_id: parsed.data.targetUserId ?? null,
        expires_at: expiresAt
      })
    },
    config
  );
  const row = rows[0];

  return jsonResponse(
    createShareResponseSchema,
    {
      shareId: row.id,
      shareToken: row.share_token,
      shareUrl: buildShareUrl(roomId, row.share_token),
      expiresAt: row.expires_at
    },
    201
  );
}

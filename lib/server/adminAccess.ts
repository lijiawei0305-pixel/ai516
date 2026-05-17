import crypto from "node:crypto";

import { apiError } from "@/lib/api/http";

function parseAllowList(value: string | undefined) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function timingSafeStringEqual(a: string, b: string) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

let warnedAboutOpenAdmin = false;

export function assertAdminAccess(request: Request) {
  const allowList = parseAllowList(process.env.HEART_CABIN_ADMIN_USER_IDS);
  const adminToken = process.env.HEART_CABIN_ADMIN_API_TOKEN?.trim();
  const userId = request.headers.get("x-user-id");
  const token = request.headers.get("x-admin-token");

  if (allowList.size === 0 && !adminToken) {
    if (process.env.NODE_ENV === "production") {
      return apiError(
        "forbidden",
        "Admin access is not configured on this server",
        403
      );
    }

    if (!warnedAboutOpenAdmin) {
      warnedAboutOpenAdmin = true;
      console.warn(
        "[adminAccess] HEART_CABIN_ADMIN_USER_IDS 与 HEART_CABIN_ADMIN_API_TOKEN 均未配置；当前为非生产环境，所有 /api/admin/* 请求会被放行。生产环境必须至少配置其中一项，否则后台路由将统一返回 403。"
      );
    }

    return null;
  }

  if (adminToken && token && timingSafeStringEqual(token, adminToken)) {
    return null;
  }

  if (userId && allowList.has(userId)) {
    return null;
  }

  return apiError("forbidden", "Admin access is required", 403);
}


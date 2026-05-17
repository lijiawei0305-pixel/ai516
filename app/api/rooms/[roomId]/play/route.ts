import { apiError, jsonResponse } from "@/lib/api/http";
import type { GetRoomPlayResponse } from "@/lib/contracts/api";
import type { Json } from "@/lib/database.types";
import { getRoomPlayService } from "@/lib/api/mock-services";
import { buildPlayApiResponse } from "@/lib/room/buildPublicRoomData";
import type { RoomJson } from "@/lib/room/buildRoomJson";
import {
  getRoomPlayParamsSchema,
  getRoomPlayResponseSchema
} from "@/lib/schemas/api";
import {
  asRecord,
  getSupabaseServerConfig,
  supabaseRest
} from "@/lib/server/supabaseRest";

type RouteContext = {
  params: Promise<{
    roomId: string;
  }>;
};

type StoredRoomObject = {
  id?: unknown;
  name?: unknown;
  title?: unknown;
  visualDescription?: unknown;
  description?: unknown;
  clue?: unknown;
  imageUrl?: unknown;
  assetUrl?: unknown;
  keyword?: unknown;
  anchor?: unknown;
  scale?: unknown;
  shadow?: unknown;
  position?: unknown;
  render?: unknown;
  interactionType?: unknown;
};

type PublicAnchor = NonNullable<
  NonNullable<GetRoomPlayResponse["objects"][number]["anchor"]>
>;

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

function isAnchor(value: unknown): value is PublicAnchor {
  if (value === "bottom-center" || value === "center" || value === "top-left") {
    return true;
  }

  if (typeof value !== "object" || !value) {
    return false;
  }

  const anchor = asRecord(value as Json);

  return typeof anchor.x === "number" && typeof anchor.y === "number";
}

function readRoomJsonObjects(roomJson: Json): GetRoomPlayResponse["objects"] {
  const record = asRecord(roomJson);
  const objects = Array.isArray(record.objects) ? record.objects : [];

  return objects.map((item, index) => {
    const object = item as StoredRoomObject;
    const imageUrl =
      typeof object.imageUrl === "string" && object.imageUrl.trim().length > 0
        ? object.imageUrl
        : asRecord((object.render ?? {}) as Json).assetUrl
        ? String(asRecord((object.render ?? {}) as Json).assetUrl)
        : null;

    return {
      id: asString(object.id, `object_${index + 1}`),
      name: asString(object.name ?? object.title, `线索 ${index + 1}`),
      clue: asString(
        object.clue ?? object.visualDescription ?? object.description,
        "这件物品还在等你靠近。"
      ),
      keyword: asString(object.keyword, ""),
      title: asString(object.name ?? object.title, `线索 ${index + 1}`),
      description: asString(
        object.clue ?? object.visualDescription ?? object.description,
        "这件物品还在等你靠近。"
      ),
      discovered: false,
      ...(typeof object.assetUrl === "string" && object.assetUrl.trim().length > 0
        ? { assetUrl: object.assetUrl }
        : imageUrl
        ? { assetUrl: imageUrl }
        : {}),
      ...(typeof object.position === "object" && object.position
        ? { position: object.position as GetRoomPlayResponse["objects"][number]["position"] }
        : {}),
      ...(isAnchor(object.anchor)
        ? { anchor: object.anchor }
        : {}),
      ...(typeof object.scale === "number" ? { scale: object.scale } : {}),
      ...(typeof object.shadow === "object" && object.shadow
        ? { shadow: object.shadow as GetRoomPlayResponse["objects"][number]["shadow"] }
        : {}),
      ...(typeof object.render === "object" && object.render
        ? { render: object.render as GetRoomPlayResponse["objects"][number]["render"] }
        : {}),
      ...(object.interactionType === "tap" ||
      object.interactionType === "tap_note" ||
      object.interactionType === "tap_reveal"
        ? { interactionType: object.interactionType }
        : {}),
      ...(imageUrl ? { imageUrl } : {})
    };
  });
}

function readChoices(roomJson: Json): GetRoomPlayResponse["choices"] {
  const record = asRecord(roomJson);
  const choices = Array.isArray(record.choices) ? record.choices : [];

  return choices.map((item, index) => {
    const choice = asRecord(item as Json);

    return {
      index:
        typeof choice.index === "number" && Number.isInteger(choice.index)
          ? choice.index
          : index,
      label: asString(choice.label, `选项 ${index + 1}`)
    };
  });
}

async function getPersistedRoomPlay(
  roomId: string
): Promise<GetRoomPlayResponse | null> {
  const config = getSupabaseServerConfig();

  if (!config) {
    return getRoomPlayService(roomId);
  }

  const rows = await supabaseRest<
    Array<{
      id: string;
      public_title: string;
      visual_theme: string;
      room_json: Json;
    }>
  >(
    `rooms?id=eq.${encodeURIComponent(
      roomId
    )}&status=eq.active&visibility=in.(unlisted,public)&select=id,public_title,visual_theme,room_json&limit=1`,
    {
      method: "GET"
    },
    config
  );
  const room = rows[0];

  if (!room) {
    return null;
  }

  const roomJson = asRecord(room.room_json);
  const pet = asRecord((roomJson.pet ?? {}) as Json);

  if (roomJson.schemaVersion === 1 && roomJson.renderTarget === "2.5d_miniature_cabin") {
    return buildPlayApiResponse(roomJson as RoomJson);
  }

  return {
    roomId: room.id,
    publicTitle: room.public_title,
    visualTheme: room.visual_theme,
    ...(typeof roomJson.renderTarget === "string"
      ? {
          renderTarget:
            roomJson.renderTarget as GetRoomPlayResponse["renderTarget"]
        }
      : {}),
    ...(roomJson.camera === "top_down_2_5d"
      ? { camera: roomJson.camera as GetRoomPlayResponse["camera"] }
      : {}),
    ...(typeof roomJson.stage === "object" && roomJson.stage
      ? { stage: roomJson.stage as GetRoomPlayResponse["stage"] }
      : {}),
    objects: readRoomJsonObjects(room.room_json),
    imageClue: null,
    pet: {
      name: asString(pet.name, "纸团"),
      avatarUrl: null,
      mood: asString(pet.type, "curious"),
      maxHintLevel: 3,
      ...(pet.type === "cat" || pet.type === "dog" ? { type: pet.type } : {}),
      ...(typeof pet.position === "object" && pet.position
        ? { position: pet.position as GetRoomPlayResponse["pet"]["position"] }
        : {}),
      ...(isAnchor(pet.anchor) ? { anchor: pet.anchor } : {}),
      ...(typeof pet.scale === "number" ? { scale: pet.scale } : {}),
      ...(typeof pet.assetUrl === "string" ? { assetUrl: pet.assetUrl } : {}),
      ...(typeof pet.shadow === "object" && pet.shadow
        ? { shadow: pet.shadow as GetRoomPlayResponse["pet"]["shadow"] }
        : {}),
      ...(pet.chatEnabled === true ? { chatEnabled: true as const } : {})
    },
    choices: readChoices(room.room_json),
    progress: {
      discoveredObjectIds: [],
      currentStep: "explore",
      hintLevelUsed: 0
    }
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const params = getRoomPlayParamsSchema.safeParse(await context.params);

  if (!params.success) {
    return apiError("validation_error", "Invalid room id", 422, params.error.flatten());
  }

  const response = await getPersistedRoomPlay(params.data.roomId);

  if (!response) {
    return apiError("not_found", "小屋不存在或暂未公开", 404);
  }

  return jsonResponse(getRoomPlayResponseSchema, response);
}

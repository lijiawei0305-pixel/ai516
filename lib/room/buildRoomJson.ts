import type {
  ObjectImageJobResult,
  ObjectImageJobSuccess
} from "../llm/imageJobs/runObjectImageJobs";
import type {
  RoomDesign,
  SemanticAnalysis
} from "../llm/pipeline/types";
import {
  bottomCenterAnchor,
  getLayoutForObject,
  getStageForTheme,
  type RoomObjectAnchor,
  type RoomObjectPosition,
  type RoomObjectRender,
  type RoomObjectShadow,
  type RoomStage
} from "./layoutRules";

export type RoomInteractionType = "tap" | "tap_note" | "tap_reveal";

export type RoomJsonObject = {
  id: string;
  name: string;
  clue: string;
  keyword: string;
  position: RoomObjectPosition;
  anchor: RoomObjectAnchor;
  scale: number;
  assetUrl: string;
  shadow: RoomObjectShadow;
  render: RoomObjectRender;
  interactionType: RoomInteractionType;
};

export type RoomJsonChoice = {
  id: string;
  text: string;
};

export type RoomJsonPet = {
  type: "cat" | "dog";
  name: string;
  position: RoomObjectPosition;
  anchor: RoomObjectAnchor;
  scale: number;
  assetUrl: string;
  shadow: RoomObjectShadow;
  chatEnabled: true;
  personality?: string;
};

export type RoomJson = {
  schemaVersion: 1;
  renderTarget: "2.5d_miniature_cabin";
  camera: "top_down_2_5d";
  roomId: string;
  roomTitle: string;
  publicTitle: string;
  emotionType: string;
  visualTheme: string;
  stage: RoomStage;
  objects: RoomJsonObject[];
  imageClue?: {
    assetUrl: string;
    clue: string;
  };
  pet: RoomJsonPet;
  choices: RoomJsonChoice[];
  correctChoiceIndex: number;
  hiddenMeaning: string;
  endingLine: string;
  shareText: string;
  generation?: Record<string, unknown>;
};

type LegacyRoomObject = {
  id: string;
  name: string;
  clue: string;
  keyword: string;
  assetKey?: string;
  positionHint?: string;
  interactionType?: string;
  imageUrl?: string | null;
  imageStoragePath?: string | null;
};

type LegacyChoice = {
  id: string;
  text: string;
  isCorrect?: boolean;
};

type LegacyRoom = {
  roomTitle: string;
  publicTitle: string;
  emotionType: string;
  visualTheme: string;
  hiddenMeaning: string;
  objects: LegacyRoomObject[];
  choices: LegacyChoice[];
  endingLine: string;
  shareText: string;
  pet: {
    type: string;
    name: string;
    personality?: string;
  };
};

export type BuildRoomJsonInput = {
  roomId: string;
  originalSentence?: string;
  semanticAnalysis?: Partial<SemanticAnalysis> & {
    hiddenMeaning?: string;
    coreEmotion?: string;
    implicitNeed?: string;
  };
  roomDesign?: RoomDesign;
  room?: LegacyRoom;
  objectAssets?: ObjectImageJobResult[];
  imageClue?: {
    assetUrl: string | null;
    clue: string | null;
  } | null;
  generation?: Record<string, unknown>;
};

function isSuccessfulAsset(
  result: ObjectImageJobResult
): result is ObjectImageJobSuccess {
  return result.status === "success";
}

function buildAssetMap(input: BuildRoomJsonInput) {
  const map = new Map<string, string>();

  input.objectAssets?.forEach((asset) => {
    if (
      isSuccessfulAsset(asset) &&
      asset.assetRole === "clue_object_sprite" &&
      asset.publicUrl &&
      (asset.layerRole === "main" || asset.layerRole === "mid")
    ) {
      map.set(asset.objectId, asset.publicUrl);
    }
  });

  input.objectAssets?.forEach((asset) => {
    if (
      isSuccessfulAsset(asset) &&
      asset.assetRole === "clue_object_sprite" &&
      asset.publicUrl &&
      !map.has(asset.objectId)
    ) {
      map.set(asset.objectId, asset.publicUrl);
    }
  });

  input.room?.objects.forEach((object) => {
    if (object.imageUrl && !map.has(object.id)) {
      map.set(object.id, object.imageUrl);
    }
  });

  return map;
}

function buildLayersMap(input: BuildRoomJsonInput) {
  const map = new Map<
    string,
    Array<{ role: "back" | "mid" | "front"; assetUrl: string }>
  >();

  input.objectAssets?.forEach((asset) => {
    if (
      !isSuccessfulAsset(asset) ||
      asset.assetRole !== "clue_object_sprite" ||
      !asset.publicUrl
    ) {
      return;
    }
    if (
      asset.layerRole !== "back" &&
      asset.layerRole !== "mid" &&
      asset.layerRole !== "front"
    ) {
      return;
    }

    const list = map.get(asset.objectId) ?? [];
    list.push({ role: asset.layerRole, assetUrl: asset.publicUrl });
    map.set(asset.objectId, list);
  });

  return map;
}

function findAssetByRole(
  input: BuildRoomJsonInput,
  role: ObjectImageJobSuccess["assetRole"]
) {
  return input.objectAssets?.find(
    (asset): asset is ObjectImageJobSuccess =>
      isSuccessfulAsset(asset) && asset.assetRole === role && Boolean(asset.publicUrl)
  );
}

function mergeGeneratedStageAssets(
  stage: RoomStage,
  input: BuildRoomJsonInput
): RoomStage {
  const background = findAssetByRole(input, "room_shell_background");
  const foreground = findAssetByRole(input, "foreground_occluder");
  const nextForeground = [...stage.foreground];

  if (foreground?.publicUrl) {
    nextForeground.push({
      id: "generated_foreground_occluder",
      kind: "foreground_occluder",
      assetUrl: foreground.publicUrl,
      alt: "前景遮挡纸板层",
      position: { x: 50, y: 92, z: 2, layer: 6200 },
      anchor: bottomCenterAnchor(),
      width: 390,
      height: 118,
      scale: 1,
      opacity: 0.96,
      layer: 6200,
      style: "generated-paper-foreground-occluder"
    });
  }

  return {
    ...stage,
    backgroundAsset: background?.publicUrl
      ? {
          id: "generated_room_shell_background",
          kind: "room_shell_background",
          assetUrl: background.publicUrl,
          alt: "2.5D 纸板小屋房间壳背景",
          position: { x: 50, y: 100, z: 0, layer: 0 },
          anchor: bottomCenterAnchor(),
          width: 390,
          height: 500,
          scale: 1,
          opacity: 1,
          layer: 0,
          style: "generated-2_5d-room-shell-background"
        }
      : stage.backgroundAsset ?? null,
    foreground: nextForeground
  };
}

function normalizeInteractionType(value: string | undefined): RoomInteractionType {
  if (value === "open" || value === "inspect") {
    return "tap_note";
  }

  if (value === "turn" || value === "drag") {
    return "tap_reveal";
  }

  return value === "tap_note" || value === "tap_reveal" ? value : "tap";
}

function normalizePetType(value: string | undefined): "cat" | "dog" {
  return value === "dog" ? "dog" : "cat";
}

function buildChoices(input: BuildRoomJsonInput): RoomJsonChoice[] {
  const sourceChoices =
    input.roomDesign?.choiceOptions ??
    input.room?.choices.map((choice) => ({
      id: choice.id,
      text: choice.text
    })) ??
    [];

  return sourceChoices.map((choice, index) => ({
    id: choice.id || `choice_${index + 1}`,
    text: choice.text
  }));
}

function getCorrectChoiceIndex(input: BuildRoomJsonInput) {
  if (typeof input.roomDesign?.correctChoiceIndex === "number") {
    return input.roomDesign.correctChoiceIndex;
  }

  const legacyIndex =
    input.room?.choices.findIndex((choice) => choice.isCorrect) ?? -1;

  return legacyIndex >= 0 ? legacyIndex : 0;
}

function buildObjectShadow(layout: ReturnType<typeof getLayoutForObject>): RoomObjectShadow {
  const depth = typeof layout.position.z === "number" ? layout.position.z : 16;
  const frontness = Math.max(0, Math.min(1, layout.position.y / 100));

  return {
    enabled: true,
    width: Math.round(layout.render.width * (0.64 + frontness * 0.16)),
    height: Math.round(18 + frontness * 10),
    opacity: Number((0.2 + frontness * 0.18).toFixed(2)),
    blur: Math.round(8 + Math.max(0, 34 - depth) * 0.14),
    offsetY: Math.round(5 + frontness * 4)
  };
}

function buildObjects(input: BuildRoomJsonInput): RoomJsonObject[] {
  const visualTheme =
    input.roomDesign?.visualTheme ?? input.room?.visualTheme ?? "old_paper_dollhouse";
  const assetByObjectId = buildAssetMap(input);
  const layersByObjectId = buildLayersMap(input);
  const usedSlotKeys = new Set<
    Parameters<typeof getLayoutForObject>[3] extends Set<infer T> ? T : never
  >();
  const concepts =
    input.roomDesign?.objectConcepts ??
    input.room?.objects.map((object) => ({
      id: object.id,
      name: object.name,
      clue: object.clue,
      keyword: object.keyword,
      positionHint: object.positionHint ?? "",
      preferredAssetType: object.assetKey ?? "other",
      interactionType: object.interactionType
    })) ??
    [];

  return concepts.map((object, index) => {
    const layout = getLayoutForObject(object, index, visualTheme, usedSlotKeys);
    const assetUrl = assetByObjectId.get(object.id) ?? "";
    const layers = layersByObjectId.get(object.id) ?? [];
    const scale = Number((0.9 + Math.max(0, Math.min(100, layout.position.y)) / 520).toFixed(2));
    const anchor = bottomCenterAnchor();
    const shadow = buildObjectShadow(layout);

    return {
      id: object.id || `object_${index + 1}`,
      name: object.name,
      clue: object.clue,
      keyword: object.keyword,
      position: layout.position,
      anchor,
      scale,
      assetUrl,
      shadow,
      render: {
        assetUrl,
        width: layout.render.width,
        height: layout.render.height,
        style: layout.render.style,
        interactive: true,
        anchor,
        scale,
        shadow,
        ...(layers.length > 0
          ? {
              layers: layers.map((layer) => ({
                role: layer.role,
                assetUrl: layer.assetUrl,
                zOffset:
                  layer.role === "back" ? -20 : layer.role === "front" ? 18 : 0,
                parallaxMultiplier:
                  layer.role === "back" ? 0.7 : layer.role === "front" ? 1.3 : 1,
                swayAmplitude: layer.role === "front" ? 2 : 0
              }))
            }
          : {})
      },
      interactionType: normalizeInteractionType(
        "interactionType" in object ? object.interactionType : undefined
      )
    };
  });
}

export function buildRoomJson(input: BuildRoomJsonInput): RoomJson {
  const design = input.roomDesign;
  const room = input.room;
  const visualTheme = design?.visualTheme ?? room?.visualTheme ?? "old_paper_dollhouse";
  const petHints = design?.petPersonaHints;
  const pet = room?.pet;
  const petType = normalizePetType(petHints?.type ?? pet?.type);
  const hiddenMeaning =
    input.semanticAnalysis?.hiddenMeaning ??
    room?.hiddenMeaning ??
    input.semanticAnalysis?.implicitNeed ??
    "";
  const imageClue =
    input.imageClue?.assetUrl && input.imageClue.clue
      ? {
          assetUrl: input.imageClue.assetUrl,
          clue: input.imageClue.clue
        }
      : undefined;
  const stage = mergeGeneratedStageAssets(getStageForTheme(visualTheme), input);
  const petAsset = findAssetByRole(input, "pet_sprite");
  const petPosition = { x: 82, y: 80, z: 10, layer: 48 };
  const petShadow = {
    enabled: true,
    width: 68,
    height: 18,
    opacity: 0.28,
    blur: 9,
    offsetY: 6
  };

  return {
    schemaVersion: 1,
    renderTarget: "2.5d_miniature_cabin",
    camera: "top_down_2_5d",
    roomId: input.roomId,
    roomTitle: design?.roomTitle ?? room?.roomTitle ?? "心事小屋",
    publicTitle: design?.publicTitle ?? room?.publicTitle ?? "一间等待被读懂的小屋",
    emotionType:
      design?.emotionType ??
      room?.emotionType ??
      input.semanticAnalysis?.coreEmotion ??
      "未命名情绪",
    visualTheme,
    stage,
    objects: buildObjects(input),
    ...(imageClue ? { imageClue } : {}),
    pet: {
      type: petType,
      name: pet?.name ?? (petType === "dog" ? "纸团" : "纸团"),
      position: petPosition,
      anchor: bottomCenterAnchor(),
      scale: 1,
      assetUrl: petAsset?.publicUrl ?? "",
      shadow: petShadow,
      chatEnabled: true,
      personality:
        pet?.personality ??
        petHints?.temperament ??
        "温柔、谨慎，只围绕线索提示"
    },
    choices: buildChoices(input),
    correctChoiceIndex: getCorrectChoiceIndex(input),
    hiddenMeaning,
    endingLine: room?.endingLine ?? "有些话被轻轻放回了灯下。",
    shareText: room?.shareText ?? "我做了一间心事小屋，想邀请你来看看。",
    ...(input.generation ? { generation: input.generation } : {})
  };
}

import type { GetRoomPlayResponse } from "@/lib/contracts/api";

export type MiniRoomPosition = {
  x: number;
  y: number;
  z?: number;
  layer: number;
};

export type MiniRoomAnchor =
  | {
      x: number;
      y: number;
    }
  | "bottom-center"
  | "center"
  | "top-left";

export const MINI_ROOM_BOTTOM_CENTER_ANCHOR = { x: 0.5, y: 1 } as const;

function bottomCenterAnchor(): MiniRoomAnchor {
  return { ...MINI_ROOM_BOTTOM_CENTER_ANCHOR };
}

export type MiniRoomShadow = {
  enabled: boolean;
  width: number;
  height: number;
  opacity: number;
  blur: number;
  offsetY: number;
};

export type MiniRoomLayerRole = "back" | "mid" | "front";

export type MiniRoomLayer = {
  role: MiniRoomLayerRole;
  assetUrl: string;
  zOffset: number;
  parallaxMultiplier: number;
  swayAmplitude: number;
};

export type MiniRoomRender = {
  assetUrl: string | null;
  width: number;
  height: number;
  style: string;
  interactive: true;
  anchor: MiniRoomAnchor;
  scale: number;
  shadow: MiniRoomShadow;
  layers: MiniRoomLayer[];
};

export type MiniRoomObject = {
  id: string;
  name: string;
  clue: string;
  keyword: string;
  discovered: boolean;
  position: MiniRoomPosition;
  anchor: MiniRoomAnchor;
  scale: number;
  assetUrl: string | null;
  shadow: MiniRoomShadow;
  render: MiniRoomRender;
  interactionType: "tap" | "tap_note" | "tap_reveal";
};

export type MiniRoomPet = {
  type: "cat" | "dog";
  name: string;
  position: MiniRoomPosition;
  anchor: MiniRoomAnchor;
  scale: number;
  assetUrl: string | null;
  shadow: MiniRoomShadow;
  chatEnabled: boolean;
};

export type MiniRoomStage = {
  backgroundStyle: string;
  roomShellType: string;
  lighting: string;
  floorStyle: string;
  backgroundAsset: MiniRoomStageAsset | null;
  foreground: MiniRoomStageAsset[];
};

export type MiniRoomStageAsset = {
  id: string;
  kind: string;
  assetUrl: string | null;
  alt: string;
  position: MiniRoomPosition;
  anchor: MiniRoomAnchor;
  width: number;
  height: number;
  scale: number;
  opacity: number;
  layer: number;
  style: string;
};

export type AdaptedPublicRoom = {
  roomId: string;
  publicTitle: string;
  visualTheme: string;
  renderTarget: "2.5d_miniature_cabin";
  camera: "top_down_2_5d";
  stage: MiniRoomStage;
  objects: MiniRoomObject[];
  imageClue: GetRoomPlayResponse["imageClue"];
  pet: MiniRoomPet;
  choices: NonNullable<GetRoomPlayResponse["choices"]>;
  progress: GetRoomPlayResponse["progress"];
};

const fallbackStage: MiniRoomStage = {
  backgroundStyle: "aged-paper-backdrop-with-taped-corners",
  roomShellType: "open-front-cardboard-dollhouse",
  lighting: "soft-warm-desk-lamp",
  floorStyle: "folded-kraft-paper-floor",
  backgroundAsset: null,
  foreground: [
    {
      id: "rug_front_edge",
      kind: "rug_front",
      assetUrl: null,
      alt: "地毯前缘",
      position: { x: 50, y: 83, z: 2, layer: 4200 },
      anchor: bottomCenterAnchor(),
      width: 278,
      height: 44,
      scale: 1,
      opacity: 0.96,
      layer: 4200,
      style: "torn-paper-rug-front-edge"
    },
    {
      id: "table_front_edge",
      kind: "table_front",
      assetUrl: null,
      alt: "桌子前沿",
      position: { x: 50, y: 68, z: 7, layer: 3900 },
      anchor: bottomCenterAnchor(),
      width: 218,
      height: 58,
      scale: 1,
      opacity: 0.98,
      layer: 3900,
      style: "paper-table-front-occluder"
    },
    {
      id: "front_floor_lip",
      kind: "paper_floor_lip",
      assetUrl: null,
      alt: "纸板地板前缘",
      position: { x: 50, y: 96, z: 1, layer: 6100 },
      anchor: bottomCenterAnchor(),
      width: 392,
      height: 42,
      scale: 1,
      opacity: 1,
      layer: 6100,
      style: "corrugated-cardboard-front-lip"
    }
  ]
};

const fallbackPositions: MiniRoomPosition[] = [
  { x: 50, y: 76, z: 8, layer: 42 },
  { x: 25, y: 35, z: 28, layer: 18 },
  { x: 22, y: 58, z: 16, layer: 32 },
  { x: 72, y: 40, z: 28, layer: 22 },
  { x: 82, y: 58, z: 18, layer: 34 }
];

function finiteNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function isAnchor(value: unknown): value is MiniRoomAnchor {
  if (value === "bottom-center" || value === "center" || value === "top-left") {
    return true;
  }

  if (typeof value !== "object" || !value) {
    return false;
  }

  const anchor = value as Record<string, unknown>;

  return typeof anchor.x === "number" && typeof anchor.y === "number";
}

function adaptAnchor(value: unknown): MiniRoomAnchor {
  if (value === "bottom-center") {
    return bottomCenterAnchor();
  }

  return isAnchor(value) ? value : bottomCenterAnchor();
}

function adaptPosition(
  position: GetRoomPlayResponse["objects"][number]["position"] | undefined,
  index: number
): MiniRoomPosition {
  const fallback = fallbackPositions[
    Math.abs(index) % fallbackPositions.length
  ];

  return {
    x: clampPercent(finiteNumber(position?.x, fallback.x)),
    y: clampPercent(finiteNumber(position?.y, fallback.y)),
    z: finiteNumber(position?.z, fallback.z ?? 0),
    layer: Math.round(finiteNumber(position?.layer, fallback.layer))
  };
}

function adaptShadow(
  shadow: GetRoomPlayResponse["objects"][number]["shadow"] | undefined,
  width: number,
  position: MiniRoomPosition
): MiniRoomShadow {
  const frontness = clampPercent(position.y) / 100;

  return {
    enabled: shadow?.enabled ?? true,
    width: Math.max(44, Math.min(190, finiteNumber(shadow?.width, width * 0.72))),
    height: Math.max(12, Math.min(42, finiteNumber(shadow?.height, 18 + frontness * 12))),
    opacity: Math.max(0, Math.min(0.55, finiteNumber(shadow?.opacity, 0.22 + frontness * 0.16))),
    blur: Math.max(0, Math.min(28, finiteNumber(shadow?.blur, 10))),
    offsetY: Math.max(-6, Math.min(18, finiteNumber(shadow?.offsetY, 6 + frontness * 4)))
  };
}

function adaptRender(
  object: GetRoomPlayResponse["objects"][number],
  index: number,
  position: MiniRoomPosition
): MiniRoomRender {
  const render = object.render;
  const fallbackWidth = index === 0 ? 148 : 124;
  const fallbackHeight = index === 0 ? 116 : 130;
  const assetUrl =
    object.assetUrl?.trim() ||
    render?.assetUrl?.trim() ||
    object.imageUrl?.trim() ||
    null;
  const width = Math.max(72, Math.min(180, finiteNumber(render?.width, fallbackWidth)));
  const height = Math.max(72, Math.min(180, finiteNumber(render?.height, fallbackHeight)));
  const scale = Math.max(
    0.55,
    Math.min(1.35, finiteNumber(object.scale ?? render?.scale, 0.9 + position.y / 520))
  );
  const shadow = adaptShadow(object.shadow ?? render?.shadow, width, position);
  const rawLayers = Array.isArray(render?.layers) ? render?.layers : [];
  const layers: MiniRoomLayer[] = rawLayers
    .filter(
      (layer): layer is { role: MiniRoomLayerRole; assetUrl: string; zOffset?: number; parallaxMultiplier?: number; swayAmplitude?: number } =>
        Boolean(
          layer &&
            typeof layer.assetUrl === "string" &&
            layer.assetUrl.trim().length > 0 &&
            (layer.role === "back" || layer.role === "mid" || layer.role === "front")
        )
    )
    .map((layer) => ({
      role: layer.role,
      assetUrl: layer.assetUrl.trim(),
      zOffset: Math.max(-80, Math.min(80, finiteNumber(layer.zOffset, layer.role === "back" ? -20 : layer.role === "front" ? 18 : 0))),
      parallaxMultiplier: Math.max(
        0.4,
        Math.min(1.6, finiteNumber(layer.parallaxMultiplier, layer.role === "back" ? 0.7 : layer.role === "front" ? 1.3 : 1))
      ),
      swayAmplitude: Math.max(
        0,
        Math.min(6, finiteNumber(layer.swayAmplitude, layer.role === "front" ? 2 : 0))
      )
    }));

  return {
    assetUrl,
    width,
    height,
    style: render?.style?.trim() || "paper-cutout-prop",
    interactive: true,
    anchor: adaptAnchor(object.anchor ?? render?.anchor),
    scale,
    shadow,
    layers
  };
}

type PublicRoomStageAsset =
  | NonNullable<NonNullable<GetRoomPlayResponse["stage"]>["foreground"]>[number]
  | NonNullable<NonNullable<GetRoomPlayResponse["stage"]>["backgroundAsset"]>;
type StageAssetInput = PublicRoomStageAsset | MiniRoomStageAsset;

function adaptStageAsset(
  asset: StageAssetInput,
  index: number
): MiniRoomStageAsset {
  return {
    id: asset.id || `foreground_${index + 1}`,
    kind: asset.kind || "foreground",
    assetUrl: typeof asset.assetUrl === "string" ? asset.assetUrl.trim() || null : null,
    alt: asset.alt?.trim() || asset.kind || "前景遮挡",
    position: adaptPosition(asset.position, index),
    anchor: adaptAnchor(asset.anchor),
    width: Math.max(24, Math.min(520, finiteNumber(asset.width, 160))),
    height: Math.max(12, Math.min(360, finiteNumber(asset.height, 48))),
    scale: Math.max(0.35, Math.min(1.8, finiteNumber(asset.scale, 1))),
    opacity: Math.max(0, Math.min(1, finiteNumber(asset.opacity, 1))),
    layer: Math.round(finiteNumber(asset.layer, asset.position?.layer ?? 4000 + index)),
    style: asset.style?.trim() || asset.kind || "paper-foreground-occluder"
  };
}

function adaptStage(stage: GetRoomPlayResponse["stage"] | undefined): MiniRoomStage {
  const source = stage ?? fallbackStage;
  const foregroundSource: StageAssetInput[] =
    source.foreground && source.foreground.length > 0
      ? source.foreground
      : fallbackStage.foreground;

  return {
    backgroundStyle: source.backgroundStyle ?? fallbackStage.backgroundStyle,
    roomShellType: source.roomShellType ?? fallbackStage.roomShellType,
    lighting: source.lighting ?? fallbackStage.lighting,
    floorStyle: source.floorStyle ?? fallbackStage.floorStyle,
    backgroundAsset: source.backgroundAsset
      ? adaptStageAsset(source.backgroundAsset, -1)
      : null,
    foreground: foregroundSource.map(adaptStageAsset)
  };
}

function adaptPet(room: GetRoomPlayResponse): MiniRoomPet {
  const type = room.pet.type ?? (room.pet.mood === "dog" ? "dog" : "cat");
  const position = {
    x: clampPercent(finiteNumber(room.pet.position?.x, 84)),
    y: clampPercent(finiteNumber(room.pet.position?.y, 80)),
    z: finiteNumber(room.pet.position?.z, 8),
    layer: Math.round(finiteNumber(room.pet.position?.layer, 50))
  };

  return {
    type,
    name: room.pet.name,
    position,
    anchor: adaptAnchor(room.pet.anchor),
    scale: Math.max(0.55, Math.min(1.35, finiteNumber(room.pet.scale, 1))),
    assetUrl: room.pet.assetUrl?.trim() || room.pet.avatarUrl?.trim() || null,
    shadow: adaptShadow(room.pet.shadow, 78, position),
    chatEnabled: room.pet.chatEnabled ?? true
  };
}

export function adaptRoomPublicData(
  room: GetRoomPlayResponse
): AdaptedPublicRoom {
  return {
    roomId: room.roomId,
    publicTitle: room.publicTitle,
    visualTheme: room.visualTheme,
    renderTarget: room.renderTarget ?? "2.5d_miniature_cabin",
    camera: room.camera ?? "top_down_2_5d",
    stage: adaptStage(room.stage),
    objects: room.objects.map((object, index) => {
      const position = adaptPosition(object.position, index);
      const render = adaptRender(object, index, position);
      const anchor = adaptAnchor(object.anchor ?? render.anchor);
      const scale = Math.max(0.55, Math.min(1.35, finiteNumber(object.scale, render.scale)));
      const shadow = adaptShadow(object.shadow ?? render.shadow, render.width, position);

      return {
        id: object.id,
        name: object.name ?? object.title,
        clue: object.clue ?? object.description,
        keyword: object.keyword ?? "",
        discovered: object.discovered,
        position,
        anchor,
        scale,
        assetUrl: object.assetUrl?.trim() || render.assetUrl,
        shadow,
        render: {
          ...render,
          anchor,
          scale,
          shadow
        },
        interactionType: object.interactionType ?? "tap_note"
      };
    }),
    imageClue: room.imageClue,
    pet: adaptPet(room),
    choices: room.choices ?? [],
    progress: room.progress
  };
}

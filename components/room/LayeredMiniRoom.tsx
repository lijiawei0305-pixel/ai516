"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import { Moon, Sparkles, Star } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ClueNote } from "@/components/handbook/clue-note";
import { PolaroidCard } from "@/components/handbook/polaroid-card";
import { ProgressStickers } from "@/components/handbook/progress-stickers";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import { PetSprite } from "@/components/room/PetSprite";
import { RoomObjectSprite } from "@/components/room/RoomObjectSprite";
import { useTilt } from "@/lib/hooks/useTilt";
import type {
  AdaptedPublicRoom,
  MiniRoomObject,
  MiniRoomStageAsset
} from "@/lib/adapters/roomPublicDataAdapter";
import { cn } from "@/lib/utils";

type LayeredMiniRoomProps = {
  room: AdaptedPublicRoom;
};

type StagePalette = {
  wall: string;
  sideWall: string;
  floor: string;
  floorLine: string;
  window: string;
  furniture: string;
};

function stagePalette(theme: string): StagePalette {
  if (theme === "rainy_desk_miniature") {
    return {
      wall: "linear-gradient(180deg,#a89d8b 0%,#7b756a 100%)",
      sideWall: "linear-gradient(180deg,#8b806f 0%,#6a5f52 100%)",
      floor: "linear-gradient(160deg,#947b61 0%,#6f5541 100%)",
      floorLine: "rgba(58,38,25,0.28)",
      window: "#172538",
      furniture: "#6f4428"
    };
  }

  if (theme === "moonlit_paper_room") {
    return {
      wall: "linear-gradient(180deg,#6c5f6f 0%,#433848 100%)",
      sideWall: "linear-gradient(180deg,#574d5e 0%,#382f3f 100%)",
      floor: "linear-gradient(160deg,#705741 0%,#473229 100%)",
      floorLine: "rgba(31,22,34,0.36)",
      window: "#10172b",
      furniture: "#654027"
    };
  }

  return {
    wall: "linear-gradient(180deg,#caa37a 0%,#8b6546 100%)",
    sideWall: "linear-gradient(180deg,#ad815c 0%,#755036 100%)",
    floor: "linear-gradient(160deg,#c69a69 0%,#80583a 100%)",
    floorLine: "rgba(76,45,24,0.28)",
    window: "#17233a",
    furniture: "#744a2e"
  };
}

function depthZ(y: number, layer?: number) {
  return Math.round(y * 10 + (layer ?? 0));
}

function parallaxStyle(tilt: { x: number; y: number }, amount: number): CSSProperties {
  return {
    transform: `translate3d(${(tilt.x * amount).toFixed(2)}px, ${(tilt.y * amount).toFixed(2)}px, 0)`,
    transition: "transform 140ms ease-out",
    willChange: "transform"
  };
}

function fallbackDiscovered(progressIds: Set<string>, object: MiniRoomObject) {
  return object.discovered || progressIds.has(object.id);
}

function BackgroundLayer({ room }: { room: AdaptedPublicRoom }) {
  const background = room.stage.backgroundAsset;
  const hasGeneratedBackground = Boolean(background?.assetUrl);

  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-x-2 bottom-0 h-[92%] rounded-t-[3px] bg-[#9a6a45]/18 blur-[1px]" />
      {background?.assetUrl ? (
        <img
          src={background.assetUrl}
          alt={background.alt}
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />
      ) : null}
      {hasGeneratedBackground ? (
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_34px_rgba(62,35,18,0.2)]" />
      ) : null}
    </div>
  );
}

function BackWallLayer({ room }: { room: AdaptedPublicRoom }) {
  const colors = stagePalette(room.visualTheme);

  return (
    <div className={cn("absolute inset-0 z-10 overflow-hidden", room.stage.backgroundAsset?.assetUrl && "opacity-0")}>
      <div
        className="absolute left-1/2 top-0 h-[94%] w-[96%] -translate-x-1/2 shadow-paper"
        style={{
          clipPath: "polygon(5% 24%, 50% 1%, 95% 24%, 95% 100%, 5% 100%)",
          background: "#b58d67"
        }}
      >
        <div
          className="paper-grain absolute left-[12%] top-[14%] h-[52%] w-[76%]"
          style={{
            background: colors.wall,
            boxShadow: "inset 0 -20px 30px rgba(52,30,16,0.16)"
          }}
        />
        <div
          className="absolute left-[4%] top-[24%] h-[62%] w-[23%]"
          style={{
            background: colors.sideWall,
            clipPath: "polygon(0 0,100% 10%,100% 100%,0 86%)",
            boxShadow: "inset -14px 0 22px rgba(45,25,13,0.22)"
          }}
        />
        <div
          className="absolute right-[4%] top-[24%] h-[62%] w-[23%]"
          style={{
            background: colors.sideWall,
            clipPath: "polygon(0 10%,100% 0,100% 86%,0 100%)",
            boxShadow: "inset 14px 0 22px rgba(45,25,13,0.22)"
          }}
        />
        <div
          className="absolute bottom-[3%] left-[5%] h-[39%] w-[90%]"
          style={{
            background: colors.floor,
            clipPath: "polygon(21% 0,79% 0,100% 100%,0 100%)",
            boxShadow: "inset 0 18px 22px rgba(54,31,16,0.22)"
          }}
        />
        <div
          className="absolute bottom-[3%] left-[5%] h-[39%] w-[90%] opacity-70"
          style={{
            clipPath: "polygon(21% 0,79% 0,100% 100%,0 100%)",
            backgroundImage: `repeating-linear-gradient(92deg, transparent 0 26px, ${colors.floorLine} 27px 29px), repeating-linear-gradient(12deg, transparent 0 54px, ${colors.floorLine} 55px 56px)`
          }}
        />
        <div className="absolute left-[9%] top-[55%] h-[26%] w-[15%] rounded-t-full bg-sage/28 shadow-[inset_-8px_0_12px_rgba(40,28,18,0.18)]" />
        <div className="absolute right-[12%] top-[58%] h-[22%] w-[14%] rounded-t-full bg-sage/24 shadow-[inset_8px_0_12px_rgba(40,28,18,0.14)]" />
      </div>
    </div>
  );
}

function FurnitureLayer({ room }: { room: AdaptedPublicRoom }) {
  const colors = stagePalette(room.visualTheme);
  const reduceMotion = useReducedMotion();
  const lightPulse = reduceMotion
    ? undefined
    : {
        opacity: [0.9, 1, 0.92],
        scale: [0.99, 1.03, 1]
      };

  return (
    <div className={cn("absolute inset-0 z-20 pointer-events-none", room.stage.backgroundAsset?.assetUrl && "opacity-0")}>
      <div
        className="absolute left-[18%] top-[28%] h-[17%] w-[18%] border-[5px] shadow-insetPaper"
        style={{ borderColor: "#6e4427", background: "#f2c06c33" }}
      />
      <div
        className="absolute right-[13%] top-[22%] h-[24%] w-[23%] border-[5px] shadow-insetPaper"
        style={{ borderColor: "#6e4427", background: colors.window }}
      >
        <motion.div
          className="absolute left-[36%] top-[14%]"
          animate={lightPulse}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Moon className="h-9 w-9 text-[#ffd976]" />
        </motion.div>
        <Star className="absolute bottom-5 right-4 h-5 w-5 text-[#ffd976]" />
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-[#6e4427]" />
        <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-[#6e4427]" />
      </div>
      <motion.div
        className="absolute left-1/2 top-[16%] h-12 w-12 -translate-x-1/2 rounded-full bg-[#ffd470] shadow-[0_0_34px_rgba(255,205,96,0.95)]"
        animate={lightPulse}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute left-1/2 top-[16%] h-[28%] w-px -translate-x-1/2 bg-[#4b2b18]/60" />
      <div
        className="absolute left-1/2 top-[43%] h-[14%] w-[44%] -translate-x-1/2 rounded-[3px] shadow-sticker"
        style={{ background: colors.furniture }}
      >
        <div className="absolute inset-x-5 top-4 h-4 bg-cream/18" />
        <div className="absolute bottom-2 left-8 h-14 w-3 bg-[#442715]" />
        <div className="absolute bottom-2 right-8 h-14 w-3 bg-[#442715]" />
      </div>
      <div className="absolute left-[19%] top-[48%] h-[20%] w-[18%] bg-[#805333] shadow-sticker" />
      <div className="absolute right-[17%] top-[54%] h-[18%] w-[17%] bg-[#805333] shadow-sticker" />
      <div className="absolute left-[15%] top-[74%] h-[17%] w-[19%] rotate-[-4deg] bg-[#8b6040] shadow-sticker" />
      <div className="absolute right-[16%] top-[74%] h-[17%] w-[19%] rotate-[4deg] bg-[#8b6040] shadow-sticker" />
    </div>
  );
}

function OccluderAsset({ asset }: { asset: MiniRoomStageAsset }) {
  const xPercent = typeof asset.anchor === "object"
    ? asset.anchor.x * 100
    : asset.anchor === "top-left"
    ? 0
    : 50;
  const yPercent = typeof asset.anchor === "object"
    ? asset.anchor.y * 100
    : asset.anchor === "center"
    ? 50
    : asset.anchor === "top-left"
    ? 0
    : 100;
  const style = {
    left: `${asset.position.x}%`,
    top: `${asset.position.y}%`,
    zIndex: asset.layer,
    width: asset.width * asset.scale,
    height: asset.height * asset.scale,
    opacity: asset.opacity,
    transform: `translate(-${xPercent}%, -${yPercent}%)`
  };

  if (asset.assetUrl) {
    return (
      <img
        src={asset.assetUrl}
        alt={asset.alt}
        draggable={false}
        className="pointer-events-none absolute object-contain"
        style={style}
      />
    );
  }

  return (
    <div
      className="pointer-events-none absolute"
      style={style}
      aria-hidden="true"
    >
      {asset.kind === "table_front" ? (
        <div className="paper-grain h-full w-full rounded-b-[3px] bg-[#6b3f22] shadow-[0_10px_16px_rgba(46,27,14,0.28),inset_0_7px_0_rgba(255,228,171,0.16)]">
          <div className="absolute left-[14%] top-[45%] h-[55%] w-3 bg-[#432613]" />
          <div className="absolute right-[14%] top-[45%] h-[55%] w-3 bg-[#432613]" />
        </div>
      ) : asset.kind === "rug_front" ? (
        <div className="torn-edge paper-grain h-full w-full bg-sage/72 shadow-[0_-4px_8px_rgba(46,27,14,0.18)]" />
      ) : asset.kind === "paper_floor_lip" ? (
        <div className="paper-grain h-full w-full bg-[#b8895e] shadow-[0_-6px_12px_rgba(53,31,17,0.28)] [clip-path:polygon(0_18%,100%_0,96%_100%,4%_92%)]">
          <div className="absolute inset-x-0 top-2 border-t-2 border-dashed border-[#4b2b18]/45" />
        </div>
      ) : asset.kind === "cardboard_edge" ? (
        <div className="paper-grain h-full w-full bg-[#8a5d3d] shadow-[inset_0_0_16px_rgba(45,24,12,0.28)] [clip-path:polygon(28%_0,100%_4%,76%_100%,0_96%)]" />
      ) : (
        <div className="torn-edge paper-grain h-full w-full bg-parchment shadow-sticker" />
      )}
    </div>
  );
}

function EffectLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[7000]">
      <div
        className="absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd470]/18 blur-2xl"
        style={{
          left: "var(--room-light-x)",
          top: "var(--room-light-y)"
        }}
      />
      <div className="absolute inset-x-[7%] bottom-[2%] h-20 bg-gradient-to-t from-[#2d1b0f]/22 to-transparent" />
      <div className="absolute inset-[3%] rounded-[2px] shadow-[inset_0_0_38px_rgba(62,35,18,0.22)]" />
    </div>
  );
}

export function LayeredMiniRoomStage({
  room,
  selectedObject,
  discoveredIds,
  onSelectObject,
  onSelectPet
}: {
  room: AdaptedPublicRoom;
  selectedObject: MiniRoomObject | null;
  discoveredIds: Set<string>;
  onSelectObject: (object: MiniRoomObject) => void;
  onSelectPet: () => void;
}) {
  const sortedObjects = useMemo(
    () =>
      [...room.objects].sort(
        (a, b) => depthZ(a.position.y, a.position.layer) - depthZ(b.position.y, b.position.layer)
      ),
    [room.objects]
  );
  const petZ = depthZ(room.pet.position.y, room.pet.position.layer);
  const stageRef = useRef<HTMLDivElement>(null);
  const tilt = useTilt({ targetRef: stageRef });

  return (
    <div
      ref={stageRef}
      className="relative h-full overflow-hidden"
      aria-label="线索小屋舞台"
    >
      <div className="absolute inset-0" style={parallaxStyle(tilt, 3)}>
        <BackgroundLayer room={room} />
        <BackWallLayer room={room} />
      </div>
      <div className="absolute inset-0" style={parallaxStyle(tilt, 10)}>
        <FurnitureLayer room={room} />
      </div>
      <div className="absolute inset-0 z-30" style={parallaxStyle(tilt, 16)}>
        {sortedObjects.map((object) => (
          <RoomObjectSprite
            key={object.id}
            object={object}
            index={room.objects.findIndex((item) => item.id === object.id)}
            selected={selectedObject?.id === object.id}
            discovered={fallbackDiscovered(discoveredIds, object)}
            zIndex={depthZ(object.position.y, object.position.layer)}
            onSelect={onSelectObject}
          />
        ))}
        <PetSprite pet={room.pet} zIndex={petZ} onSelect={onSelectPet} />
      </div>
      <div className="pointer-events-none absolute inset-0 z-40" style={parallaxStyle(tilt, 24)}>
        {room.stage.foreground.map((asset) => (
          <OccluderAsset key={asset.id} asset={asset} />
        ))}
      </div>
      <EffectLayer />
    </div>
  );
}

export function LayeredMiniRoom({ room }: LayeredMiniRoomProps) {
  const [selectedObject, setSelectedObject] = useState<MiniRoomObject | null>(
    room.objects[0] ?? null
  );
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(
    () => new Set(room.progress.discoveredObjectIds)
  );
  const [petOpen, setPetOpen] = useState(false);
  const discoveredCount = useMemo(
    () => room.objects.filter((object) => discoveredIds.has(object.id)).length,
    [discoveredIds, room.objects]
  );

  function selectObject(object: MiniRoomObject) {
    setSelectedObject(object);
    setPetOpen(false);
    setDiscoveredIds((current) => new Set(current).add(object.id));
  }

  return (
    <>
      {room.imageClue ? (
        <PolaroidCard className="mx-auto mb-5 w-44 rotate-[-3deg]" caption={room.imageClue.alt}>
          {room.imageClue.url ? (
            <img
              src={room.imageClue.url}
              alt={room.imageClue.alt}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-sm text-coffee/60">
              信封里的照片
            </div>
          )}
        </PolaroidCard>
      ) : null}

      <section
        className="relative mt-7 h-[500px]"
        aria-label="线索小屋"
      >
        <LayeredMiniRoomStage
          room={room}
          selectedObject={selectedObject}
          discoveredIds={discoveredIds}
          onSelectObject={selectObject}
          onSelectPet={() => {
            setPetOpen(true);
            setSelectedObject(null);
          }}
        />

        <div className="pointer-events-none absolute inset-0 z-[8000]">
          <AnimatePresence mode="wait">
            {selectedObject ? (
              <div className="absolute bottom-0 left-[8%] right-[8%]">
                <motion.div
                  key={selectedObject.id}
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="pointer-events-auto"
                >
                  <ClueNote
                    className="!mx-0 !w-full px-5 py-4 text-lg leading-8"
                    onClose={() => setSelectedObject(null)}
                  >
                    <span className="mb-2 block soft-title text-lg text-coffee/70">
                      {selectedObject.name}
                    </span>
                    {selectedObject.clue}
                  </ClueNote>
                </motion.div>
              </div>
            ) : null}
            {petOpen ? (
              <div className="absolute bottom-0 left-[8%] right-[8%]">
                <motion.div
                  key="pet-note"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="pointer-events-auto"
                >
                  <ClueNote
                    className="!mx-0 !w-full px-5 py-4 text-lg leading-8"
                    onClose={() => setPetOpen(false)}
                  >
                    <span className="mb-2 block soft-title text-lg text-coffee/70">
                      {room.pet.name}
                    </span>
                    我会陪你看线索，但不会直接说出答案。
                  </ClueNote>
                </motion.div>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <TornPaperCard className="mt-5 text-center" tone="cream">
        <div className="mb-4 flex items-center justify-center gap-4 font-serif text-xl">
          <span className="h-px w-20 bg-coffee/24" />
          线索进度 {discoveredCount}/{room.objects.length}
          <span className="h-px w-20 bg-coffee/24" />
        </div>
        <ProgressStickers total={Math.max(1, room.objects.length)} current={discoveredCount} />
      </TornPaperCard>

      {room.choices.length > 0 ? (
        <TornPaperCard className="mt-5 p-4" tone="parchment" tape="corner">
          <div className="mb-3 flex items-center gap-2 font-serif text-lg">
            <Sparkles className="h-5 w-5 text-warm-orange" />
            你觉得这句话更像是
          </div>
          <div className="grid gap-3">
            {room.choices.map((choice) => (
              <button
                key={choice.index}
                type="button"
                className="torn-edge paper-grain min-h-12 bg-cream px-4 py-3 text-left font-serif text-base leading-6 shadow-sticker transition hover:-translate-y-0.5 hover:shadow-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-orange/60"
              >
                {choice.label}
              </button>
            ))}
          </div>
        </TornPaperCard>
      ) : null}
    </>
  );
}

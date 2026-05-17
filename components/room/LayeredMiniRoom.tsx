"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import { Check, Moon, Sparkles, Star } from "lucide-react";
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
  
  const style: CSSProperties = {
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

  // Fallback omitted as per request to avoid cartoon CSS
  return null;
}

import { prototypeBackgrounds } from "@/lib/prototype-backgrounds";

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
      className="relative w-full overflow-clip [overflow-clip-margin:8px] perspective-[1000px] rounded-lg shadow-paper"
      aria-label="线索小屋舞台"
    >
      <div className="relative w-full" style={parallaxStyle(tilt, 2)}>
        <img 
          src={prototypeBackgrounds.play} 
          alt="小屋" 
          className="w-full h-auto object-cover" 
          draggable={false}
        />
      </div>
      <div className="absolute inset-0 z-30" style={parallaxStyle(tilt, 6)}>
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
      <div className="pointer-events-none absolute inset-0 z-40" style={parallaxStyle(tilt, 8)}>
        {room.stage.foreground.map((asset) => (
          <OccluderAsset key={asset.id} asset={asset} />
        ))}
      </div>
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
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
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
        className="relative mt-7 w-full"
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
            {room.choices.map((choice) => {
              const selected = selectedChoiceIndex === choice.index;
              return (
                <button
                  key={choice.index}
                  type="button"
                  onClick={() => setSelectedChoiceIndex(selected ? null : choice.index)}
                  className={cn(
                    "relative torn-edge paper-grain min-h-12 px-4 py-3 text-left font-serif text-base leading-6 shadow-sticker transition-all duration-200 active:scale-[0.98]",
                    "hover:-translate-y-0.5 hover:shadow-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-orange/60",
                    selected
                      ? "bg-sage text-cream shadow-paper -translate-y-0.5"
                      : "bg-cream"
                  )}
                >
                  <span className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        selected
                          ? "border-cream bg-warm-orange"
                          : "border-coffee/25"
                      )}
                    >
                      {selected ? <Check className="h-3 w-3 text-cream" /> : null}
                    </span>
                    <span>{choice.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </TornPaperCard>
      ) : null}
    </>
  );
}

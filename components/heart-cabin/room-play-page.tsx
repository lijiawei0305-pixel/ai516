"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Cat,
  Check,
  Clock3,
  Dog,
  Image as ImageIcon,
  Leaf,
  Mail,
  MessageCircle,
  Moon,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { HanddrawnIcons } from "@/components/handbook/handdrawn-assets";
import { ClueNote } from "@/components/handbook/clue-note";
import { EnvelopeCard } from "@/components/handbook/envelope-card";
import { HanddrawnIconButton } from "@/components/handbook/handdrawn-icon-button";
import { PaperButton } from "@/components/handbook/paper-button";
import { PolaroidCard } from "@/components/handbook/polaroid-card";
import { StickerTag } from "@/components/handbook/sticker-tag";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import { AppShell } from "@/components/layout/app-shell";
import { PaperPage } from "@/components/layout/paper-page";
import type { PublicRoomPlayData, RoomObject } from "@/lib/contracts";
import { mockRoomPublicData } from "@/lib/mock-room-public";
import { cn } from "@/lib/utils";
import { prototypeBackgrounds } from "@/lib/prototype-backgrounds";

type RoomPlayPageProps = {
  roomId: string;
};

export function RoomPlayPage({ roomId }: RoomPlayPageProps) {
  const router = useRouter();
  const room = useMemo(
    () => ({
      ...mockRoomPublicData,
      roomId
    }),
    [roomId]
  );
  const [discoveredIds, setDiscoveredIds] = useState<string[]>(room.discoveredObjectIds);
  const [selectedClue, setSelectedClue] = useState<RoomObject | null>(null);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isPetOpen, setIsPetOpen] = useState(false);

  const discoveredSet = useMemo(() => new Set(discoveredIds), [discoveredIds]);

  function handleClueSelect(object: RoomObject) {
    setSelectedClue(object);
    setDiscoveredIds((current) =>
      current.includes(object.id) ? current : [...current, object.id]
    );
  }

  return (
    <AppShell statusBarDark>
      <PaperPage backgroundSrc={prototypeBackgrounds.play} className="px-4 pt-14" withBinder={false}>
        <header className="relative text-center">
          <HanddrawnIconButton
            icon={<ArrowLeft className="h-7 w-7" />}
            label="返回创建页"
            onClick={() => router.push("/create")}
            className="absolute left-1 top-0 z-20"
          />
          <h1 className="soft-title px-14 pt-2 text-[37px] leading-tight">
            {room.publicTitle}
            <HanddrawnIcons.Heart className="mb-1 ml-1 inline h-6 w-6 text-warm-orange" />
          </h1>
          <TornPaperCard tone="parchment" className="mx-auto mt-7 w-[82%] py-3 font-serif text-lg" tape="top">
            这里藏着一句话，找到 <strong>5</strong> 个线索来猜猜看。
          </TornPaperCard>
        </header>

        <section className="relative mt-7 h-[484px]" aria-label={room.roomTitle}>
          <MiniatureHouse
            room={room}
            discoveredIds={discoveredSet}
            selectedClueId={selectedClue?.id}
            onClueSelect={handleClueSelect}
            onEnvelopeOpen={() => setIsEnvelopeOpen(true)}
            onPetOpen={() => setIsPetOpen(true)}
          />

          <AnimatePresence>
            {selectedClue ? (
              <ClueNotePanel
                key={selectedClue.id}
                object={selectedClue}
                onClose={() => setSelectedClue(null)}
              />
            ) : null}
          </AnimatePresence>
        </section>

        <TornPaperCard className="mt-5 text-center" tone="cream">
          <div className="mb-4 flex items-center justify-center gap-4 font-serif text-xl">
            <span className="h-px w-20 bg-coffee/24" />
            线索进度 {discoveredIds.length}/5
            <span className="h-px w-20 bg-coffee/24" />
          </div>
          <ClueProgressStickers objects={room.objects} discoveredIds={discoveredSet} />
        </TornPaperCard>

        <GuessEntryButton
          disabled={discoveredIds.length === 0}
          onClick={() => router.push(`/guess/${room.roomId}`)}
        />

        <EnvelopeImageClue
          imageClue={room.imageClue}
          open={isEnvelopeOpen}
          onClose={() => setIsEnvelopeOpen(false)}
        />
        <PetHintChatSheet pet={room.pet} open={isPetOpen} onClose={() => setIsPetOpen(false)} />
      </PaperPage>
    </AppShell>
  );
}

type MiniatureHouseProps = {
  room: PublicRoomPlayData;
  discoveredIds: Set<string>;
  selectedClueId?: string;
  onClueSelect: (object: RoomObject) => void;
  onEnvelopeOpen: () => void;
  onPetOpen: () => void;
};

export function MiniatureHouse({
  room,
  discoveredIds,
  selectedClueId,
  onClueSelect,
  onEnvelopeOpen,
  onPetOpen
}: MiniatureHouseProps) {
  return (
    <div className="absolute inset-x-0 top-0 h-[435px]">
      <div className="absolute left-1/2 top-0 h-[406px] w-[96%] -translate-x-1/2">
        <div className="relative h-full w-full">
          <Image
            src="/assets/prototype/docx-derived/play-house-clean.png"
            alt={room.roomTitle}
            fill
            sizes="400px"
            className="pointer-events-none object-contain"
          />
        </div>

        {room.objects.map((object, index) => (
          <ClueObjectMarker
            key={object.id}
            object={object}
            number={index + 1}
            discovered={discoveredIds.has(object.id)}
            selected={selectedClueId === object.id}
            onClick={() => onClueSelect(object)}
          />
        ))}

        {room.imageClue ? (
          <button
            type="button"
            onClick={onEnvelopeOpen}
            className="absolute bottom-[11%] left-1/2 z-20 -translate-x-1/2 outline-none"
            aria-label="查看信封里的照片线索"
          >
            <EnvelopeCard className="h-20 w-40 rotate-[-2deg] transition-transform active:scale-95" />
            <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-cream bg-warm-orange text-cream shadow-[0_0_12px_rgba(255,215,123,0.88)]">
              <ImageIcon className="h-4 w-4" />
            </span>
          </button>
        ) : null}

        <PaperPetButton onOpen={onPetOpen} petType={room.pet.type} petName={room.pet.name} />
      </div>
    </div>
  );
}

export function ClueObjectMarker({
  object,
  number,
  discovered,
  selected,
  onClick
}: {
  object: RoomObject;
  number: number;
  discovered: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`查看线索：${object.name}`}
      className="absolute z-30 -translate-x-1/2 -translate-y-1/2 outline-none"
      style={{ left: `${object.position.x}%`, top: `${object.position.y}%` }}
    >
      <span
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-cream bg-warm-orange/38 text-2xl font-semibold text-cream shadow-[0_0_12px_rgba(255,215,123,0.92)] transition",
          discovered && "bg-warm-orange text-cream shadow-[0_0_18px_rgba(255,215,123,1)]",
          selected && "scale-110"
        )}
      >
        <motion.span
          animate={{ scale: [1, 1.13, 1], opacity: [0.65, 1, 0.75] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[-5px] rounded-full border border-warm-orange/65"
        />
        {discovered ? <Check className="h-6 w-6" /> : number}
      </span>
    </button>
  );
}

export function ClueNotePanel({
  object,
  onClose
}: {
  object: RoomObject;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="absolute bottom-0 left-1/2 z-40 w-full -translate-x-1/2"
    >
      <ClueNote onClose={onClose}>
        <StickerTag tone="sage" className="mb-3 text-sm">
          {object.name}
        </StickerTag>
        <p>{object.clue}</p>
      </ClueNote>
    </motion.div>
  );
}

export function ClueProgressStickers({
  objects,
  discoveredIds
}: {
  objects: RoomObject[];
  discoveredIds: Set<string>;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      {objects.map((object) => {
        const active = discoveredIds.has(object.id);
        return (
          <span
            key={object.id}
            className={cn(
              "torn-edge paper-grain relative flex h-12 w-12 items-center justify-center bg-cream text-coffee/35 shadow-sticker",
              active &&
                "text-warm-orange shadow-[0_0_14px_rgba(236,169,77,0.65),0_7px_13px_rgba(75,45,21,0.18)]"
            )}
            title={object.keyword}
          >
            {getObjectIcon(object.assetKey)}
          </span>
        );
      })}
    </div>
  );
}

export function EnvelopeImageClue({
  imageClue,
  open,
  onClose
}: {
  imageClue: PublicRoomPlayData["imageClue"];
  open: boolean;
  onClose: () => void;
}) {
  if (!imageClue) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-end bg-coffee/28 px-5 pb-20 backdrop-blur-[1px]"
        >
          <motion.div
            initial={{ y: 80, rotate: -1, scale: 0.96 }}
            animate={{ y: 0, rotate: 0, scale: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="relative w-full"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭照片线索"
              className="absolute right-3 top-3 z-20 rounded-full bg-cream/70 p-1 text-coffee"
            >
              <X className="h-5 w-5" />
            </button>
            <TornPaperCard tone="parchment" className="px-6 py-7" tape="corner">
              <div className="flex items-start gap-4">
                <PolaroidCard className="w-40 rotate-[-4deg]" caption={imageClue.caption}>
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageClue.url})` }}
                    role="img"
                    aria-label={imageClue.caption}
                  />
                </PolaroidCard>
                <div className="min-w-0 flex-1 pt-3">
                  <StickerTag tone="sage" className="mb-3">
                    信封照片
                  </StickerTag>
                  <p className="font-serif text-lg leading-8 text-coffee/78">
                    {imageClue.safeDescription}
                  </p>
                </div>
              </div>
            </TornPaperCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function PetCompanion({
  type,
  name
}: {
  type: PublicRoomPlayData["pet"]["type"];
  name: string;
}) {
  const Icon = type === "cat" ? Cat : Dog;
  return (
    <div className="relative">
      <div className="paper-grain flex h-16 w-16 items-center justify-center rounded-full bg-parchment text-coffee shadow-paper">
        <Icon className="h-10 w-10" strokeWidth={1.4} />
      </div>
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-sage px-2 py-0.5 text-[11px] text-cream">
        {name}
      </span>
    </div>
  );
}

function PaperPetButton({
  onOpen,
  petType,
  petName
}: {
  onOpen: () => void;
  petType: PublicRoomPlayData["pet"]["type"];
  petName: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="absolute bottom-[33%] right-[32%] z-20 outline-none"
      aria-label={`和${petName}说话`}
    >
      <PetCompanion type={petType} name={petName} />
      <span className="absolute -right-5 -top-5 torn-edge paper-grain bg-cream px-2 py-1 text-xs font-serif shadow-sticker">
        知道一点点
      </span>
    </button>
  );
}

export function PetHintChatSheet({
  pet,
  open,
  onClose
}: {
  pet: PublicRoomPlayData["pet"];
  open: boolean;
  onClose: () => void;
}) {
  const lines =
    pet.type === "cat"
      ? [
          "喵……那封信好像一直没有寄出去。",
          "我只能提醒一点点，秘密要你自己靠近。",
          "那个钟，好像总是在往回走。"
        ]
      : [
          "汪……窗边那盆植物一直朝着光。",
          "我知道一些事，但不能直接说破。",
          "椅子上的纸条，像一句没说完的话。"
        ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-end bg-coffee/24 px-5 pb-20 backdrop-blur-[1px]"
        >
          <motion.div
            initial={{ y: 80, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full"
          >
            <TornPaperCard tone="cream" className="px-5 py-6" tape="corner">
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭宠物提示"
                className="absolute right-4 top-4 rounded-full text-coffee/70"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="mb-4 flex items-center gap-3">
                <PetCompanion type={pet.type} name={pet.name} />
                <div>
                  <StickerTag tone="sage" className="mb-2">
                    解谜小伙伴
                  </StickerTag>
                  <p className="font-serif text-base text-coffee/64">{pet.mood}</p>
                </div>
              </div>
              <div className="space-y-3">
                {lines.map((line, index) => (
                  <motion.div
                    key={line}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.12, duration: 0.24 }}
                    className="torn-edge paper-grain max-w-[92%] bg-parchment px-4 py-3 font-serif text-lg leading-8 shadow-sticker"
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
            </TornPaperCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function GuessEntryButton({
  disabled,
  onClick
}: {
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <PaperButton className="mb-12 mt-7" withTape disabled={disabled} onClick={onClick}>
      我好像猜到了
      <HanddrawnIcons.Heart className="h-7 w-7 text-warm-orange" />
    </PaperButton>
  );
}

function getObjectIcon(assetKey: RoomObject["assetKey"]) {
  const className = "h-7 w-7";
  switch (assetKey) {
    case "envelope":
      return <Mail className={className} strokeWidth={1.4} />;
    case "clock":
      return <Clock3 className={className} strokeWidth={1.4} />;
    case "plant":
      return <Leaf className={className} strokeWidth={1.4} />;
    case "window":
      return <Moon className={className} strokeWidth={1.4} />;
    case "chair-note":
      return <MessageCircle className={className} strokeWidth={1.4} />;
  }
}

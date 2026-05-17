"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Flower2, Heart, House, Paperclip } from "lucide-react";
import { HanddrawnIconButton } from "@/components/handbook/handdrawn-icon-button";
import { PaperButton } from "@/components/handbook/paper-button";
import { StickerTag } from "@/components/handbook/sticker-tag";
import { Tape } from "@/components/handbook/tape";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import { AppShell } from "@/components/layout/app-shell";
import { PaperPage } from "@/components/layout/paper-page";
import { NotebookTextarea } from "@/components/ui/notebook-textarea";
import { EnvelopeImageUpload } from "@/components/heart-cabin/envelope-image-upload";
import { Stamp } from "@/components/heart-cabin/decorations";
import type { MoodTag } from "@/lib/contracts";
import { useCreateRoomDraft } from "@/lib/use-create-room-draft";
import { cn } from "@/lib/utils";

const moodTags: { label: MoodTag; tone: "sage" | "parchment" | "rose" }[] = [
  { label: "想念", tone: "sage" },
  { label: "压力", tone: "parchment" },
  { label: "吐槽", tone: "parchment" },
  { label: "暗恋", tone: "rose" },
  { label: "小确幸", tone: "sage" }
];

export function CreatePage() {
  const router = useRouter();
  const { draft, setSentence, toggleMoodTag, setEnvelopeImage, clearEnvelopeImage } =
    useCreateRoomDraft();
  const sentenceLength = draft.sentence.trim().length;
  const isTooShort = sentenceLength < 8;
  const isTooLong = sentenceLength > 40;
  const canGenerate = !isTooShort && !isTooLong;

  function handleGenerate() {
    if (!canGenerate) return;
    router.push("/generating");
  }

  return (
    <AppShell>
      <PaperPage className="pt-16">
        <Tape className="left-16 top-11" />
        <header className="relative mb-6 text-center">
          <HanddrawnIconButton
            icon={<ArrowLeft className="h-7 w-7" />}
            label="返回首页"
            onClick={() => router.push("/")}
            className="absolute left-0 top-0"
          />
          <h1 className="soft-title pt-3 text-[34px] leading-tight">写下心事</h1>
          <div className="mx-auto mt-2 flex w-36 items-center justify-center gap-2 text-coffee/36">
            <span className="h-px flex-1 bg-coffee/22" />
            <Flower2 className="h-5 w-5" strokeWidth={1.4} />
            <span className="h-px flex-1 bg-coffee/22" />
          </div>
          <Stamp className="absolute right-2 top-0" />
        </header>

        <div className="relative">
          <Paperclip
            className="absolute -left-1 -top-4 z-20 h-12 w-12 rotate-12 text-coffee/42"
            strokeWidth={1.5}
          />
          <Tape className="right-2 top-3 rotate-[13deg]" />
          <NotebookTextarea
            value={draft.sentence}
            onChange={(event) => setSentence(event.target.value)}
            placeholder="写下一句不太好意思直接说的话……"
            aria-label="写下心事"
          />
        </div>

        <p
          className={cn(
            "mt-5 text-center font-serif text-lg text-coffee/70",
            isTooLong && "text-brick-red"
          )}
        >
          {isTooLong ? "这句话已经有点满啦，试着把它轻轻收成 40 字以内。" : "小提示：8–40 字会更适合藏进小屋"}
        </p>

        <section className="mt-8">
          <StickerTag icon={<Flower2 className="h-5 w-5" />} className="mb-5 text-lg soft-title">
            选择心事风格（可多选）
          </StickerTag>
          <div className="grid grid-cols-3 gap-4">
            {moodTags.map(({ label, tone }) => {
              const selected = draft.moodTags.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleMoodTag(label)}
                  aria-pressed={selected}
                  className={cn(
                    "torn-edge paper-grain py-3 soft-title text-2xl shadow-sticker transition active:translate-y-0.5",
                    tone === "sage" && "bg-sage/24 text-coffee",
                    tone === "parchment" && "bg-parchment text-coffee",
                    tone === "rose" && "bg-[#e8b6a7]/70 text-coffee",
                    selected && "bg-sage text-cream shadow-[0_0_0_2px_rgba(255,245,223,0.75),0_8px_16px_rgba(72,45,24,0.18)]",
                    label === "暗恋" && "col-start-1 col-end-3 mx-8"
                  )}
                >
                  {label}
                  {selected ? <Heart className="ml-1 inline h-5 w-5 text-warm-orange" /> : null}
                </button>
              );
            })}
          </div>
        </section>

        <EnvelopeImageUpload
          className="mt-8"
          image={draft.envelopeImage}
          onImageChange={setEnvelopeImage}
          onImageRemove={clearEnvelopeImage}
        />

        <TornPaperCard
          tone="parchment"
          className="mt-8 px-8 py-5 text-center font-serif text-xl leading-8"
          tape="corner"
        >
          它不会被直接展示给朋友，AI 会把它变成房间里的线索。
        </TornPaperCard>

        <PaperButton
          className="mb-12 mt-8"
          withTape
          disabled={!canGenerate}
          icon={<House className="h-8 w-8" />}
          onClick={handleGenerate}
        >
          生成我的心事小屋
          <ChevronRight className="h-7 w-7" />
        </PaperButton>
      </PaperPage>
    </AppShell>
  );
}

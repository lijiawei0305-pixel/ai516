"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { IllustrationStage } from "@/components/layout/illustration-stage";
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

const CREATE_ART = "/assets/prototype/docx-derived/create-clean.webp";
const IMG_W = 941;
const IMG_H = 1576;

const tagPositions: Record<
  MoodTag,
  { left: string; top: string; width: string; height: string; selectedTint: string }
> = {
  想念: { left: "14.8%", top: "54.5%", width: "21%", height: "6.8%", selectedTint: "bg-[#dfe4cf]/72" },
  压力: { left: "42.7%", top: "54.8%", width: "21.6%", height: "6.7%", selectedTint: "bg-[#ead4b2]/70" },
  吐槽: { left: "66.6%", top: "54.6%", width: "20.7%", height: "6.8%", selectedTint: "bg-[#e5c59a]/68" },
  暗恋: { left: "25.3%", top: "63.4%", width: "27.7%", height: "6.8%", selectedTint: "bg-[#efc8bf]/72" },
  小确幸: { left: "54.5%", top: "63.3%", width: "24.8%", height: "6.8%", selectedTint: "bg-[#d8dcbc]/72" }
};

export function CreatePage() {
  const router = useRouter();
  const inputId = useId();
  const { draft, setSentence, toggleMoodTag, setEnvelopeImage, clearEnvelopeImage } =
    useCreateRoomDraft();
  const [showHint, setShowHint] = useState(false);
  const sentenceLength = draft.sentence.trim().length;
  const isTooShort = sentenceLength < 8;
  const isTooLong = sentenceLength > 40;
  const canGenerate = !isTooShort && !isTooLong;

  function handleGenerate() {
    if (!canGenerate) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 2000);
      return;
    }
    router.push("/generating");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (draft.envelopeImage?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(draft.envelopeImage.previewUrl);
    }

    setEnvelopeImage({
      name: file.name,
      type: file.type,
      size: file.size,
      previewUrl: URL.createObjectURL(file)
    });

    event.target.value = "";
  }

  function handleRemoveImage() {
    if (draft.envelopeImage?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(draft.envelopeImage.previewUrl);
    }

    clearEnvelopeImage();
  }

  return (
    <AppShell className="bg-[#3b2417]">
      <IllustrationStage artSrc={CREATE_ART} artAlt="写下心事页面" artWidth={IMG_W} artHeight={IMG_H}>
        <input id={inputId} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />

        <Link
          href="/"
          aria-label="返回首页"
          className="absolute z-10 left-[5.4%] top-[3.3%] block h-[5.6%] w-[13.1%] touch-manipulation rounded-[16px] outline-none transition-all duration-150 active:scale-95 active:brightness-90 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[#f4ead7]"
        >
          <span className="sr-only">返回首页</span>
        </Link>

        <label
          htmlFor={inputId}
          aria-label={draft.envelopeImage ? "更换线索图片" : "选择线索图片"}
          className="absolute z-10 left-[13.7%] top-[71.9%] block h-[11.2%] w-[74.9%] cursor-pointer rounded-[18px] outline-none transition focus-within:ring-2 focus-within:ring-[#f4ead7]"
        >
          {draft.envelopeImage ? (
            <div className="relative flex h-full items-center gap-3 rounded-[18px] bg-[#e8d5b7]/90 px-[9%]">
              <div className="relative h-[68%] w-[28%] overflow-hidden rounded-[10px] shadow-[0_8px_18px_rgba(72,45,24,0.18)]">
                <Image
                  src={draft.envelopeImage.previewUrl}
                  alt="已选择的线索图片"
                  fill
                  sizes="140px"
                  className="pointer-events-none object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 pr-8">
                <p className="truncate font-serif text-sm text-coffee/72">{draft.envelopeImage.name}</p>
                <p className="mt-1 text-xs text-coffee/52">点击更换图片</p>
              </div>
              <button
                type="button"
                aria-label="移除图片"
                onClick={(event) => {
                  event.preventDefault();
                  handleRemoveImage();
                }}
                className="absolute right-[8%] top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#efe3c6]/88 text-coffee/70 shadow-[0_6px_14px_rgba(72,45,24,0.12)] outline-none focus-visible:ring-2 focus-visible:ring-[#f4ead7]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </label>

        <textarea
          value={draft.sentence}
          onChange={(event) => setSentence(event.target.value)}
          aria-label="写下心事"
          className={cn(
            "absolute z-10 left-[11.8%] top-[17.3%] h-[25.9%] w-[76.4%] resize-none bg-transparent px-3 py-3 font-serif text-[clamp(18px,2.6vw,22px)] leading-[1.9] text-coffee/88 outline-none placeholder:text-transparent",
            isTooLong && "text-[#9f513f]"
          )}
          placeholder="写下一句不太好意思直接说的话……"
        />

        {sentenceLength > 0 || isTooLong ? (
          <div
            className={cn(
              "absolute z-10 right-[13.4%] top-[44.6%] rounded-full px-3 py-1 text-xs tracking-wide",
              isTooLong ? "bg-[#b0604b]/20 text-[#8f4738]" : "bg-[#efe3c6]/72 text-coffee/55"
            )}
          >
            {sentenceLength}/40
          </div>
        ) : null}

        {moodTags.map(({ label }) => {
          const selected = draft.moodTags.includes(label);
          const position = tagPositions[label];

          return (
            <button
              key={label}
              type="button"
              onClick={() => toggleMoodTag(label)}
              aria-pressed={selected}
              aria-label={`选择${label}`}
              className={cn(
                "absolute z-10 rounded-[18px] touch-manipulation outline-none transition-all duration-200 ease-out",
                "active:scale-[0.93] active:brightness-95",
                "focus-visible:ring-2 focus-visible:ring-[#f4ead7]",
                selected
                  ? "scale-[1.05] shadow-[0_6px_20px_rgba(72,45,24,0.22),inset_0_0_0_2px_rgba(139,154,107,0.6)]"
                  : "hover:scale-[1.04] hover:shadow-[0_4px_14px_rgba(72,45,24,0.14)] hover:brightness-105"
              )}
              style={{
                left: position.left,
                top: position.top,
                width: position.width,
                height: position.height
              }}
            >
              {selected ? (
                <span className={cn(
                  "pointer-events-none absolute inset-0 rounded-[18px] border-2 border-[#8b9a6b]/70 shadow-[inset_0_0_8px_rgba(139,154,107,0.3)]",
                  position.selectedTint
                )} />
              ) : null}
              <span className="sr-only">{label}</span>
            </button>
          );
        })}

        <button
          type="button"
          aria-label="生成我的心事小屋"
          onClick={handleGenerate}
          className={cn(
            "absolute z-10 left-[13.6%] top-[88.4%] flex h-[8.2%] w-[72.2%] touch-manipulation items-center justify-center rounded-[20px] outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#f4ead7]",
            canGenerate
              ? "active:scale-[0.96] active:brightness-90 hover:scale-[1.02] hover:brightness-105 hover:shadow-[0_6px_20px_rgba(72,45,24,0.2)]"
              : "active:scale-[0.97] opacity-75"
          )}
        />

        {showHint && (
          <div className="absolute z-20 left-1/2 top-[86%] -translate-x-1/2 animate-[fadeIn_0.15s_ease-out] rounded-full bg-[#3f2718]/88 px-4 py-2 text-xs text-[#f4ead7] shadow-lg">
            {isTooShort ? "再多写几个字吧（至少8个字）" : "心事太长啦（最多40个字）"}
          </div>
        )}
      </IllustrationStage>
    </AppShell>
  );
}

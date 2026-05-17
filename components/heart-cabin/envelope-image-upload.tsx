"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useId, useRef } from "react";
import { HanddrawnIconButton } from "@/components/handbook/handdrawn-icon-button";
import { PolaroidCard } from "@/components/handbook/polaroid-card";
import { StickerTag } from "@/components/handbook/sticker-tag";
import { Tape } from "@/components/handbook/tape";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import type { CreateRoomDraft } from "@/lib/contracts";
import { cn } from "@/lib/utils";

type EnvelopeImageUploadProps = {
  image: CreateRoomDraft["envelopeImage"];
  onImageChange: (image: NonNullable<CreateRoomDraft["envelopeImage"]>) => void;
  onImageRemove: () => void;
  className?: string;
};

export function EnvelopeImageUpload({
  image,
  onImageChange,
  onImageRemove,
  className
}: EnvelopeImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (image?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(image.previewUrl);
    }

    onImageChange({
      name: file.name,
      type: file.type,
      size: file.size,
      previewUrl: URL.createObjectURL(file)
    });

    event.target.value = "";
  }

  function handleRemove() {
    if (image?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(image.previewUrl);
    }

    onImageRemove();
  }

  return (
    <section className={cn("relative", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />

      {!image ? (
        <label
          htmlFor={inputId}
          className="group relative block cursor-pointer"
          aria-label="选择一张照片放进信封"
        >
          <Tape className="right-5 top-0 h-6 w-20 rotate-[12deg]" />
          <div className="relative min-h-44 overflow-visible rounded-[4px] bg-parchment px-5 pb-5 pt-7 shadow-paper">
            <div className="absolute inset-x-0 top-0 h-24 origin-top skew-y-[-6deg] border-b border-coffee/14 bg-cream/36" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(142deg,transparent_49%,rgba(90,59,31,0.14)_50%,transparent_51%),linear-gradient(218deg,transparent_49%,rgba(90,59,31,0.12)_50%,transparent_51%)]" />
            <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cream/55 text-sage shadow-insetPaper transition-transform group-active:scale-95">
              <ImagePlus className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <p className="relative z-10 mx-auto mt-4 max-w-[260px] text-center font-serif text-lg leading-8 text-coffee/76">
              放一张照片进信封，作为朋友解谜的小线索
            </p>
            <StickerTag tone="sage" className="relative z-10 mx-auto mt-4 flex w-fit">
              选择图片
            </StickerTag>
          </div>
        </label>
      ) : (
        <TornPaperCard tone="parchment" className="relative min-h-56 px-5 py-6" tape="corner">
          <div className="flex items-start gap-4">
            <PolaroidCard className="w-36 rotate-[-4deg]" caption="线索照片">
              <div
                aria-label="放进信封的线索照片"
                role="img"
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${image.previewUrl})` }}
              />
            </PolaroidCard>
            <div className="min-w-0 flex-1 pt-3">
              <StickerTag tone="sage" className="mb-3">
                已放进信封
              </StickerTag>
              <p className="break-words font-serif text-base leading-7 text-coffee/75">{image.name}</p>
              <HanddrawnIconButton
                icon={<Trash2 className="h-5 w-5" />}
                label="移除图片"
                onClick={handleRemove}
                className="mt-4 h-10 w-10"
              />
            </div>
          </div>
        </TornPaperCard>
      )}

      <p className="mt-3 text-center font-serif text-base leading-7 text-coffee/64">
        图片不会直接公开答案，只会作为房间里的辅助线索
      </p>
    </section>
  );
}

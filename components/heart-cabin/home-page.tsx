"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Flower2, Heart, KeyRound, Lock, Paperclip } from "lucide-react";
import { EnvelopeCard } from "@/components/handbook/envelope-card";
import { PaperButton } from "@/components/handbook/paper-button";
import { PolaroidCard } from "@/components/handbook/polaroid-card";
import { StickerTag } from "@/components/handbook/sticker-tag";
import { Tape } from "@/components/handbook/tape";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import { AppShell } from "@/components/layout/app-shell";
import { PaperPage } from "@/components/layout/paper-page";
import { MiniCabin, MiniWindow, Stamp } from "@/components/heart-cabin/decorations";

export function HomePage() {
  const router = useRouter();

  return (
    <AppShell>
      <PaperPage className="pt-20" innerClassName="flex min-h-[calc(100dvh-7rem)] flex-col">
        <Tape className="left-16 top-12" />
        <Stamp className="absolute right-8 top-16" />

        <section className="text-center">
          <p className="soft-title text-2xl">《心事小屋》</p>
          <div className="mx-auto mt-3 flex w-32 items-center gap-2 text-coffee/32">
            <span className="h-px flex-1 bg-coffee/24" />
            <Flower2 className="h-4 w-4" />
            <span className="h-px flex-1 bg-coffee/24" />
          </div>
          <h1 className="soft-title mt-10 text-[44px] leading-[1.18]">
            把一句话，
            <br />
            藏进一间小屋
            <Heart className="mb-1 ml-2 inline h-8 w-8 text-warm-orange" strokeWidth={1.8} />
          </h1>
          <p className="mx-auto mt-8 max-w-[290px] font-serif text-xl leading-9 text-coffee/78">
            写下一句不太好意思直接说的话，让 AI 把它变成一间可以被朋友破解的秘密小屋。
          </p>
        </section>

        <section aria-label="旧手账上的纸板小屋" className="relative mt-8 min-h-[330px] flex-1">
          <PolaroidCard className="absolute left-1 top-12 w-28" caption="Shhhh...">
            <MiniWindow />
          </PolaroidCard>
          <TornPaperCard
            className="absolute right-0 top-10 w-28 rotate-[8deg] p-3 font-serif text-base leading-7"
            tone="parchment"
            tape="corner"
          >
            每一句心事，都值得被温柔地收藏。
          </TornPaperCard>
          <MiniCabin className="absolute bottom-7 left-1/2 -translate-x-1/2 scale-[1.18]" />
          <EnvelopeCard className="absolute bottom-0 left-4 w-48 -rotate-3" />
          <KeyRound className="absolute bottom-9 right-20 h-12 w-12 rotate-[-18deg] text-coffee/65" strokeWidth={1.5} />
          <Paperclip className="absolute bottom-1 right-11 h-9 w-9 rotate-12 text-coffee/40" strokeWidth={1.5} />
          <TornPaperCard className="absolute bottom-0 right-0 w-32 p-3 font-serif text-base leading-7" tape="top">
            <StickerTag tone="sage" className="mb-1 text-xs">
              小提示
            </StickerTag>
            真心话，往往藏在不显眼的地方。
          </TornPaperCard>
        </section>

        <div className="mb-12 mt-4 space-y-4">
          <PaperButton
            withTape
            icon={<Flower2 className="h-7 w-7" />}
            onClick={() => router.push("/create")}
          >
            把心事藏起来
            <ChevronRight className="h-7 w-7" />
          </PaperButton>
          <PaperButton variant="paper" icon={<Paperclip className="h-8 w-8" />}>
            看看别人怎么藏
            <ChevronRight className="h-7 w-7" />
          </PaperButton>
          <p className="flex items-center justify-center gap-3 text-center text-sm text-parchment">
            <Lock className="h-4 w-4" />
            朋友只能看到线索，猜对后才会靠近真相
          </p>
        </div>
      </PaperPage>
    </AppShell>
  );
}

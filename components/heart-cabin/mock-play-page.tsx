"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import { HanddrawnIconButton } from "@/components/handbook/handdrawn-icon-button";
import { PaperButton } from "@/components/handbook/paper-button";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import { AppShell } from "@/components/layout/app-shell";
import { PaperPage } from "@/components/layout/paper-page";
import { MiniCabin, Stamp } from "@/components/heart-cabin/decorations";

export function MockPlayPage() {
  const router = useRouter();

  return (
    <AppShell>
      <PaperPage className="pt-16">
        <header className="relative mb-8 text-center">
          <HanddrawnIconButton
            icon={<ArrowLeft className="h-7 w-7" />}
            label="返回创建页"
            onClick={() => router.push("/create")}
            className="absolute left-0 top-0"
          />
          <Stamp className="absolute right-2 top-0" />
          <h1 className="soft-title pt-14 text-[34px] leading-tight">秘密小屋搭好了</h1>
        </header>

        <section className="relative mx-auto mt-16 h-72">
          <MiniCabin className="absolute left-1/2 top-10 -translate-x-1/2 scale-[1.3]" />
          <Sparkles className="absolute right-16 top-6 h-8 w-8 text-warm-orange" />
        </section>

        <TornPaperCard tone="cream" className="mt-6 px-7 py-6 text-center font-serif text-xl leading-9" tape="corner">
          这里是 mock 房间页。后续会接入真实的房间探索、线索物件和宠物对话。
        </TornPaperCard>

        <PaperButton className="mb-12 mt-8" withTape icon={<Home className="h-7 w-7" />} onClick={() => router.push("/")}>
          回到首页
        </PaperButton>
      </PaperPage>
    </AppShell>
  );
}

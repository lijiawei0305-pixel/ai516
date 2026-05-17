"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, Loader2, PenLine, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { HanddrawnIcons } from "@/components/handbook/handdrawn-assets";
import { HanddrawnIconButton } from "@/components/handbook/handdrawn-icon-button";
import { PaperButton } from "@/components/handbook/paper-button";
import { StickerTag } from "@/components/handbook/sticker-tag";
import { Tape } from "@/components/handbook/tape";
import { TornPaperCard } from "@/components/handbook/torn-paper-card";
import { AppShell } from "@/components/layout/app-shell";
import { PaperPage } from "@/components/layout/paper-page";
import { useGuessFlow } from "@/lib/use-guess-flow";
import { cn } from "@/lib/utils";
import { prototypeBackgrounds } from "@/lib/prototype-backgrounds";
import type { GetRoomPlayResponse } from "@/lib/contracts/api";

type GuessPageProps = {
  roomId: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; room: GetRoomPlayResponse }
  | { status: "error"; message: string };

export function GuessPage({ roomId }: GuessPageProps) {
  const router = useRouter();
  const setLastSubmission = useGuessFlow((state) => state.setLastSubmission);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [ownGuess, setOwnGuess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRoom() {
      try {
        const response = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/play`, {
          cache: "no-store"
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error?.message ?? "无法加载房间数据");
        }

        const room = (await response.json()) as GetRoomPlayResponse;

        if (!cancelled) {
          setState({ status: "ready", room });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "无法加载房间数据"
          });
        }
      }
    }

    loadRoom();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  async function handleSubmit() {
    if (state.status !== "ready") return;
    if (selectedChoiceIndex === null && !ownGuess.trim()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    const discoveredObjectIds = state.room.objects
      .filter((obj) => obj.discovered)
      .map((obj) => obj.id);

    setLastSubmission({
      roomId,
      selectedOptionId: selectedChoiceIndex !== null ? String(selectedChoiceIndex) : "",
      ownGuess,
      discoveredObjectIds
    });

    try {
      const response = await fetch("/api/guesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          shareToken: null,
          selectedObjectIds: discoveredObjectIds,
          selectedChoiceIndex,
          freeTextGuess: ownGuess.trim() || null,
          petConversationSummary: null
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? "提交失败，请重试");
      }

      const result = await response.json();
      router.push(`/result/${result.guessId}`);
    } catch (error) {
      setIsSubmitting(false);
      alert(error instanceof Error ? error.message : "提交失败，请重试");
    }
  }

  if (state.status === "loading") {
    return (
      <AppShell>
        <PaperPage backgroundSrc={prototypeBackgrounds.result} className="flex min-h-screen items-center justify-center pt-14">
          <TornPaperCard tone="cream" className="p-8 text-center font-serif text-xl leading-9" tape="corner">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-coffee/50" />
            正在准备猜想页面……
          </TornPaperCard>
        </PaperPage>
      </AppShell>
    );
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <PaperPage backgroundSrc={prototypeBackgrounds.result} className="flex min-h-screen items-center justify-center pt-14">
          <TornPaperCard tone="cream" className="p-8 text-center font-serif text-xl leading-9" tape="corner">
            {state.message}
            <PaperButton className="mt-7" variant="paper" onClick={() => router.push(`/rooms/${roomId}/play`)}>
              返回小屋
            </PaperButton>
          </TornPaperCard>
        </PaperPage>
      </AppShell>
    );
  }

  const { room } = state;
  const choices = room.choices ?? [];
  const clues = room.objects.map((obj) => ({
    id: obj.id,
    name: obj.name ?? obj.title,
    clue: obj.clue ?? obj.description
  }));

  return (
    <AppShell>
      <PaperPage backgroundSrc={prototypeBackgrounds.result} className="pt-14">
        <Tape className="left-16 top-11" />
        <header className="relative mb-6 text-center">
          <HanddrawnIconButton
            icon={<ArrowLeft className="h-7 w-7" />}
            label="返回小屋"
            onClick={() => router.push(`/rooms/${roomId}/play`)}
            className="absolute left-0 top-0"
          />
          <h1 className="soft-title pt-3 text-[34px] leading-tight">交出你的猜想</h1>
          <div className="mx-auto mt-2 flex w-36 items-center justify-center gap-2 text-coffee/36">
            <span className="h-px flex-1 bg-coffee/22" />
            <HanddrawnIcons.Flower className="h-5 w-5" />
            <span className="h-px flex-1 bg-coffee/22" />
          </div>
        </header>

        <section>
          <StickerTag tone="sage" className="mb-4 text-base">
            已收集到的线索
          </StickerTag>
          <div className="space-y-3">
            {clues.map((clue, index) => (
              <TornPaperCard key={clue.id} tone="cream" className="flex items-start gap-3 px-4 py-3">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage text-sm text-cream">
                  {index + 1}
                </span>
                <div>
                  <p className="soft-title text-lg">{clue.name}</p>
                  <p className="font-serif text-base leading-7 text-coffee/70">{clue.clue}</p>
                </div>
              </TornPaperCard>
            ))}
          </div>
        </section>

        {choices.length > 0 && (
          <section className="mt-8">
            <StickerTag icon={<HanddrawnIcons.Heart className="h-4 w-4" />} className="mb-4 text-base">
              你觉得它更像哪一句？
            </StickerTag>
            <div className="space-y-4">
              {choices.map((choice) => {
                const selected = selectedChoiceIndex === choice.index;
                return (
                  <button
                    key={choice.index}
                    type="button"
                    onClick={() => setSelectedChoiceIndex(choice.index)}
                    className={cn(
                      "torn-edge paper-grain w-full bg-parchment px-5 py-4 text-left shadow-sticker transition-all duration-200 active:scale-[0.98]",
                      selected &&
                        "bg-sage text-cream shadow-[0_0_0_2px_rgba(255,245,223,0.72),0_10px_18px_rgba(72,45,24,0.2)]"
                    )}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-coffee/20 transition-colors duration-200",
                          selected && "border-cream bg-warm-orange"
                        )}
                      >
                        {selected ? <Check className="h-4 w-4" /> : null}
                      </span>
                      <span>
                        <span className="block soft-title text-xl leading-8">{choice.label}</span>
                        {choice.description && (
                          <span className={cn("mt-1 block font-serif text-base leading-7 text-coffee/62", selected && "text-cream/82")}>
                            {choice.description}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-8">
          <StickerTag icon={<PenLine className="h-4 w-4" />} className="mb-4 text-base">
            也可以写一句自己的猜测
          </StickerTag>
          <textarea
            value={ownGuess}
            onChange={(event) => setOwnGuess(event.target.value.slice(0, 80))}
            placeholder="我觉得这句话可能是在说……"
            className="lined-paper paper-grain min-h-36 w-full resize-none rounded-[3px] border-0 bg-cream/92 px-6 py-6 font-serif text-lg leading-[34px] text-coffee shadow-paper outline-none placeholder:text-coffee/42 focus:ring-2 focus:ring-warm-orange/35"
          />
        </section>

        <TornPaperCard tone="parchment" className="mt-7 px-6 py-4 text-center font-serif text-lg leading-8" tape="corner">
          提交后，房间主人可以看到你的猜测记录。
        </TornPaperCard>

        <PaperButton
          className="mb-12 mt-7"
          withTape
          disabled={(selectedChoiceIndex === null && !ownGuess.trim()) || isSubmitting}
          icon={isSubmitting ? <Loader2 className="h-7 w-7 animate-spin" /> : <Send className="h-7 w-7" />}
          onClick={handleSubmit}
        >
          {isSubmitting ? "正在交给小屋" : "交出我的猜想"}
          {!isSubmitting && <ChevronRight className="h-7 w-7" />}
        </PaperButton>
      </PaperPage>
    </AppShell>
  );
}

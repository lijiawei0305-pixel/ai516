"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { IllustrationStage } from "@/components/layout/illustration-stage";
import { useCreateRoomDraft } from "@/lib/use-create-room-draft";

const GENERATING_ART = "/assets/prototype/docx-derived/generating-clean.webp";
const IMG_W = 941;
const IMG_H = 1576;
const GENERATION_TIMEOUT_MS = 240000;

const PROGRESS_STEPS = [
  "正在酝酿小屋的灵感…",
  "正在搭建小屋的框架…",
  "正在布置小屋的细节…",
  "快好了，再等一下…"
];

export function GeneratingPage() {
  const router = useRouter();
  const { draft, resetDraft } = useCreateRoomDraft();
  const [error, setError] = useState<string | null>(null);
  const [progressIdx, setProgressIdx] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgressIdx((i) => Math.min(i + 1, PROGRESS_STEPS.length - 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const sentence = draft.sentence.trim();

    if (!sentence) {
      router.replace("/create");
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

    async function generateRoom() {
      const response = await fetch("/api/rooms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          sentence,
          emotionTags: draft.moodTags.length > 0 ? draft.moodTags : ["秘密"],
          imageAssetId: null,
          visibility: "unlisted"
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const details =
          typeof payload?.error?.details === "string"
            ? payload.error.details
            : null;
        throw new Error(details || payload?.error?.message || "生成失败，请稍后再试。");
      }

      const payload = (await response.json()) as { redirectUrl?: string };
      resetDraft();
      router.replace(payload.redirectUrl ?? "/");
    }

    generateRoom().catch((reason) => {
      clearTimeout(timeout);
      if (reason instanceof DOMException && reason.name === "AbortError") {
        setError("生成超时了，请返回重试。");
      } else {
        setError(reason instanceof Error ? reason.message : "生成失败，请稍后再试。");
      }
    });

    return () => {
      clearTimeout(timeout);
    };
  }, [draft.moodTags, draft.sentence, resetDraft, router]);

  return (
    <AppShell className="bg-[#3b2417]">
      <IllustrationStage artSrc={GENERATING_ART} artAlt="正在生成小屋" artWidth={IMG_W} artHeight={IMG_H}>
        <div aria-live="polite" className="sr-only">
          {error ?? PROGRESS_STEPS[progressIdx]}
        </div>

        <Link
          href="/create"
          aria-label="返回创建页"
          className="absolute z-10 left-[5.2%] top-[2.8%] block h-[5.8%] w-[14.2%] touch-manipulation rounded-[16px] outline-none transition-all duration-150 active:scale-95 active:brightness-90 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[#f4ead7]"
        >
          <span className="sr-only">返回创建页</span>
        </Link>

        {!error && (
          <div className="absolute z-10 left-1/2 top-[62%] -translate-x-1/2">
            <div className="rounded-full bg-[#3b2417]/75 px-5 py-2.5 backdrop-blur-sm">
              <p className="whitespace-nowrap font-serif text-sm text-[#f4ead7]">
                {PROGRESS_STEPS[progressIdx]}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute z-10 inset-x-[9%] top-[60%] rounded-[24px] bg-[#f6ecd7]/92 px-6 py-5 text-center shadow-[0_16px_32px_rgba(72,45,24,0.18)]">
            <p className="font-serif text-base leading-7 text-[#8f4738]">{error}</p>
            <Link
              href="/create"
              className="mt-4 inline-flex touch-manipulation items-center gap-2 rounded-full bg-[#8f9978] px-5 py-3 font-serif text-base text-[#f7efde] shadow-sticker outline-none transition-all duration-200 hover:scale-[1.02] hover:shadow-paper active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#f4ead7]"
            >
              回到信纸重试
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </IllustrationStage>
    </AppShell>
  );
}

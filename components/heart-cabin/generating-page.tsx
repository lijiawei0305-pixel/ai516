"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useCreateRoomDraft } from "@/lib/use-create-room-draft";

const GENERATING_ART = "/assets/prototype/docx-derived/generating-clean.png";

export function GeneratingPage() {
  const router = useRouter();
  const { draft, resetDraft } = useCreateRoomDraft();
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const sentence = draft.sentence.trim();

    if (!sentence) {
      router.replace("/create");
      return;
    }

    async function generateRoom() {
      const response = await fetch("/api/rooms/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sentence,
          emotionTags: draft.moodTags.length > 0 ? draft.moodTags : ["秘密"],
          imageAssetId: null,
          visibility: "unlisted"
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? "生成失败，请稍后再试。");
      }

      const payload = (await response.json()) as {
        redirectUrl?: string;
      };

      resetDraft();
      router.replace(payload.redirectUrl ?? "/");
    }

    generateRoom().catch((reason) => {
      setError(reason instanceof Error ? reason.message : "生成失败，请稍后再试。");
    });
  }, [draft.moodTags, draft.sentence, resetDraft, router]);

  return (
    <AppShell className="bg-[#3b2417]">
      <main className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-y-auto">
        <div className="relative min-h-dvh w-full">
          <Image
            src={GENERATING_ART}
            alt="正在把心事藏进小屋的原型底图"
            fill
            priority
            sizes="430px"
            className="object-cover"
          />

          <div aria-live="polite" className="sr-only">
            {error ?? "正在把心事藏进小屋"}
          </div>

          <button
            type="button"
            aria-label="返回创建页"
            onClick={() => router.push("/create")}
            className="absolute left-[5.2%] top-[2.8%] h-[5.8%] w-[14.2%] rounded-[16px] outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#f4ead7]"
          />

          {error ? (
            <div className="absolute inset-x-[9%] bottom-[8.3%] rounded-[24px] bg-[#f6ecd7]/92 px-6 py-5 text-center shadow-[0_16px_32px_rgba(72,45,24,0.18)]">
              <p className="font-serif text-base leading-7 text-[#8f4738]">{error}</p>
              <button
                type="button"
                onClick={() => router.push("/create")}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#8f9978] px-5 py-3 font-serif text-base text-[#f7efde] outline-none transition active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#f4ead7]"
              >
                回到信纸重试
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </AppShell>
  );
}

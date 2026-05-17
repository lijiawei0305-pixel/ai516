"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

const HOME_ART = "/assets/prototype/docx-derived/home-clean.webp";
const IMG_W = 941;
const IMG_H = 1576;

export function HomePage() {
  const router = useRouter();

  return (
    <AppShell className="bg-[#3b2417]">
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center overflow-y-auto">
        <div
          className="relative w-full"
          style={{ aspectRatio: `${IMG_W} / ${IMG_H}` }}
        >
          <Image
            src={HOME_ART}
            alt="心事小屋首页"
            fill
            priority
            sizes="(max-width: 430px) 100vw, 430px"
            className="pointer-events-none object-contain"
          />

          <div className="sr-only">
            <h1>把一句话，藏进一间小屋</h1>
            <p>写下一句不太好意思直接说的话，让 AI 把它变成一间可以被朋友破解的秘密小屋。</p>
          </div>

          <button
            type="button"
            aria-label="把心事藏起来"
            onClick={() => router.push("/create")}
            className="absolute z-10 left-1/2 -translate-x-1/2 top-[76%] h-[7.5%] w-[74%] rounded-full outline-none transition-all duration-150 active:scale-[0.96] active:brightness-90 hover:brightness-105 hover:shadow-[0_0_20px_rgba(244,234,215,0.3)] focus-visible:ring-2 focus-visible:ring-[#f4ead7]"
          />

          <button
            type="button"
            aria-label="看看别人怎么藏"
            onClick={() => router.push("/rooms")}
            className="absolute z-10 left-1/2 -translate-x-1/2 top-[85%] h-[5%] w-[55%] rounded-full outline-none transition-all duration-150 active:scale-[0.96] active:brightness-90 hover:brightness-105 hover:shadow-[0_0_16px_rgba(244,234,215,0.2)] focus-visible:ring-2 focus-visible:ring-[#f4ead7]"
          />
        </div>
      </main>
    </AppShell>
  );
}

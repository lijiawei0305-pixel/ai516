"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

const HOME_ART = "/assets/prototype/docx-derived/home-clean.png";

export function HomePage() {
  const router = useRouter();

  return (
    <AppShell className="bg-[#3b2417]">
      <main className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-y-auto">
        <div className="relative min-h-dvh w-full">
          <Image
            src={HOME_ART}
            alt="心事小屋首页原型底图"
            fill
            priority
            sizes="430px"
            className="object-cover"
          />

          <div className="sr-only">
            <h1>把一句话，藏进一间小屋</h1>
            <p>写下一句不太好意思直接说的话，让 AI 把它变成一间可以被朋友破解的秘密小屋。</p>
          </div>

          <button
            type="button"
            aria-label="把心事藏起来"
            onClick={() => router.push("/create")}
            className="absolute left-[5.5%] top-[76.9%] h-[9.1%] w-[81.2%] rounded-[20px] outline-none transition active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#f4ead7]"
          />

          <button
            type="button"
            aria-label="看看别人怎么藏"
            className="absolute left-[5.5%] top-[87.6%] h-[7.9%] w-[81.2%] rounded-[20px] outline-none transition active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#f4ead7]"
          />
        </div>
      </main>
    </AppShell>
  );
}

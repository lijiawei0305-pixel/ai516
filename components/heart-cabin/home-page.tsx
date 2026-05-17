import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { IllustrationStage } from "@/components/layout/illustration-stage";

const HOME_ART = "/assets/prototype/docx-derived/home-clean.webp";
const IMG_W = 941;
const IMG_H = 1576;

export function HomePage() {
  return (
    <AppShell className="bg-[#3b2417]" allowOverflow>
      <IllustrationStage artSrc={HOME_ART} artAlt="心事小屋首页" artWidth={IMG_W} artHeight={IMG_H}>
        <div className="sr-only">
          <h1>把一句话，藏进一间小屋</h1>
          <p>写下一句不太好意思直接说的话，让 AI 把它变成一间可以被朋友破解的秘密小屋。</p>
        </div>

        <Link
          href="/create"
          aria-label="把心事藏起来"
          className="absolute left-1/2 top-[76%] z-10 block h-[7.5%] w-[74%] -translate-x-1/2 touch-manipulation rounded-full outline-none transition-all duration-150 active:scale-[0.96] active:brightness-90 hover:brightness-105 hover:shadow-[0_0_20px_rgba(244,234,215,0.3)] focus-visible:ring-2 focus-visible:ring-[#f4ead7]"
        >
          <span className="sr-only">把心事藏起来</span>
        </Link>

        <Link
          href="/rooms"
          aria-label="看看别人怎么藏"
          className="absolute left-1/2 top-[85%] z-10 block h-[5%] w-[55%] -translate-x-1/2 touch-manipulation rounded-full outline-none transition-all duration-150 active:scale-[0.96] active:brightness-90 hover:brightness-105 hover:shadow-[0_0_16px_rgba(244,234,215,0.2)] focus-visible:ring-2 focus-visible:ring-[#f4ead7]"
        >
          <span className="sr-only">看看别人怎么藏</span>
        </Link>
      </IllustrationStage>
    </AppShell>
  );
}

import Image from "next/image";
import { cn } from "@/lib/utils";

type IllustrationStageProps = {
  artSrc: string;
  artAlt: string;
  artWidth: number;
  artHeight: number;
  children: React.ReactNode;
  className?: string;
  priority?: boolean;
};

function buildStageWidth(artWidth: number, artHeight: number): string {
  return `min(100%, calc((100svh - env(safe-area-inset-top) - max(env(safe-area-inset-bottom), 12px)) * ${artWidth} / ${artHeight}))`;
}

export function IllustrationStage({
  artSrc,
  artAlt,
  artWidth,
  artHeight,
  children,
  className,
  priority = true
}: IllustrationStageProps) {
  return (
    <main
      className="relative mx-auto flex min-h-[100svh] min-h-dvh w-full max-w-[430px] flex-col items-center justify-start overflow-y-auto overscroll-y-contain"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "max(env(safe-area-inset-bottom), 12px)"
      }}
    >
      <div
        className={cn("relative w-full shrink-0", className)}
        style={{
          aspectRatio: `${artWidth} / ${artHeight}`,
          width: buildStageWidth(artWidth, artHeight)
        }}
      >
        <Image
          src={artSrc}
          alt={artAlt}
          fill
          priority={priority}
          sizes="(max-width: 430px) 100vw, 430px"
          className="pointer-events-none object-contain"
        />
        {children}
      </div>
    </main>
  );
}

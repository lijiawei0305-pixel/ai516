import { Flower2, Heart, Moon, Sparkles, Star } from "lucide-react";
import { StickerTag } from "@/components/handbook/sticker-tag";
import { cn } from "@/lib/utils";

export function Stamp({ className }: { className?: string }) {
  return (
    <div className={cn("text-coffee/25", className)}>
      <div className="torn-edge paper-grain ml-auto flex h-16 w-12 items-center justify-center border border-coffee/12 bg-cream">
        <Flower2 className="h-8 w-8 text-sage/70" strokeWidth={1.4} />
      </div>
      <div className="-mt-3 h-12 w-20 rounded-full border-2 border-coffee/15" />
    </div>
  );
}

export function MiniCabin({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-44 w-56", className)}>
      <div className="absolute bottom-0 left-6 h-28 w-44 rounded-[4px] bg-[#c9a079] shadow-paper">
        <div className="absolute -top-14 left-1/2 h-28 w-36 -translate-x-1/2 rotate-45 bg-[#8e4b2d] shadow-sticker" />
        <div className="absolute inset-2 border border-coffee/12" />
        <div className="absolute bottom-0 left-1/2 h-20 w-12 -translate-x-1/2 rounded-t-full bg-warm-orange shadow-[0_0_18px_rgba(255,188,84,0.85)]" />
        <div className="absolute bottom-10 left-5 h-10 w-9 bg-cream/70 shadow-insetPaper" />
        <div className="absolute bottom-10 right-5 h-10 w-9 bg-[#ffd477]/80 shadow-[0_0_14px_rgba(255,196,88,0.72)]" />
        <StickerTag className="absolute left-1/2 top-9 -translate-x-1/2 text-xs">心事小屋</StickerTag>
      </div>
      <div className="absolute bottom-1 left-0 h-14 w-8 rounded-t-full border-4 border-cream" />
      <div className="absolute bottom-1 right-0 h-14 w-8 rounded-t-full border-4 border-cream" />
      <div className="absolute bottom-8 right-7 h-9 w-8 rounded-t-full bg-brick-red" />
    </div>
  );
}

export function MiniWindow() {
  return (
    <div className="flex h-full items-end justify-center bg-[linear-gradient(#b9c0ad,#f0c58b)] p-3">
      <div className="grid h-20 w-20 grid-cols-2 gap-1 border-4 border-[#8b5d37] bg-[#ffd88f]/60 p-1">
        <span className="bg-cream/55" />
        <span className="bg-cream/55" />
        <span className="bg-cream/55" />
        <span className="bg-cream/55" />
      </div>
    </div>
  );
}

export function MiniDoor({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-72 w-56", className)}>
      <div className="absolute bottom-0 left-1/2 h-64 w-40 -translate-x-1/2 rounded-t-full bg-[#9b6a43] shadow-paper">
        <div className="absolute inset-3 rounded-t-full border border-coffee/25" />
        <div className="absolute inset-x-4 top-0 h-full bg-[repeating-linear-gradient(90deg,transparent_0_20px,rgba(55,32,16,0.18)_20px_22px)]" />
        <Heart className="absolute left-1/2 top-24 h-7 w-7 -translate-x-1/2 text-coffee/65" />
        <span className="absolute right-7 top-36 h-3 w-3 rounded-full bg-parchment shadow-sticker" />
      </div>
      <div className="absolute bottom-0 left-0 h-12 w-16 bg-cream/40" />
      <div className="absolute bottom-0 right-0 h-12 w-16 bg-cream/40" />
      <Sparkles className="absolute left-0 top-24 h-9 w-9 text-warm-orange" />
      <Sparkles className="absolute right-0 top-36 h-8 w-8 text-warm-orange" />
    </div>
  );
}

export function RoomStage() {
  return (
    <div className="absolute inset-x-0 top-0 h-[390px]">
      <div className="absolute left-1/2 top-0 h-[360px] w-[94%] -translate-x-1/2 overflow-hidden bg-[#b58d67] shadow-paper [clip-path:polygon(4%_26%,50%_0,96%_26%,96%_100%,4%_100%)]">
        <div className="absolute left-0 top-0 h-full w-full bg-[repeating-linear-gradient(90deg,rgba(74,45,25,0.28)_0_2px,transparent_2px_46px),linear-gradient(180deg,#c49c72,#8e6344)]" />
        <div className="absolute left-8 top-24 h-28 w-20 border-4 border-[#6e4427] bg-[#f2c06c]/35" />
        <div className="absolute right-8 top-20 h-32 w-24 border-4 border-[#6e4427] bg-[#182233]">
          <Moon className="absolute left-8 top-4 h-9 w-9 text-[#ffd976]" />
          <Star className="absolute bottom-5 right-4 h-5 w-5 text-[#ffd976]" />
        </div>
        <div className="absolute left-28 top-36 h-24 w-40 bg-[#744a2e] shadow-sticker" />
        <div className="absolute bottom-24 left-1/2 h-24 w-36 -translate-x-1/2 rounded bg-[#805333] shadow-sticker" />
        <div className="absolute bottom-10 left-20 h-20 w-14 bg-[#805333]" />
        <div className="absolute bottom-10 right-20 h-20 w-14 bg-[#805333]" />
        <div className="absolute left-1/2 top-20 h-12 w-12 -translate-x-1/2 rounded-full bg-[#ffd470] shadow-[0_0_28px_rgba(255,205,96,0.95)]" />
      </div>
    </div>
  );
}

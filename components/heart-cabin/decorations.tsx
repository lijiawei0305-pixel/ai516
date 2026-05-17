import Image from "next/image";
import { Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

const docxAssets = {
  cabin: "/assets/prototype/docx-derived/home-cabin-collage.png",
  polaroid: "/assets/prototype/docx-derived/home-polaroid-collage.png",
  room: "/assets/prototype/docx-derived/play-room-collage.png"
};

export function Stamp({ className }: { className?: string }) {
  return (
    <div className={cn("text-coffee/25", className)}>
      <div className="ml-auto flex h-16 w-12 items-center justify-center border border-coffee/12 bg-cream/80 shadow-sticker">
        <Flower2 className="h-8 w-8 text-sage/70" strokeWidth={1.4} />
      </div>
      <div className="-mt-3 h-12 w-20 rounded-full border-2 border-coffee/15" />
    </div>
  );
}

export function MiniCabin({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-44 w-56", className)}>
      <Image
        src={docxAssets.cabin}
        alt=""
        fill
        sizes="330px"
        className="pointer-events-none object-contain drop-shadow-[0_18px_24px_rgba(55,32,16,0.28)]"
      />
    </div>
  );
}

export function MiniWindow() {
  return (
    <div className="relative h-full w-full">
      <Image src={docxAssets.polaroid} alt="" fill sizes="160px" className="pointer-events-none object-cover" />
    </div>
  );
}

export function MiniDoor({ className }: { className?: string }) {
  return <MiniCabin className={cn("h-[300px] w-[350px]", className)} />;
}

export function RoomStage() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[390px]">
      <Image
        src={docxAssets.room}
        alt=""
        fill
        sizes="430px"
        className="pointer-events-none object-contain drop-shadow-[0_18px_24px_rgba(55,32,16,0.28)]"
      />
    </div>
  );
}

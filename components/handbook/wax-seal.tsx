import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

type WaxSealProps = {
  className?: string;
};

export function WaxSeal({ className }: WaxSealProps) {
  return (
    <span
      className={cn(
        "relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-wax-red text-parchment shadow-[inset_0_2px_5px_rgba(255,255,255,0.22),inset_0_-7px_10px_rgba(54,8,4,0.26),0_9px_14px_rgba(68,29,18,0.26)]",
        "before:absolute before:-left-1 before:top-4 before:h-8 before:w-8 before:rounded-full before:bg-wax-red before:content-[''] after:absolute after:-right-1 after:bottom-3 after:h-7 after:w-8 after:rounded-full after:bg-wax-red after:content-['']",
        className
      )}
    >
      <Sprout className="relative z-10 h-8 w-8" strokeWidth={1.7} />
    </span>
  );
}
